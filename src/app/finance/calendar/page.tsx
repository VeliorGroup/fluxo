"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/lib/supabase-queries";
import { useCurrency } from "@/components/currency-provider";
import {
  categoryLabels,
  formatCurrencyFull,
  type Transaction,
  type Currency,
} from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  startOfYear,
  eachMonthOfInterval,
  endOfYear,
} from "date-fns";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

type ViewMode = "month" | "year";

type DaySummary = {
  date: Date;
  dateStr: string;
  income: number;
  expense: number;
  net: number;
  count: number;
  transactions: Transaction[];
};

export default function CalendarPage() {
  const { data: allTransactions = [], isLoading } = useTransactions();
  const { formatDisplay, exchangeRate } = useCurrency();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);

  const toEUR = (amount: number, currency?: string) =>
    currency === "ALL" ? amount / exchangeRate : amount;

  // Group transactions by date string
  const txByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of allTransactions) {
      if (tx.status !== "paid" || tx.category === "transfer") continue;
      const key = tx.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return map;
  }, [allTransactions]);

  // Month view data
  const monthDays = useMemo((): DaySummary[] => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const txs = txByDate.get(dateStr) ?? [];
      const income = txs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + toEUR(Math.abs(t.amount), t.currency), 0);
      const expense = txs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + toEUR(Math.abs(t.amount), t.currency), 0);
      return { date, dateStr, income, expense, net: income - expense, count: txs.length, transactions: txs };
    });
  }, [currentDate, txByDate, exchangeRate]);

  // Year view: monthly summaries
  const yearMonths = useMemo(() => {
    const start = startOfYear(currentDate);
    const end = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start, end });

    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      let income = 0;
      let expense = 0;
      let count = 0;
      for (const day of days) {
        const dateStr = format(day, "yyyy-MM-dd");
        const txs = txByDate.get(dateStr) ?? [];
        for (const t of txs) {
          const amt = toEUR(Math.abs(t.amount), t.currency);
          if (t.type === "income") income += amt;
          else expense += amt;
        }
        count += txs.length;
      }
      return { month: monthStart, income, expense, net: income - expense, count };
    });
  }, [currentDate, txByDate, exchangeRate]);

  // Month totals
  const monthTotals = useMemo(() => {
    const income = monthDays.reduce((s, d) => s + d.income, 0);
    const expense = monthDays.reduce((s, d) => s + d.expense, 0);
    return { income, expense, net: income - expense };
  }, [monthDays]);

  // Max amount for heat-map scaling
  const maxDayAmount = useMemo(() => {
    return Math.max(1, ...monthDays.map((d) => Math.max(d.income, d.expense)));
  }, [monthDays]);

  function navigateMonth(dir: number) {
    setCurrentDate((d) => (dir > 0 ? addMonths(d, 1) : subMonths(d, 1)));
    setSelectedDay(null);
  }

  function navigateYear(dir: number) {
    setCurrentDate((d) => new Date(d.getFullYear() + dir, d.getMonth(), 1));
    setSelectedDay(null);
  }

  if (isLoading) return <PageSkeleton />;

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // getDay: 0=Sun, shift so Mon=0
  const firstDayOffset = (getDay(startOfMonth(currentDate)) + 6) % 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            Financial Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily overview of income and expenses. Transfers excluded.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
          <Button
            variant={viewMode === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("year")}
          >
            Year
          </Button>
        </div>
      </div>

      {viewMode === "month" ? (
        <>
          {/* Month navigation + summary */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-bold min-w-[180px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }}>
                Today
              </Button>
            </div>

            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-1.5">
                <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatDisplay(monthTotals.income, "EUR")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatDisplay(monthTotals.expense, "EUR")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {monthTotals.net >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-bold ${monthTotals.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {monthTotals.net >= 0 ? "+" : ""}{formatDisplay(monthTotals.net, "EUR")}
                </span>
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-card dark:border dark:border-border overflow-hidden">
            <CardContent className="p-0">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {weekDays.map((d) => (
                  <div key={d} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-border/40 bg-muted/20" />
                ))}

                {monthDays.map((day) => {
                  const hasActivity = day.count > 0;
                  const isSelected = selectedDay?.dateStr === day.dateStr;
                  const today = isToday(day.date);

                  // Heat intensity (0–1)
                  const expenseIntensity = day.expense / maxDayAmount;
                  const incomeIntensity = day.income / maxDayAmount;

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`min-h-[90px] border-b border-r border-border/40 p-1.5 text-left transition-colors hover:bg-accent/50 focus:outline-none ${
                        isSelected ? "bg-primary/5 ring-2 ring-primary ring-inset" : ""
                      }`}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            today
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {format(day.date, "d")}
                        </span>
                        {hasActivity && (
                          <span className="text-[10px] text-muted-foreground/60">
                            {day.count}
                          </span>
                        )}
                      </div>

                      {/* Amounts */}
                      {hasActivity && (
                        <div className="space-y-0.5">
                          {day.income > 0 && (
                            <div
                              className="rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-400"
                              style={{
                                backgroundColor: `oklch(0.95 ${0.04 * incomeIntensity} 145 / ${0.3 + incomeIntensity * 0.5})`,
                              }}
                            >
                              +{formatCompact(day.income)}
                            </div>
                          )}
                          {day.expense > 0 && (
                            <div
                              className="rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums text-red-700 dark:text-red-400"
                              style={{
                                backgroundColor: `oklch(0.95 ${0.04 * expenseIntensity} 25 / ${0.3 + expenseIntensity * 0.5})`,
                              }}
                            >
                              -{formatCompact(day.expense)}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected day detail */}
          {selectedDay && selectedDay.count > 0 && (
            <Card className="rounded-xl border-0 bg-white shadow-sm dark:bg-card dark:border dark:border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold">
                      {format(selectedDay.date, "EEEE, d MMMM yyyy")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedDay.count} transaction{selectedDay.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {selectedDay.income > 0 && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatDisplay(selectedDay.income, "EUR")}
                      </span>
                    )}
                    {selectedDay.expense > 0 && (
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatDisplay(selectedDay.expense, "EUR")}
                      </span>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDay(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedDay.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            tx.type === "income"
                              ? "bg-emerald-50 dark:bg-emerald-500/10"
                              : "bg-red-50 dark:bg-red-500/10"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {categoryLabels[tx.category] ?? tx.category}
                            {tx.source_type === "personal" && " \u00b7 Personal"}
                            {tx.recurrence && tx.recurrence !== "one_time" && ` \u00b7 ${tx.recurrence === "monthly" ? "Monthly" : "Annual"}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold tabular-nums shrink-0 ${
                          tx.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrencyFull(Math.abs(tx.amount), (tx.currency ?? "EUR") as Currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* ─── Year view ─── */
        <>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateYear(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold min-w-[80px] text-center">
              {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateYear(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {yearMonths.map((m) => {
              const isCurrentMonth = isSameMonth(m.month, new Date());
              return (
                <Card
                  key={m.month.toISOString()}
                  className={`rounded-xl border-0 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md dark:bg-card dark:border dark:border-border ${
                    isCurrentMonth ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setCurrentDate(m.month);
                    setViewMode("month");
                    setSelectedDay(null);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold">{format(m.month, "MMMM")}</h3>
                      {m.count > 0 && (
                        <Badge variant="outline" className="rounded-full text-[10px]">
                          {m.count}
                        </Badge>
                      )}
                    </div>

                    {m.count > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Income</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            +{formatCompact(m.income)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Expenses</span>
                          <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                            -{formatCompact(m.expense)}
                          </span>
                        </div>
                        {/* Net bar */}
                        <div className="pt-1">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            {m.income + m.expense > 0 && (
                              <div
                                className={`h-full rounded-full ${m.net >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                                style={{
                                  width: `${Math.min(100, (Math.max(m.income, m.expense) / (m.income + m.expense)) * 100)}%`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <span className="text-muted-foreground font-medium">Net</span>
                          <span className={`font-bold tabular-nums ${m.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {m.net >= 0 ? "+" : ""}{formatCompact(m.net)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 py-4 text-center">
                        No activity
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}\u20ac${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}\u20ac${(abs / 1_000).toFixed(1)}k`;
  return `${sign}\u20ac${abs.toFixed(0)}`;
}
