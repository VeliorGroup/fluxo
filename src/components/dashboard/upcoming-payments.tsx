"use client";

import { upcomingPayments } from "@/lib/dummy-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { useCurrency } from "@/components/currency-provider";

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    label: "Urgent",
  },
  warning: {
    icon: AlertCircle,
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    label: "Soon",
  },
  info: {
    icon: Info,
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    label: "Upcoming",
  },
};

export function UpcomingPayments() {
  const { formatDisplay } = useCurrency();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Upcoming Critical Payments
        </CardTitle>
        <CardDescription>
          Payments due in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingPayments.map((payment) => {
            const config = severityConfig[payment.severity];
            const dueDate = parseISO(payment.due_date);
            const daysUntil = differenceInDays(dueDate, new Date());

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      payment.severity === "critical"
                        ? "bg-red-500/10"
                        : payment.severity === "warning"
                        ? "bg-amber-500/10"
                        : "bg-blue-500/10"
                    }`}
                  >
                    <config.icon
                      className={`h-4 w-4 ${
                        payment.severity === "critical"
                          ? "text-red-500"
                          : payment.severity === "warning"
                          ? "text-amber-500"
                          : "text-blue-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{payment.description}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(dueDate, "MMM dd, yyyy")}
                      <span className="text-muted-foreground">·</span>
                      <span
                        className={
                          daysUntil <= 3
                            ? "font-medium text-red-500"
                            : daysUntil <= 7
                            ? "font-medium text-amber-500"
                            : ""
                        }
                      >
                        {daysUntil === 0
                          ? "Due today"
                          : daysUntil === 1
                          ? "Due tomorrow"
                          : `${daysUntil} days left`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatDisplay(payment.amount, payment.currency)}
                  </span>
                  <Badge variant="outline" className={config.badgeClass}>
                    {config.label}
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
