"use client";

import { computeRunwayData } from "@/lib/supabase-data";
import { formatCurrencyFull, type Transaction, type RunwayDataPoint } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function RunwayChart({ transactions, exchangeRate = 96, burnRate = 0 }: { transactions: Transaction[]; exchangeRate?: number; burnRate?: number }) {
  const { formatDisplay } = useCurrency();
  const data = computeRunwayData(transactions, exchangeRate, burnRate);

  if (data.length === 0) {
    return (
      <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-card dark:border dark:border-border">
        <CardContent className="py-16 text-center text-muted-foreground">
          No transaction data yet. Add transactions to see the runway forecast.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-card dark:border dark:border-border">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Runway Forecast</h3>
            <p className="text-xs text-muted-foreground/70 mt-1">
              6-month history + 6-month projection
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Projected</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.4}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000000
                    ? `${(v / 1000000).toFixed(1)}M`
                    : v >= 1000
                    ? `${Math.round(v / 1000)}k`
                    : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                  color: "hsl(var(--popover-foreground))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number | undefined) => [
                  formatCurrencyFull(value ?? 0, "EUR"),
                  "",
                ]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#gradActual)"
                connectNulls={false}
                name="Actual"
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="url(#gradProjected)"
                connectNulls={false}
                name="Projected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
