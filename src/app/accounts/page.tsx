"use client";

import { useState } from "react";
import {
  getAccountBalances,
  companies as defaultCompanies,
  type AccountBalance,
  type Company,
} from "@/lib/dummy-data";
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
} from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

type EditableAccount = AccountBalance & { id: string };

function makeId(companyId: string, currency: string) {
  return `${companyId}-${currency}`;
}

export default function AccountsPage() {
  const { displayCurrency, formatDisplay, exchangeRate } = useCurrency();

  // Stateful accounts
  const [accounts, setAccounts] = useState<EditableAccount[]>(() =>
    getAccountBalances().map((a) => ({
      ...a,
      id: makeId(a.companyId, a.currency),
    }))
  );
  const [companies, setCompanies] = useState<Company[]>(defaultCompanies);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    balance: "",
    inflows: "",
    outflows: "",
  });

  // Adding state
  const [showAdd, setShowAdd] = useState(false);
  const [newAcct, setNewAcct] = useState({
    companyId: companies[0]?.id ?? "",
    currency: "EUR" as "EUR" | "ALL",
    balance: "",
  });

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Handlers ─────────────────────────────────
  function startEdit(acct: EditableAccount) {
    setEditingId(acct.id);
    setEditValues({
      balance: acct.balance.toString(),
      inflows: acct.inflows.toString(),
      outflows: acct.outflows.toString(),
    });
  }

  function saveEdit() {
    if (!editingId) return;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === editingId
          ? {
              ...a,
              balance: parseFloat(editValues.balance) || 0,
              inflows: parseFloat(editValues.inflows) || 0,
              outflows: parseFloat(editValues.outflows) || 0,
            }
          : a
      )
    );
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function deleteAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setConfirmDelete(null);
  }

  function addAccount() {
    const existing = accounts.find(
      (a) =>
        a.companyId === newAcct.companyId && a.currency === newAcct.currency
    );
    if (existing) return; // already exists

    const company = companies.find((c) => c.id === newAcct.companyId);
    if (!company) return;

    const id = makeId(newAcct.companyId, newAcct.currency);
    setAccounts((prev) => [
      ...prev,
      {
        id,
        companyId: newAcct.companyId,
        companyName: company.name,
        currency: newAcct.currency,
        balance: parseFloat(newAcct.balance) || 0,
        inflows: 0,
        outflows: 0,
      },
    ]);
    setShowAdd(false);
    setNewAcct({ companyId: companies[0]?.id ?? "", currency: "EUR", balance: "" });
  }

  // ── Totals ───────────────────────────────────
  const total = accounts.reduce((sum, b) => {
    if (b.currency === displayCurrency) return sum + b.balance;
    if (b.currency === "EUR" && displayCurrency === "ALL")
      return sum + b.balance * exchangeRate;
    return sum + b.balance / exchangeRate;
  }, 0);

  // Group by company
  const grouped = companies
    .map((c) => ({
      company: c,
      accts: accounts.filter((a) => a.companyId === c.id),
    }))
    .filter((g) => g.accts.length > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="mt-1 text-muted-foreground">
            Manage EUR and ALL balances for each entity.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Add Account Inline */}
      {showAdd && (
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Company
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={newAcct.companyId}
                  onChange={(e) =>
                    setNewAcct((p) => ({ ...p, companyId: e.target.value }))
                  }
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Currency
                </label>
                <select
                  className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={newAcct.currency}
                  onChange={(e) =>
                    setNewAcct((p) => ({
                      ...p,
                      currency: e.target.value as "EUR" | "ALL",
                    }))
                  }
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="ALL">ALL (L)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Initial Balance
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 w-32"
                  value={newAcct.balance}
                  onChange={(e) =>
                    setNewAcct((p) => ({ ...p, balance: e.target.value }))
                  }
                />
              </div>
              <Button size="sm" className="h-9" onClick={addAccount}>
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
              const isConfirmingDelete = confirmDelete === acct.id;

              return (
                <Card key={acct.id} className="group relative">
                  {/* Action buttons */}
                  {!isEditing && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => startEdit(acct)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => deleteAccount(acct.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setConfirmDelete(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-500"
                          onClick={() => setConfirmDelete(acct.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}

                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {acct.currency} Account
                        </CardTitle>
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
                      /* ── Edit Mode ── */
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Balance
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
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                              Inflows
                            </label>
                            <Input
                              type="number"
                              value={editValues.inflows}
                              onChange={(e) =>
                                setEditValues((p) => ({
                                  ...p,
                                  inflows: e.target.value,
                                }))
                              }
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">
                              Outflows
                            </label>
                            <Input
                              type="number"
                              value={editValues.outflows}
                              onChange={(e) =>
                                setEditValues((p) => ({
                                  ...p,
                                  outflows: e.target.value,
                                }))
                              }
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={saveEdit}
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
                      /* ── Display Mode ── */
                      <>
                        <div>
                          <p
                            className={`text-2xl font-bold tracking-tight ${
                              acct.balance >= 0
                                ? "text-foreground"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatDisplay(acct.balance, acct.currency)}
                          </p>
                          {acct.currency !== displayCurrency && (
                            <p className="text-xs text-muted-foreground">
                              Original: {acct.currency === "EUR" ? "€" : "L"}
                              {new Intl.NumberFormat("en-US", {
                                minimumFractionDigits:
                                  acct.currency === "EUR" ? 2 : 0,
                                maximumFractionDigits:
                                  acct.currency === "EUR" ? 2 : 0,
                              }).format(acct.balance)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {formatDisplay(acct.inflows, acct.currency)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              {formatDisplay(acct.outflows, acct.currency)}
                            </span>
                          </div>
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

      {/* Empty state */}
      {accounts.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">
            No accounts yet. Click &quot;Add Account&quot; to get started.
          </p>
        </Card>
      )}
    </div>
  );
}
