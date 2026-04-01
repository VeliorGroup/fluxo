"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTransactions, useDeleteTransaction, useAccounts } from "@/lib/supabase-queries";
import { DataTable } from "@/components/ui/data-table";
import { getTransactionColumns } from "@/components/finance/transactions/columns";
import { AddTransactionDialog } from "@/components/finance/transactions/add-transaction-dialog";
import { TransferDialog } from "@/components/finance/transactions/transfer-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, X, Repeat, User, Building2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { categoryLabels, recurrenceLabels, sourceTypeLabels, formatCurrencyFull, type Transaction, type TransactionCategory, type TransactionRecurrence, type TransactionSourceType } from "@/lib/types";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const accountIdFromUrl = searchParams.get("account");

  const { data: allTransactions = [], isLoading } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const deleteTx = useDeleteTransaction();

  const [accountFilter, setAccountFilter] = useState<string>(accountIdFromUrl ?? "all");
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewTx, setViewTx] = useState<Transaction | null>(null);
  const [deleteTxTarget, setDeleteTxTarget] = useState<Transaction | null>(null);

  // Filter transactions
  const transactions = useMemo(() => {
    let filtered = allTransactions;
    if (accountFilter !== "all") filtered = filtered.filter((t) => t.account_id === accountFilter);
    if (recurrenceFilter !== "all") filtered = filtered.filter((t) => (t.recurrence ?? "one_time") === recurrenceFilter);
    if (sourceFilter !== "all") filtered = filtered.filter((t) => (t.source_type ?? "business") === sourceFilter);
    if (categoryFilter !== "all") filtered = filtered.filter((t) => t.category === categoryFilter);
    return filtered;
  }, [allTransactions, accountFilter, recurrenceFilter, sourceFilter, categoryFilter]);

  const activeAccount = accounts.find((a) => a.id === accountFilter);
  const hasActiveFilters = accountFilter !== "all" || recurrenceFilter !== "all" || sourceFilter !== "all" || categoryFilter !== "all";

  const columns = useMemo(
    () =>
      getTransactionColumns({
        onView: (tx) => setViewTx(tx),
        onDelete: (tx) => setDeleteTxTarget(tx),
      }),
    [],
  );

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeAccount
              ? `${activeAccount.name} — ${activeAccount.currency}`
              : "All income & expenses across every entity."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TransferDialog />
          <AddTransactionDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-9">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={recurrenceFilter} onValueChange={setRecurrenceFilter}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recurrence</SelectItem>
            <SelectItem value="one_time">One-time</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="business">
              <span className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" /> Business
              </span>
            </SelectItem>
            <SelectItem value="personal">
              <span className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Personal
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-9">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.entries(categoryLabels) as [TransactionCategory, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
            onClick={() => { setAccountFilter("all"); setRecurrenceFilter("all"); setSourceFilter("all"); setCategoryFilter("all"); }}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        searchPlaceholder="Search transactions..."
        emptyTitle="No transactions found"
        emptyDescription="Add your first transaction to get started."
        emptyIcon={ArrowLeftRight}
        enableExport
        exportFilename="transactions"
        exportTitle="Transactions"
      />

      {/* View Detail Dialog */}
      <Dialog open={!!viewTx} onOpenChange={(open) => !open && setViewTx(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewTx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Date" value={format(parseISO(viewTx.date), "dd MMM yyyy")} />
                <Detail label="Type">
                  <Badge variant="outline" className={`rounded-full border-0 ${viewTx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {viewTx.type === "income" ? "Income" : "Expense"}
                  </Badge>
                </Detail>
                <Detail label="Amount">
                  <span className={`font-semibold tabular-nums ${viewTx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {viewTx.amount >= 0 ? "+" : ""}{formatCurrencyFull(viewTx.amount, viewTx.currency as "EUR" | "ALL" ?? "EUR")}
                  </span>
                </Detail>
                <Detail label="Status">
                  <Badge variant="outline" className="rounded-full border-0 bg-muted">
                    {viewTx.status}
                  </Badge>
                </Detail>
                <Detail label="Category" value={categoryLabels[viewTx.category] ?? viewTx.category} />
                <Detail label="Company" value={viewTx.company_name || "—"} />
                <Detail label="Recurrence">
                  <div className="flex items-center gap-1.5">
                    {viewTx.recurrence && viewTx.recurrence !== "one_time" && <Repeat className="h-3.5 w-3.5 text-blue-500" />}
                    <span className="text-sm font-medium">{recurrenceLabels[viewTx.recurrence ?? "one_time"]}</span>
                  </div>
                </Detail>
                <Detail label="Source">
                  <div className="flex items-center gap-1.5">
                    {viewTx.source_type === "personal" ? <User className="h-3.5 w-3.5 text-violet-500" /> : <Building2 className="h-3.5 w-3.5 text-blue-500" />}
                    <span className="text-sm font-medium">{sourceTypeLabels[viewTx.source_type ?? "business"]}</span>
                  </div>
                </Detail>
              </div>
              <Detail label="Description" value={viewTx.description} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTxTarget}
        onOpenChange={(open) => !open && setDeleteTxTarget(null)}
        title="Delete Transaction"
        description={deleteTxTarget ? `Are you sure you want to delete "${deleteTxTarget.description}" (${formatCurrencyFull(deleteTxTarget.amount, (deleteTxTarget as Transaction & { currency?: string }).currency as "EUR" | "ALL" ?? "EUR")})? This action cannot be undone.` : ""}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteTx.isPending}
        onConfirm={async () => {
          if (deleteTxTarget) {
            await deleteTx.mutateAsync(deleteTxTarget.id);
            setDeleteTxTarget(null);
          }
        }}
      />
    </div>
  );
}

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      {children ?? <p className="text-sm font-medium">{value}</p>}
    </div>
  );
}
