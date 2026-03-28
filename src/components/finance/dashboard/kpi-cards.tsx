"use client";

import { computeKPIs } from "@/lib/supabase-data";
import { formatCurrency, type Transaction } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

export function KPICards({ transactions, exchangeRate = 96 }: { transactions: Transaction[]; exchangeRate?: number }) {
  const { formatDisplay } = useCurrency();
  const kpi = computeKPIs(transactions, exchangeRate);

  const kpis = [
    {
      title: "Total Liquidity",
      value: formatDisplay(kpi.liquidity, "EUR"),
      icon: Wallet,
      description: "Across all entities",
      trend: kpi.liquidity >= 0 ? ("positive" as const) : ("negative" as const),
      changePercent: "+12.5%",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Monthly Burn Rate",
      value: formatDisplay(kpi.burnRate, "EUR"),
      icon: TrendingDown,
      description: "Avg. YTD",
      trend: "negative" as const,
      changePercent: "",
      iconBg: "bg-red-50 dark:bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      title: "Runway",
      value: kpi.runway === Infinity ? "\u221e" : `${kpi.runway} months`,
      icon: Clock,
      description: "Based on burn rate",
      trend: kpi.runway > 6 ? ("positive" as const) : ("warning" as const),
      changePercent: kpi.runway > 6 ? "+2 mo" : "-1 mo",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Pending Invoices",
      value: formatDisplay(kpi.pendingInvoices.total, "EUR"),
      icon: FileText,
      description: `${kpi.pendingInvoices.count} invoices awaiting`,
      trend: "neutral" as const,
      changePercent: `${kpi.pendingInvoices.count} open`,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="relative overflow-hidden rounded-xl border-0 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-card dark:border dark:border-border"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {kpi.value}
                </p>
                <div className="flex items-center gap-1.5">
                  {kpi.trend === "positive" ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  ) : kpi.trend === "negative" ? (
                    <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  ) : kpi.trend === "warning" ? (
                    <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                  ) : null}
                  <span
                    className={`text-xs font-medium ${
                      kpi.trend === "positive"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : kpi.trend === "negative"
                        ? "text-red-600 dark:text-red-400"
                        : kpi.trend === "warning"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {kpi.changePercent}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {kpi.description}
                  </span>
                </div>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kpi.iconBg}`}
              >
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
