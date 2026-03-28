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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Event } from "@/lib/types";
import { eventTypeLabels, eventStatusLabels, formatCurrencyFull } from "@/lib/types";
import type { EventType, EventStatus } from "@/lib/types";

type ColumnCallbacks = {
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
};

const typeVariant: Record<EventType, string> = {
  trade_show: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  fair: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  conference: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  networking: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  workshop: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const statusVariant: Record<EventStatus, string> = {
  planned: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function getEventColumns({ onEdit, onDelete }: ColumnCallbacks): ColumnDef<Event>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as EventType | undefined;
        if (!type) return "-";
        return (
          <Badge variant="outline" className={typeVariant[type]}>
            {eventTypeLabels[type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.getValue("location") || "-",
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("start_date") as string | undefined;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("end_date") as string | undefined;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as EventStatus;
        return (
          <Badge variant="outline" className={statusVariant[status]}>
            {eventStatusLabels[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => {
        const budget = row.original.budget;
        const currency = row.original.currency ?? "ALL";
        return budget != null ? formatCurrencyFull(budget, currency) : "-";
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
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
