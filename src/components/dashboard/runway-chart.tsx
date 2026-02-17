"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateRunwayData, formatCurrencyFull } from "@/lib/dummy-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useCurrency } from "@/components/currency-provider";

const data = generateRunwayData();

export function RunwayChart() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { displayCurrency } = useCurrency();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Runway Forecast</CardTitle>
          <CardDescription>
            6-month historical balance vs. projected forecast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#a1a1aa" : "#71717a";

  const currency = displayCurrency;
  const actualKey = currency === "EUR" ? "actualEUR" : "actualALL";
  const projectedKey = currency === "EUR" ? "projectedEUR" : "projectedALL";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Runway Forecast</CardTitle>
            <CardDescription>
              6-month historical balance vs. projected forecast
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-full bg-emerald-500" />
              Actual
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-full bg-blue-500 opacity-60" />
              Projected
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`actualGrad-${currency}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`projGrad-${currency}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: textColor }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: textColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) =>
                currency === "EUR"
                  ? value >= 1000 ? `€${(value / 1000).toFixed(0)}k` : `€${value}`
                  : value >= 1000000
                  ? `L${(value / 1000000).toFixed(1)}M`
                  : `L${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: textColor, fontWeight: 600, marginBottom: 4 }}
              formatter={(value, name) => {
                if (value == null || typeof value !== "number") return ["-", String(name ?? "")];
                return [
                  formatCurrencyFull(value, currency),
                  String(name ?? "").includes("actual") ? "Actual" : "Projected",
                ];
              }}
            />
            <Area
              type="monotone"
              dataKey={actualKey}
              stroke="#10b981"
              strokeWidth={2.5}
              fill={`url(#actualGrad-${currency})`}
              dot={{ r: 3, fill: "#10b981" }}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey={projectedKey}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill={`url(#projGrad-${currency})`}
              dot={{ r: 3, fill: "#3b82f6" }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
