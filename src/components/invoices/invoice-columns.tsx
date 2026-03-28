"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrencyFull, type Invoice } from "@/lib/types";

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  sent: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  overdue: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

type Callbacks = {
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
};

export function getInvoiceColumns({ onView, onEdit, onDelete }: Callbacks): ColumnDef<Invoice>[] {
  return [
    {
      accessorKey: "invoice_number",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">{row.getValue("invoice_number")}</span>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Client",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("client_name")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm font-semibold tabular-nums">
          {formatCurrencyFull(row.getValue("amount"), row.original.currency ?? "EUR")}
        </div>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Issued",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(parseISO(row.getValue("issue_date")), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "due_date",
      header: "Due",
      cell: ({ row }) => {
        const due = row.getValue("due_date") as string | null;
        return (
          <span className="text-sm text-muted-foreground">
            {due ? format(parseISO(due), "dd MMM yyyy") : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="outline" className={`rounded-full border-0 capitalize ${statusStyles[status] ?? ""}`}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
