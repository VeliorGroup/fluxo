"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTransactions, useDeleteTransaction, useAccounts } from "@/lib/supabase-queries";
import { DataTable } from "@/components/ui/data-table";
import { getTransactionColumns } from "@/components/finance/transactions/columns";
import { AddTransactionDialog } from "@/components/finance/transactions/add-transaction-dialog";
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
import { ArrowLeftRight, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { categoryLabels, formatCurrencyFull, type Transaction } from "@/lib/types";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const accountIdFromUrl = searchParams.get("account");

  const { data: allTransactions = [], isLoading } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const deleteTx = useDeleteTransaction();

  const [accountFilter, setAccountFilter] = useState<string>(accountIdFromUrl ?? "all");
  const [viewTx, setViewTx] = useState<Transaction | null>(null);
  const [deleteTxTarget, setDeleteTxTarget] = useState<Transaction | null>(null);

  // Filter transactions by selected account
  const transactions = useMemo(() => {
    if (accountFilter === "all") return allTransactions;
    return allTransactions.filter((t) => t.account_id === accountFilter);
  }, [allTransactions, accountFilter]);

  const activeAccount = accounts.find((a) => a.id === accountFilter);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeAccount
              ? `${activeAccount.name} — ${activeAccount.currency}`
              : "All income & expenses across every entity."}
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Account filter */}
      <div className="flex items-center gap-2">
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[250px] h-9">
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
        {accountFilter !== "all" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            onClick={() => setAccountFilter("all")}
            aria-label="Clear filter"
          >
            <X className="h-4 w-4" />
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
                    {viewTx.amount >= 0 ? "+" : ""}{formatCurrencyFull(viewTx.amount, (viewTx as Transaction & { currency?: string }).currency as "EUR" | "ALL" ?? "EUR")}
                  </span>
                </Detail>
                <Detail label="Status">
                  <Badge variant="outline" className="rounded-full border-0 bg-muted">
                    {viewTx.status}
                  </Badge>
                </Detail>
                <Detail label="Category" value={categoryLabels[viewTx.category] ?? viewTx.category} />
                <Detail label="Company" value={viewTx.company_name || "—"} />
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
