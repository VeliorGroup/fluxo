"use client";

import { computeKPIs } from "@/lib/supabase-data";
import { formatCurrency, type Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  TrendingDown,
  Clock,
  FileText,
} from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

export function KPICards({ transactions }: { transactions: Transaction[] }) {
  const { formatDisplay } = useCurrency();
  const kpi = computeKPIs(transactions);

  const kpis = [
    {
      title: "Total Liquidity",
      value: formatDisplay(kpi.liquidity, "ALL"),
      icon: Wallet,
      description: "Across all entities",
      trend: kpi.liquidity >= 0 ? ("positive" as const) : ("negative" as const),
    },
    {
      title: "Monthly Burn Rate",
      value: formatDisplay(kpi.burnRate, "ALL"),
      icon: TrendingDown,
      description: "Avg. last 3 months",
      trend: "negative" as const,
    },
    {
      title: "Runway",
      value: kpi.runway === Infinity ? "∞" : `${kpi.runway} months`,
      icon: Clock,
      description: "Based on burn rate",
      trend: kpi.runway > 6 ? ("positive" as const) : ("warning" as const),
    },
    {
      title: "Pending Invoices",
      value: formatDisplay(kpi.pendingInvoices.total, "ALL"),
      icon: FileText,
      description: `${kpi.pendingInvoices.count} invoices awaiting`,
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="relative overflow-hidden transition-shadow hover:shadow-lg"
        >
          <div
            className={`absolute left-0 top-0 h-full w-1 ${
              kpi.trend === "positive"
                ? "bg-emerald-500"
                : kpi.trend === "negative"
                ? "bg-red-500"
                : kpi.trend === "warning"
                ? "bg-amber-500"
                : "bg-zinc-400 dark:bg-zinc-600"
            }`}
          />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pl-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pl-5">
            <div className="text-xl font-bold tracking-tight">{kpi.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
