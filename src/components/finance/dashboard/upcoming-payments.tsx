"use client";

import { computeUpcomingPayments } from "@/lib/supabase-data";
import { categoryLabels, type Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Info } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    badge: "destructive" as const,
    accent: "border-l-red-500",
  },
  warning: {
    icon: Clock,
    badge: "outline" as const,
    accent: "border-l-amber-500",
  },
  info: {
    icon: Info,
    badge: "secondary" as const,
    accent: "border-l-blue-500",
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground">
          No upcoming payments — you&apos;re all caught up! 🎉
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Critical Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {payments.map((p) => {
          const cfg = severityConfig[p.severity];
          const Icon = cfg.icon;
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg border-l-4 bg-muted/30 px-4 py-3 ${cfg.accent}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{p.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabels[p.category]} · Due {p.due_date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  {formatDisplay(p.amount, p.currency)}
                </span>
                <Badge variant={cfg.badge} className="text-xs capitalize">
                  {p.severity}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
