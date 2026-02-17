import { transactions } from "@/lib/dummy-data";
import { columns } from "@/components/transactions/columns";
import { DataTable } from "@/components/transactions/data-table";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all income and expense entries.
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
