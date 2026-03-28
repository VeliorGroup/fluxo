"use client";

import { computeUpcomingPayments } from "@/lib/supabase-data";
import { categoryLabels, type Transaction } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Info } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    badgeClass: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-0",
    accent: "border-l-red-500",
    iconColor: "text-red-500",
  },
  warning: {
    icon: Clock,
    badgeClass: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-0",
    accent: "border-l-amber-400",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    badgeClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-0",
    accent: "border-l-blue-400",
    iconColor: "text-blue-500",
  },
};

export function UpcomingPayments({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { formatDisplay } = useCurrency();
  const payments = computeUpcomingPayments(transactions);

  if (payments.length === 0) {
    return (
      <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-card dark:border dark:border-border">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-6">Upcoming Payments</h3>
          <div className="py-8 text-center text-sm text-muted-foreground">
            No upcoming payments — you&apos;re all caught up!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-card dark:border dark:border-border">
      <CardContent className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-5">
          Upcoming Critical Payments
        </h3>
        <div className="space-y-3">
          {payments.map((p) => {
            const cfg = severityConfig[p.severity];
            const Icon = cfg.icon;
            return (
              <div
                key={p.id}
                className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border-l-4 bg-muted/20 px-4 py-3 sm:px-5 sm:py-4 transition-colors hover:bg-muted/30 ${cfg.accent}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40`}>
                    <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.description}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {categoryLabels[p.category]} -- Due {p.due_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-11 sm:pl-0 shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {formatDisplay(p.amount, p.currency)}
                  </span>
                  <Badge variant="outline" className={`rounded-full text-xs font-medium capitalize ${cfg.badgeClass}`}>
                    {p.severity}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
