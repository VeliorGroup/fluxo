"use client";

import { useMemo } from "react";
import { useTransactions } from "@/lib/supabase-queries";
import { useCurrency } from "@/components/currency-provider";
import { computeKPIs } from "@/lib/supabase-data";
import { KPICards } from "@/components/finance/dashboard/kpi-cards";
import { RunwayChart } from "@/components/finance/dashboard/runway-chart";
import { UpcomingPayments } from "@/components/finance/dashboard/upcoming-payments";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

export default function DashboardPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { exchangeRate } = useCurrency();

  const kpis = useMemo(() => computeKPIs(transactions, exchangeRate), [transactions, exchangeRate]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your real-time cash flow overview across all entities.
        </p>
      </div>

      <KPICards transactions={transactions} exchangeRate={exchangeRate} />
      <RunwayChart transactions={transactions} exchangeRate={exchangeRate} burnRate={kpis.burnRate} />
      <UpcomingPayments transactions={transactions} />
    </div>
  );
}
