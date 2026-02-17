"use client";

import { useState } from "react";
import { PayrollForm } from "@/components/payroll/payroll-form";
import { PayrollTable } from "@/components/payroll/payroll-table";
import { payrollStubs, formatCurrencyFull, type PayrollStub } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Landmark, Users } from "lucide-react";

// Payroll stubs are ALL-denominated (Sh.p.k)
const payrollCurrency = "ALL" as const;

export default function PayrollPage() {
  const [entries, setEntries] = useState<PayrollStub[]>(payrollStubs);

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // ── Summary KPIs (recomputed from live state) ──────────────────
  const totalPayrollCost = entries.reduce(
    (sum, s) => sum + s.gross_salary,
    0
  );
  const taxesDueThisMonth = entries
    .filter((s) => s.taxes_paid_status === "pending")
    .reduce((sum, s) => sum + s.taxes_and_contributions, 0);
  const salariesPending = entries.filter(
    (s) => s.salary_paid_status === "pending"
  ).length;

  const kpis = [
    {
      title: "Total Payroll Cost",
      value: formatCurrencyFull(totalPayrollCost, payrollCurrency),
      icon: Banknote,
      accent: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Taxes Due (Pending)",
      value: formatCurrencyFull(taxesDueThisMonth, payrollCurrency),
      icon: Landmark,
      accent: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Salaries Pending",
      value: `${salariesPending} employees`,
      icon: Users,
      accent: "bg-red-500/10 text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Payroll & Tax Planner
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage employee compensation and track tax contribution deadlines.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.accent}`}
              >
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Payroll Entry */}
      <PayrollForm />

      {/* Payroll Stubs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          <PayrollTable entries={entries} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
