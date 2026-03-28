"use client";

import { useState, useMemo } from "react";
import {
  useTransactions,
  useCompanies,
  useAccounts,
  useAddAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/lib/supabase-queries";
import { computeAccountsWithBalances } from "@/lib/supabase-data";
import { Account } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  ArrowRightLeft,
  Pencil,
  Check,
  X,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useCurrency } from "@/components/currency-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AccountsPage() {
  const { displayCurrency, formatDisplay, exchangeRate } = useCurrency();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: companies = [], isLoading: compLoading } = useCompanies();
  const { data: rawAccounts = [], isLoading: accLoading } = useAccounts();
  const addAccountMutation = useAddAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const loading = txLoading || compLoading || accLoading;

  // Compute accounts with balances
  const accounts = useMemo(() => {
    return computeAccountsWithBalances(rawAccounts, transactions);
  }, [rawAccounts, transactions]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: "",
    balance: "",
  });

  // Adding state
  const [showAdd, setShowAdd] = useState(false);
  const [newAcct, setNewAcct] = useState({
    companyId: "",
    name: "",
    currency: "EUR" as "EUR" | "ALL",
    balance: "",
  });

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Handlers ─────────────────────────────────
  function startEdit(acct: Account) {
    setEditingId(acct.id);
    const raw = rawAccounts.find(a => a.id === acct.id);
    setEditValues({
      name: acct.name,
      balance: raw?.balance?.toString() || "0",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      await updateAccountMutation.mutateAsync({
        id: editingId,
        name: editValues.name,
        balance: parseFloat(editValues.balance) || 0,
      });
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    try {
      await deleteAccountMutation.mutateAsync(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAdd() {
    if (!newAcct.companyId || !newAcct.name) {
      toast.error("Please fill in company and name");
      return;
    }

    try {
      await addAccountMutation.mutateAsync({
        company_id: newAcct.companyId,
        name: newAcct.name,
        currency: newAcct.currency,
        type: "bank",
        balance: parseFloat(newAcct.balance) || 0,
      });

      setShowAdd(false);
      setNewAcct({
        companyId: companies[0]?.id ?? "",
        name: "",
        currency: "EUR",
        balance: "",
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  // ── Totals ───────────────────────────────────
  const total = accounts.reduce((sum, b) => {
    const bal = b.balance || 0;
    if (b.currency === displayCurrency) return sum + bal;
    if (b.currency === "EUR" && displayCurrency === "ALL")
      return sum + bal * exchangeRate;
    return sum + bal / exchangeRate;
  }, 0);

  // Group by company
  const grouped = companies
    .map((c) => ({
      company: c,
      accts: accounts.filter((a) => a.company_id === c.id),
    }))
    .filter((g) => g.accts.length > 0);

  // If adding, ensure we have companies
  if (showAdd && !newAcct.companyId && companies.length > 0) {
    setNewAcct(p => ({ ...p, companyId: companies[0].id }));
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="mt-1 text-muted-foreground">
            Manage EUR and ALL accounts for each entity.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 w-fit">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Add Account Inline */}
      {showAdd && (
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1 w-48">
                <label className="text-xs font-medium text-muted-foreground">
                  Company
                </label>
                <Select
                  value={newAcct.companyId}
                  onValueChange={(val) => setNewAcct(p => ({ ...p, companyId: val }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 w-32">
                <label className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <Input
                  className="h-9"
                  placeholder="e.g. Main Bank"
                  value={newAcct.name}
                  onChange={e => setNewAcct(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1 w-24">
                <label className="text-xs font-medium text-muted-foreground">
                  Currency
                </label>
                <Select
                  value={newAcct.currency}
                  onValueChange={(val: "EUR" | "ALL") => setNewAcct(p => ({ ...p, currency: val }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="ALL">ALL (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 w-24">
                <label className="text-xs font-medium text-muted-foreground">
                  Initial Bal.
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9"
                  value={newAcct.balance}
                  onChange={(e) =>
                    setNewAcct((p) => ({ ...p, balance: e.target.value }))
                  }
                />
              </div>

              <Button size="sm" className="h-9" onClick={handleAdd} disabled={addAccountMutation.isPending}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ArrowRightLeft className="h-4 w-4" />
            Total Across All Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-xs text-muted-foreground">
              Total in {displayCurrency}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {displayCurrency === "EUR" ? "€" : "L"}
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: displayCurrency === "EUR" ? 2 : 0,
                maximumFractionDigits: displayCurrency === "EUR" ? 2 : 0,
              }).format(total)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              at €/L {exchangeRate.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company sections */}
      {grouped.map(({ company, accts }) => (
        <div key={company.id} className="space-y-3">
          <h2 className="text-lg font-semibold">{company.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {accts.map((acct) => {
              const isEditing = editingId === acct.id;

              return (
                <Card key={acct.id} className="group relative">
                  {/* Action buttons */}
                  {!isEditing && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => startEdit(acct)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => setConfirmDeleteId(acct.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        {isEditing ? (
                          <Input
                            value={editValues.name}
                            onChange={e => setEditValues(p => ({ ...p, name: e.target.value }))}
                            className="h-7 text-sm font-medium w-32"
                          />
                        ) : (
                          <CardTitle className="text-sm font-medium">
                            {acct.name}
                          </CardTitle>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {acct.currency === "EUR" ? "Euro" : "Albanian Lek"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {acct.currency}
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Initial Balance (Not Total)
                          </label>
                          <Input
                            type="number"
                            value={editValues.balance}
                            onChange={(e) =>
                              setEditValues((p) => ({
                                ...p,
                                balance: e.target.value,
                              }))
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={saveEdit}
                            disabled={updateAccountMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1.5"
                            onClick={cancelEdit}
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p
                            className={`text-2xl font-bold tracking-tight ${
                              (acct.balance || 0) >= 0
                                ? "text-foreground"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatDisplay(acct.balance || 0, acct.currency)}
                          </p>
                          {acct.currency !== displayCurrency && (
                            <p className="text-xs text-muted-foreground">
                              Original: {acct.currency === "EUR" ? "€" : "L"}
                              {new Intl.NumberFormat("en-US", {
                                minimumFractionDigits:
                                  acct.currency === "EUR" ? 2 : 0,
                                maximumFractionDigits:
                                  acct.currency === "EUR" ? 2 : 0,
                              }).format(acct.balance || 0)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {formatDisplay(acct.inflows || 0, acct.currency)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {formatDisplay(acct.outflows || 0, acct.currency)}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/finance/transactions?account=${acct.id}`}
                            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Transactions
                          </Link>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state override if no accounts but we have companies */}
      {!loading && accounts.length === 0 && !showAdd && (
         <Card className="py-12 text-center">
           <p className="text-muted-foreground mb-4">
             No accounts created yet.
           </p>
           <Button onClick={() => setShowAdd(true)}>
             <Plus className="mr-2 h-4 w-4" />
             Create First Account
           </Button>
         </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteAccountMutation.isPending}
      />
    </div>
  );
}
