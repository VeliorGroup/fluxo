"use client";

import { formatCurrencyFull, type PayrollStub } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState } from "react";

const statusBadge = {
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export function PayrollTable({
  entries,
  onDelete,
}: {
  entries: PayrollStub[];
  onDelete: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Employee</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Pay Period</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Net Salary</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Salary Status</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Taxes</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Tax Status</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Total</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                No payroll entries yet.
              </TableCell>
            </TableRow>
          )}
          {entries.map((stub) => (
            <TableRow key={stub.id} className="group transition-colors hover:bg-accent/50">
              <TableCell>
                <div>
                  <p className="text-sm font-medium">{stub.employee_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {stub.employee_id}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(parseISO(stub.pay_period_date), "MMM yyyy")}
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">
                {formatCurrencyFull(stub.net_salary, "ALL")}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusBadge[stub.salary_paid_status]}
                >
                  {stub.salary_paid_status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">
                {formatCurrencyFull(stub.taxes_and_contributions, "ALL")}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusBadge[stub.taxes_paid_status]}
                >
                  {stub.taxes_paid_status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm font-bold">
                {formatCurrencyFull(stub.gross_salary, "ALL")}
              </TableCell>
              <TableCell>
                {confirmId === stub.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        onDelete(stub.id);
                        setConfirmId(null);
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setConfirmId(null)}
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                    onClick={() => setConfirmId(stub.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
