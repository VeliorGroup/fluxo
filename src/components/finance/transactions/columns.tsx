"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction, categoryLabels, formatCurrencyFull } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { class: string; label: string }> = {
  paid: {
    class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    label: "Paid",
  },
  pending: {
    class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    label: "Pending",
  },
  forecasted: {
    class: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    label: "Forecasted",
  },
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(parseISO(row.getValue("date")), "MMM dd, yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {categoryLabels[row.getValue("category") as keyof typeof categoryLabels]}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return (
        <div
          className={`text-right text-sm font-semibold ${
            amount >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {amount >= 0 ? "+" : ""}
          {formatCurrencyFull(amount, "ALL")}
        </div>
      );
    },
  },
  {
    accessorKey: "company_id",
    header: "Company",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {row.original.company_name ?? "Unknown"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status];
      return (
        <Badge variant="outline" className={config?.class}>
          {config?.label ?? status}
        </Badge>
      );
    },
  },
];
