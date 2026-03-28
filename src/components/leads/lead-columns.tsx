"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lead, LeadSource, LeadStatus } from "@/lib/types";
import { leadSourceLabels, leadStatusLabels } from "@/lib/types";

const sourceConfig: Record<LeadSource, string> = {
  google_maps: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  campaign: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  referral: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  website: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  cold_outreach: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  event: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  other: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

const statusConfig: Record<LeadStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  qualified: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  unqualified: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  converted: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

export function getLeadColumns(
  onEdit: (lead: Lead) => void,
  onDelete: (id: string) => void,
): ColumnDef<Lead>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("email") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = row.getValue("source") as LeadSource | undefined;
        if (!source) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <Badge variant="outline" className={sourceConfig[source]}>
            {leadSourceLabels[source]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as LeadStatus;
        return (
          <Badge variant="outline" className={statusConfig[status]}>
            {leadStatusLabels[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "assigned_to",
      header: "Assigned To",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("assigned_to") || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(lead)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(lead.id)}
                className="text-destructive"
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
