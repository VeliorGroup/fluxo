"use client";

import { useTransactions, useCompanies } from "@/lib/supabase-data";
import { DataTable } from "@/components/finance/transactions/data-table";
import { columns } from "@/components/finance/transactions/columns";
import { Loader2 } from "lucide-react";
import { AddTransactionDialog } from "@/components/finance/transactions/add-transaction-dialog";

export default function TransactionsPage() {
  const { transactions, loading, refresh, deleteTransaction } = useTransactions();
  const { companies } = useCompanies();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-muted-foreground">
            All income &amp; expenses across every entity.
          </p>
        </div>
        <AddTransactionDialog />
      </div>
      <DataTable
        columns={columns}
        data={transactions}
        companies={companies}
        onRefresh={refresh}
      />
    </div>
  );
}
