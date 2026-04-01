"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction, categoryLabels, recurrenceLabels, formatCurrencyFull } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash2, Repeat, User, ArrowRightLeft } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusConfig: Record<string, { class: string; label: string }> = {
  paid: {
    class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Paid",
  },
  pending: {
    class: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    label: "Pending",
  },
  forecasted: {
    class: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    label: "Forecasted",
  },
};

type ColumnCallbacks = {
  onView: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
};

export function getTransactionColumns({ onView, onDelete }: ColumnCallbacks): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(parseISO(row.getValue("date")), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const tx = row.original;
        const isRecurring = tx.recurrence && tx.recurrence !== "one_time";
        const isPersonal = tx.source_type === "personal";
        const isTransfer = !!tx.transfer_id;
        return (
          <div className="flex items-center gap-2 max-w-[280px]">
            {isTransfer && (
              <span title="Internal Transfer" className="text-cyan-500 dark:text-cyan-400 shrink-0">
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="text-sm font-medium truncate">
              {row.getValue("description")}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {isRecurring && (
                <span title={recurrenceLabels[tx.recurrence!]} className="text-blue-500 dark:text-blue-400">
                  <Repeat className="h-3.5 w-3.5" />
                </span>
              )}
              {isPersonal && (
                <span title="Personal" className="text-violet-500 dark:text-violet-400">
                  <User className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {categoryLabels[row.getValue("category") as keyof typeof categoryLabels] ?? row.getValue("category")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const tx = row.original;
        const amount = row.getValue("amount") as number;
        const currency = tx.currency ?? "EUR";
        const isTransfer = !!tx.transfer_id;
        return (
          <div
            className={`text-right text-sm font-semibold tabular-nums ${
              isTransfer
                ? "text-cyan-600 dark:text-cyan-400"
                : amount >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {amount >= 0 ? "+" : ""}
            {formatCurrencyFull(amount, currency as "EUR" | "ALL")}
          </div>
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
          <Badge variant="outline" className={`rounded-full border-0 ${config?.class}`}>
            {config?.label ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(tx)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(tx)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
