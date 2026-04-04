"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAccounts, useAddAccount } from "@/lib/supabase-queries";
import { useCompanies } from "@/lib/supabase-queries";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Check,
  X,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatCurrencyFull } from "@/lib/types";

type ParsedTransaction = {
  date: string;
  description: string;
  reference: string | null;
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

export default function ImportStatementPage() {
  const { user } = useAuth();
  const { data: companies = [] } = useCompanies();
  const { data: existingAccounts = [] } = useAccounts();

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("new");
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [accountType, setAccountType] = useState<"business" | "personal">("business");

  // Filter accounts based on selected type
  const filteredAccounts = existingAccounts.filter((a) =>
    accountType === "personal" ? a.is_personal : !a.is_personal
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      setError("");
      setImportedCount(null);
    }
  };

  const handleParse = useCallback(async () => {
    if (!file) return;
    setParsing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import-statement", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Failed to parse PDF (${res.status})`);
        return;
      }

      setResult(data);

      // Auto-select company if only one exists
      if (companies.length === 1) {
        setSelectedCompanyId(companies[0].id);
      }

      // Auto-select existing account if name+currency matches
      const matchingAccount = existingAccounts.find(
        (a) => a.name === data.accountName && a.currency === data.currency
      );
      if (matchingAccount) {
        setSelectedAccountId(matchingAccount.id);
      } else {
        setSelectedAccountId("new");
      }
    } catch {
      setError("Failed to parse PDF. Make sure it's a valid bank statement.");
    } finally {
      setParsing(false);
    }
  }, [file, companies]);

  const handleImport = useCallback(async () => {
    if (!result || !user) return;
    if (accountType === "business" && !selectedCompanyId) return;
    setImporting(true);

    try {
      let accountId = selectedAccountId;

      // Find or create account
      if (accountId === "new") {
        // First check if account with same name+currency+is_personal already exists
        const { data: existingAcc } = await supabase
          .from("financial_accounts")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", result.accountName)
          .eq("currency", result.currency)
          .eq("is_personal", accountType === "personal")
          .maybeSingle();

        if (existingAcc) {
          accountId = existingAcc.id;
        } else {
          const { data: newAcc, error: accErr } = await supabase
            .from("financial_accounts")
            .insert({
              user_id: user.id,
              company_id: selectedCompanyId || null,
              name: result.accountName,
              currency: result.currency,
              type: "bank",
              balance: 0,
              is_personal: accountType === "personal",
            })
            .select("id")
            .single();

          if (accErr) throw new Error(accErr.message);
          accountId = newAcc.id;
        }
      }

      // Get existing bank_references for this account to detect duplicates
      const { data: existingRefs } = await supabase
        .from("transactions")
        .select("bank_reference")
        .eq("user_id", user.id)
        .eq("account_id", accountId)
        .not("bank_reference", "is", null);

      const existingRefSet = new Set(
        (existingRefs ?? []).map((t) => t.bank_reference)
      );

      // Get all transfer transactions from OTHER accounts (to detect cross-account movements)
      const { data: otherTransfers } = await supabase
        .from("transactions")
        .select("date, amount, category")
        .eq("user_id", user.id)
        .eq("category", "transfer")
        .neq("account_id", accountId);

      const transferSet = new Set(
        (otherTransfers ?? []).map((t) => `${t.date}|${Math.abs(Number(t.amount))}`)
      );

      // Prepare transactions: skip ones with existing bank_reference
      const newTxs = result.transactions
        .filter((tx) => {
          // If this transaction has a reference and it already exists, skip it
          if (tx.reference && existingRefSet.has(tx.reference)) {
            return false;
          }
          return true;
        })
        .map((tx) => {
          const amount = tx.credit ?? tx.debit ?? 0;
          let category = categorize(tx.description);

          // If not already a transfer, check if the other account has a matching
          // transfer on the same date with same amount — means it's cross-account
          if (category !== "transfer") {
            const matchKey = `${tx.date}|${Math.abs(amount)}`;
            if (transferSet.has(matchKey)) {
              category = "transfer";
            }
          }

          return {
            user_id: user.id,
            company_id: selectedCompanyId || null,
            account_id: accountId,
            date: tx.date,
            description: tx.description,
            bank_reference: tx.reference,
            amount,
            type: tx.credit ? "income" : "expense",
            status: "paid",
            category: accountType === "personal" ? "personal_withdrawal" : category,
            currency: result.currency,
            source_type: accountType,
            recurrence: "one_time",
          };
        });

      if (newTxs.length === 0) {
        toast.info("All transactions already exist — nothing to import.");
        setImportedCount(0);
        setImporting(false);
        return;
      }

      // Upsert in batches of 50 — on conflict of bank_reference+account_id, update the row
      let imported = 0;
      for (let i = 0; i < newTxs.length; i += 50) {
        const batch = newTxs.slice(i, i + 50);

        // Split: transactions WITH reference use upsert, WITHOUT reference use insert
        const withRef = batch.filter((t) => t.bank_reference);
        const withoutRef = batch.filter((t) => !t.bank_reference);

        if (withRef.length > 0) {
          const { error: upsertErr } = await supabase
            .from("transactions")
            .upsert(withRef, {
              onConflict: "bank_reference,account_id",
              ignoreDuplicates: true,
            });
          if (upsertErr) throw new Error(upsertErr.message);
        }

        if (withoutRef.length > 0) {
          const { error: insertErr } = await supabase
            .from("transactions")
            .insert(withoutRef);
          if (insertErr) throw new Error(insertErr.message);
        }

        imported += batch.length;
      }

      setImportedCount(imported);
      toast.success(`Imported ${imported} new transactions`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }, [result, user, selectedCompanyId, selectedAccountId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Import Statement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a bank statement PDF to import transactions automatically.
        </p>
      </div>

      {/* Step 1: Upload */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">1. Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 px-6 py-8 cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB — Click to change
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Click to upload statement</p>
                    <p className="text-xs text-muted-foreground">
                      PDF files from BKT or similar banks
                    </p>
                  </div>
                </>
              )}
            </label>
            <Button
              onClick={handleParse}
              disabled={!file || parsing}
              className="shrink-0"
            >
              {parsing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Parse
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Preview */}
      {result && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">2. Preview & Configure</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {result.currency}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {result.totalTransactions} transactions
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account info */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Detected Account
                  </p>
                  <p className="text-sm font-medium">{result.accountName}</p>
                  {result.iban && (
                    <p className="text-xs text-muted-foreground mt-0.5">{result.iban}</p>
                  )}
                </div>
                {accountType === "business" && (
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Company
                    </p>
                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Account Type
                  </p>
                  <Select value={accountType} onValueChange={(v) => { setAccountType(v as "business" | "personal"); setSelectedAccountId("new"); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business Account</SelectItem>
                      <SelectItem value="personal">Personal Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Import to Account
                  </p>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        + Create new: {result.accountName}
                      </SelectItem>
                      {filteredAccounts
                        .filter((a) => a.currency === result.currency)
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Transaction preview */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
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
                    {result.transactions.map((tx, i) => {
                      const amount = tx.credit ?? (tx.debit ? -tx.debit : 0);
                      const isCredit = !!tx.credit;
                      return (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                          <td className="px-3 py-2 max-w-[300px] truncate">{tx.description}</td>
                          <td className={`px-3 py-2 text-right font-medium tabular-nums whitespace-nowrap ${isCredit ? "text-emerald-600" : "text-red-600"}`}>
                            <span className="inline-flex items-center gap-1">
                              {isCredit ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                              {formatCurrencyFull(Math.abs(amount), result.currency)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                            {tx.balance !== null ? formatCurrencyFull(tx.balance, result.currency) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Import button */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {importedCount !== null
                  ? importedCount > 0
                    ? `✓ ${importedCount} transactions imported`
                    : "All transactions already exist"
                  : `${result.totalTransactions} transactions ready to import`}
              </p>
              <Button
                onClick={handleImport}
                disabled={importing || (accountType === "business" && !selectedCompanyId) || importedCount !== null}
                size="lg"
              >
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : importedCount !== null ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {importing ? "Importing..." : importedCount !== null ? "Done" : "Import All"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Auto-categorize based on description keywords
function categorize(desc: string): string {
  const d = desc.toLowerCase();
  // Transfer = only currency exchange between own accounts (same money, different currency)
  if (/exchange transaction|branch exchange/.test(d)) return "transfer";
  if (/account to account/.test(d)) return "transfer";
  // Real expenses/income categories
  if (/salary payment|kalim page/.test(d)) return "payroll";
  if (/cash withdrawal|terheq/.test(d)) return "miscellaneous";
  if (/cash deposit|derdh/.test(d)) return "miscellaneous";
  if (/komision|commission|mbajtje llogarie/.test(d)) return "miscellaneous";
  if (/tax\b|taksa/.test(d)) return "taxes";
  if (/utility payment/.test(d)) return "utilities";
  if (/fattura|invoice|saldo/.test(d)) return "client_invoice";
  if (/consulen|consulting|salesforce|sherbime/.test(d)) return "consulting";
  if (/purchase/.test(d)) return "miscellaneous";
  return "miscellaneous";
}
