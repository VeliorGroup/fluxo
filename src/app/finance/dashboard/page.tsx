"use client";

import { useTransactions } from "@/lib/supabase-data";
import { KPICards } from "@/components/finance/dashboard/kpi-cards";
import { RunwayChart } from "@/components/finance/dashboard/runway-chart";
import { UpcomingPayments } from "@/components/finance/dashboard/upcoming-payments";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { transactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your real-time cash flow overview across all entities.
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards transactions={transactions} />

      {/* Runway Chart */}
      <RunwayChart transactions={transactions} />

      {/* Upcoming Payments */}
      <UpcomingPayments transactions={transactions} />
    </div>
  );
}
