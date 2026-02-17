"use client";

import {
  getCurrentLiquidity,
  getMonthlyBurnRate,
  getRunwayMonths,
  getPendingInvoices,
  formatCurrency,
} from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  TrendingDown,
  Clock,
  FileText,
} from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

const liquidity = getCurrentLiquidity();
const burn = getMonthlyBurnRate();
const pending = getPendingInvoices();

export function KPICards() {
  const { displayCurrency, formatDisplay } = useCurrency();

  const kpis = [
    {
      title: "Total Liquidity",
      value: displayCurrency === "EUR"
        ? formatDisplay(liquidity.eur, "EUR")
        : formatDisplay(liquidity.all, "ALL"),
      subtext:
        displayCurrency === "EUR"
          ? `incl. ${formatDisplay(liquidity.all, "ALL")} converted`
          : `incl. ${formatDisplay(liquidity.eur, "EUR")} converted`,
      icon: Wallet,
      description: "Across all entities",
      trend: "positive" as const,
    },
    {
      title: "Monthly Burn Rate",
      value: displayCurrency === "EUR"
        ? burn.eur > 0
          ? formatDisplay(burn.eur, "EUR")
          : formatDisplay(burn.all, "ALL")
        : burn.all !== 0
        ? formatDisplay(burn.all, "ALL")
        : formatDisplay(burn.eur, "EUR"),
      icon: TrendingDown,
      description: "Avg. last 3 months",
      trend: "negative" as const,
    },
    {
      title: "Runway",
      value: `${getRunwayMonths()} months`,
      icon: Clock,
      description: "Based on ALL burn rate",
      trend: getRunwayMonths() > 6 ? ("positive" as const) : ("warning" as const),
    },
    {
      title: "Pending Invoices",
      value:
        displayCurrency === "EUR"
          ? pending.totalEUR > 0
            ? formatDisplay(pending.totalEUR, "EUR")
            : formatDisplay(pending.totalALL, "ALL")
          : pending.totalALL > 0
          ? formatDisplay(pending.totalALL, "ALL")
          : formatDisplay(pending.totalEUR, "EUR"),
      icon: FileText,
      description: `${pending.count} invoices awaiting`,
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
          {/* Subtle gradient accent */}
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
