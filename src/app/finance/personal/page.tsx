"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  useTransactions,
  useAccounts,
  useAddAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/lib/supabase-queries";
import { computeAccountsWithBalances } from "@/lib/supabase-data";
import { supabase } from "@/lib/supabase";
import { Account, formatCurrencyFull } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Upload,
  FileText,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCurrency } from "@/components/currency-provider";
import { toast } from "sonner";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ParsedTransaction = {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
};

type ParseResult = {
  currency: "EUR" | "ALL";
  accountName: string;
  iban: string;
  transactions: ParsedTransaction[];
  totalTransactions: number;
};

export default function PersonalAccountsPage() {
  const { user } = useAuth();
  const { displayCurrency, formatDisplay, exchangeRate } = useCurrency();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: rawAccounts = [], isLoading: accLoading } = useAccounts();
  const addAccountMutation = useAddAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const loading = txLoading || accLoading;

  // Only personal accounts
  const personalAccounts = useMemo(() => {
    const personal = rawAccounts.filter((a) => a.is_personal);
    return computeAccountsWithBalances(personal, transactions);
  }, [rawAccounts, transactions]);

  // State
  const [showAdd, setShowAdd] = useState(false);
  const [newAcct, setNewAcct] = useState({
    name: "",
    currency: "EUR" as "EUR" | "ALL",
    balance: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: "", balance: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Import state
  const [importAccountId, setImportAccountId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // Handlers
  function startEdit(acct: Account) {
    setEditingId(acct.id);
    const raw = rawAccounts.find((a) => a.id === acct.id);
    setEditValues({ name: acct.name, balance: raw?.balance?.toString() || "0" });
  }

  async function saveEdit() {
    if (!editingId) return;
    await updateAccountMutation.mutateAsync({
      id: editingId,
      name: editValues.name,
      balance: parseFloat(editValues.balance) || 0,
    });
    setEditingId(null);
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    await deleteAccountMutation.mutateAsync(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  async function handleAdd() {
    if (!newAcct.name) {
      toast.error("Please enter a name");
      return;
    }
    await addAccountMutation.mutateAsync({
      name: newAcct.name,
      currency: newAcct.currency,
      type: "bank",
      balance: parseFloat(newAcct.balance) || 0,
      is_personal: true,
    });
    setShowAdd(false);
    setNewAcct({ name: "", currency: "EUR", balance: "" });
  }

  // Import handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setParseResult(null);
      setParseError("");
      setImportedCount(null);
    }
  };

  const handleParse = useCallback(async () => {
    if (!file) return;
    setParsing(true);
    setParseError("");
    setParseResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import-statement", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setParseError(data.error || "Failed to parse PDF"); return; }
      setParseResult(data);
    } catch {
      setParseError("Failed to parse PDF.");
    } finally {
      setParsing(false);
    }
  }, [file]);

  const handleImport = useCallback(async () => {
    if (!parseResult || !user || !importAccountId) return;
    setImporting(true);
    try {
      const { data: existing } = await supabase
        .from("transactions")
        .select("date, amount, description")
        .eq("user_id", user.id)
        .eq("account_id", importAccountId);

      const existingSet = new Set(
        (existing ?? []).map((t) => `${t.date}|${t.amount}|${t.description?.substring(0, 30)}`)
      );

      const acct = rawAccounts.find((a) => a.id === importAccountId);

      const newTxs = parseResult.transactions
        .filter((tx) => {
          const amount = tx.credit ?? tx.debit ?? 0;
          const key = `${tx.date}|${amount}|${tx.description?.substring(0, 30)}`;
          return !existingSet.has(key);
        })
        .map((tx) => {
          const amount = tx.credit ?? tx.debit ?? 0;
          return {
            user_id: user.id,
            company_id: acct?.company_id,
            account_id: importAccountId,
            date: tx.date,
            description: tx.description,
            amount,
            type: tx.credit ? "income" : "expense",
            status: "paid",
            category: "personal_withdrawal",
            currency: parseResult.currency,
            source_type: "personal",
            recurrence: "one_time",
          };
        });

      if (newTxs.length === 0) {
        toast.info("All transactions already imported.");
        setImportedCount(0);
        setImporting(false);
        return;
      }

      let imported = 0;
      for (let i = 0; i < newTxs.length; i += 50) {
        const batch = newTxs.slice(i, i + 50);
        const { error: insertErr } = await supabase.from("transactions").insert(batch);
        if (insertErr) throw new Error(insertErr.message);
        imported += batch.length;
      }
      setImportedCount(imported);
      toast.success(`Imported ${imported} personal transactions`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }, [parseResult, user, importAccountId, rawAccounts]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  // Totals
  const total = personalAccounts.reduce((sum, b) => {
    const bal = b.balance || 0;
    if (b.currency === displayCurrency) return sum + bal;
    if (b.currency === "EUR" && displayCurrency === "ALL") return sum + bal * exchangeRate;
    return sum + bal / exchangeRate;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-violet-500" />
            Personal Accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track personal bank accounts and withdrawals separately from business.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 w-fit">
          <Plus className="h-4 w-4" />
          Add Personal Account
        </Button>
      </div>

      {/* Add Account Inline */}
      {showAdd && (
        <Card className="border-dashed border-2 border-violet-500/30">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1 w-48">
                <label className="text-xs font-medium text-muted-foreground">Account Name</label>
                <Input className="h-9" placeholder="e.g. My Personal BKT" value={newAcct.name} onChange={(e) => setNewAcct((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1 w-24">
                <label className="text-xs font-medium text-muted-foreground">Currency</label>
                <Select value={newAcct.currency} onValueChange={(val: "EUR" | "ALL") => setNewAcct((p) => ({ ...p, currency: val }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="ALL">ALL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 w-24">
                <label className="text-xs font-medium text-muted-foreground">Initial Bal.</label>
                <Input type="number" placeholder="0" className="h-9" value={newAcct.balance} onChange={(e) => setNewAcct((p) => ({ ...p, balance: e.target.value }))} />
              </div>
              <Button size="sm" className="h-9" onClick={handleAdd} disabled={addAccountMutation.isPending}>Add</Button>
              <Button size="sm" variant="ghost" className="h-9" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Card */}
      {personalAccounts.length > 0 && (
        <Card className="border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Total Personal Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">
              {displayCurrency === "EUR" ? "€" : "L"}
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: displayCurrency === "EUR" ? 2 : 0,
                maximumFractionDigits: displayCurrency === "EUR" ? 2 : 0,
              }).format(total)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Account Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {personalAccounts.map((acct) => {
          const isEditing = editingId === acct.id;
          return (
            <Card key={acct.id} className="group relative">
              {!isEditing && (
                <div className="absolute right-3 top-3 flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => startEdit(acct)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => setConfirmDeleteId(acct.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                    <User className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    {isEditing ? (
                      <Input value={editValues.name} onChange={(e) => setEditValues((p) => ({ ...p, name: e.target.value }))} className="h-7 text-sm font-medium w-32" />
                    ) : (
                      <CardTitle className="text-sm font-medium">{acct.name}</CardTitle>
                    )}
                    <p className="text-xs text-muted-foreground">{acct.currency === "EUR" ? "Euro" : "Albanian Lek"}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono">{acct.currency}</Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Initial Balance</label>
                      <Input type="number" value={editValues.balance} onChange={(e) => setEditValues((p) => ({ ...p, balance: e.target.value }))} className="h-9" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="h-8 gap-1.5" onClick={saveEdit} disabled={updateAccountMutation.isPending}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={`text-2xl font-bold tracking-tight ${(acct.balance || 0) >= 0 ? "text-foreground" : "text-red-600 dark:text-red-400"}`}>
                      {formatDisplay(acct.balance || 0, acct.currency)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatDisplay(acct.inflows || 0, acct.currency)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-600 dark:text-red-400 font-medium">{formatDisplay(acct.outflows || 0, acct.currency)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          onClick={() => {
                            setImportAccountId(acct.id);
                            setFile(null);
                            setParseResult(null);
                            setParseError("");
                            setImportedCount(null);
                          }}
                        >
                          <Upload className="h-3 w-3" /> Import PDF
                        </Button>
                        <Link href={`/finance/transactions?account=${acct.id}`} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                          <Eye className="h-3.5 w-3.5" /> Transactions
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {personalAccounts.length === 0 && !showAdd && (
        <Card className="py-12 text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">No personal accounts yet.</p>
          <Button onClick={() => setShowAdd(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Personal Account
          </Button>
        </Card>
      )}

      {/* Import Panel */}
      {importAccountId && (
        <Card className="rounded-xl shadow-sm border-violet-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Statement — {rawAccounts.find((a) => a.id === importAccountId)?.name}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setImportAccountId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload */}
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-violet-500/50 bg-muted/30 px-6 py-6 cursor-pointer transition-colors">
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                {file ? (
                  <>
                    <FileText className="h-6 w-6 text-violet-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm">Click to upload bank statement PDF</p>
                  </>
                )}
              </label>
              <Button onClick={handleParse} disabled={!file || parsing} className="shrink-0">
                {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Parse
              </Button>
            </div>

            {parseError && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {parseError}
              </div>
            )}

            {/* Preview */}
            {parseResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full">{parseResult.currency}</Badge>
                  <Badge variant="outline" className="rounded-full">{parseResult.totalTransactions} transactions</Badge>
                  {parseResult.iban && <span className="text-xs text-muted-foreground">{parseResult.iban}</span>}
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Description</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parseResult.transactions.map((tx, i) => {
                          const amount = tx.credit ?? (tx.debit ? -tx.debit : 0);
                          const isCredit = !!tx.credit;
                          return (
                            <tr key={i} className="hover:bg-muted/20">
                              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                              <td className="px-3 py-2 max-w-[250px] truncate">{tx.description}</td>
                              <td className={`px-3 py-2 text-right font-medium tabular-nums whitespace-nowrap ${isCredit ? "text-emerald-600" : "text-red-600"}`}>
                                <span className="inline-flex items-center gap-1">
                                  {isCredit ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                  {formatCurrencyFull(Math.abs(amount), parseResult.currency)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                                {tx.balance !== null ? formatCurrencyFull(tx.balance, parseResult.currency) : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    {importedCount !== null
                      ? importedCount > 0 ? `${importedCount} transactions imported` : "All already imported"
                      : `${parseResult.totalTransactions} ready to import as personal`}
                  </p>
                  <Button onClick={handleImport} disabled={importing || importedCount !== null} size="lg">
                    {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : importedCount !== null ? <Check className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                    {importing ? "Importing..." : importedCount !== null ? "Done" : "Import All"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
        title="Delete Personal Account"
        description="Are you sure? This will not delete the transactions linked to this account."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteAccountMutation.isPending}
      />
    </div>
  );
}
