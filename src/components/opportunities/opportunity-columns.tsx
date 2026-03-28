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
import type { Opportunity, OpportunityStage } from "@/lib/types";
import { opportunityStageLabels, formatCurrencyFull } from "@/lib/types";
import { format, parseISO } from "date-fns";

const stageConfig: Record<OpportunityStage, string> = {
  prospecting: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  qualification: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  proposal: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  negotiation: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  closed_won: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  closed_lost: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export function getOpportunityColumns(
  onEdit: (opportunity: Opportunity) => void,
  onDelete: (id: string) => void,
): ColumnDef<Opportunity>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "account_name",
      header: "Account",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("account_name") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => {
        const stage = row.getValue("stage") as OpportunityStage;
        return (
          <Badge variant="outline" className={stageConfig[stage]}>
            {opportunityStageLabels[stage]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number | undefined;
        const currency = row.original.currency ?? "EUR";
        if (amount == null) return <div className="text-right text-sm text-muted-foreground">-</div>;
        return (
          <div className="text-right text-sm font-semibold">
            {formatCurrencyFull(amount, currency)}
          </div>
        );
      },
    },
    {
      accessorKey: "probability",
      header: () => <div className="text-right">Probability</div>,
      cell: ({ row }) => {
        const prob = row.getValue("probability") as number | undefined;
        if (prob == null) return <div className="text-right text-sm text-muted-foreground">-</div>;
        return (
          <div className="text-right text-sm text-muted-foreground">{prob}%</div>
        );
      },
    },
    {
      accessorKey: "expected_close_date",
      header: "Expected Close",
      cell: ({ row }) => {
        const date = row.getValue("expected_close_date") as string | undefined;
        if (!date) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {format(parseISO(date), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const opportunity = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(opportunity.id)}
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
