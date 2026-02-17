"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction, categoryLabels, recurrenceLabels, formatCurrencyFull, companies } from "@/lib/dummy-data";
import type { RecurrenceType } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Repeat, CalendarClock, Minus } from "lucide-react";

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

const recurrenceIcons: Record<RecurrenceType, typeof Repeat> = {
  one_time: Minus,
  monthly: Repeat,
  annual: CalendarClock,
};

const recurrenceColors: Record<RecurrenceType, string> = {
  one_time: "text-zinc-400",
  monthly: "text-violet-500",
  annual: "text-cyan-500",
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
    accessorKey: "recurrence",
    header: "Recurrence",
    cell: ({ row }) => {
      const rec = row.getValue("recurrence") as RecurrenceType;
      const Icon = recurrenceIcons[rec];
      return (
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${recurrenceColors[rec]}`} />
          <span className="text-xs text-muted-foreground">
            {recurrenceLabels[rec]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const currency = row.original.currency;
      return (
        <div
          className={`text-right text-sm font-semibold ${
            amount >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {amount >= 0 ? "+" : ""}
          {formatCurrencyFull(amount, currency)}
        </div>
      );
    },
  },
  {
    accessorKey: "company_id",
    header: "Company",
    cell: ({ row }) => {
      const company = companies.find((c) => c.id === row.getValue("company_id"));
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {company?.name ?? "Unknown"}
          </span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {row.original.currency}
          </Badge>
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
        <Badge variant="outline" className={config.class}>
          {config.label}
        </Badge>
      );
    },
  },
];
