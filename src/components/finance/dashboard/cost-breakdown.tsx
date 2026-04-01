"use client";

import { computeCostBreakdown } from "@/lib/supabase-data";
import { type Transaction } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Repeat, Zap, Building2, User } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

export function CostBreakdown({
  transactions,
  exchangeRate = 96,
}: {
  transactions: Transaction[];
  exchangeRate?: number;
}) {
  const { formatDisplay } = useCurrency();
  const breakdown = computeCostBreakdown(transactions, exchangeRate);

  const cards = [
    {
      title: "Recurring Costs",
      subtitle: `${breakdown.recurringCount} recurring expenses`,
      value: formatDisplay(breakdown.recurringMonthly, "EUR"),
      label: "/month",
      icon: Repeat,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "One-time Costs",
      subtitle: `${breakdown.oneTimeCount} one-time expenses`,
      value: formatDisplay(breakdown.oneTimeTotal, "EUR"),
      label: "total",
      icon: Zap,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Business Expenses",
      subtitle: `${breakdown.businessCount} transactions`,
      value: formatDisplay(breakdown.businessTotal, "EUR"),
      label: "total",
      icon: Building2,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Personal Withdrawals",
      subtitle: `${breakdown.personalCount} transactions`,
      value: formatDisplay(breakdown.personalTotal, "EUR"),
      label: "total",
      icon: User,
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">Cost Breakdown</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="relative overflow-hidden rounded-xl border-0 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-card dark:border dark:border-border"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {card.value}
                    </p>
                    <span className="text-xs text-muted-foreground">{card.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/60">{card.subtitle}</p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
