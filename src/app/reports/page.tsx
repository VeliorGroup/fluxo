"use client";

import { useMemo } from "react";
import { useTransactions, useOpportunities } from "@/lib/supabase-queries";
import {
  type Transaction,
  type Opportunity,
  categoryLabels,
  opportunityStageLabels,
  formatCurrencyFull,
} from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton, PageSkeleton } from "@/components/ui/skeleton-loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
];

function groupByMonth(transactions: Transaction[], type: "income" | "expense") {
  const filtered = transactions.filter((t) => t.type === type && t.status === "paid");
  const map = new Map<string, number>();

  for (const t of filtered) {
    const month = format(parseISO(t.date), "MMM yyyy");
    map.set(month, (map.get(month) ?? 0) + t.amount);
  }

  return Array.from(map.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => {
      const da = new Date(a.month);
      const db = new Date(b.month);
      return da.getTime() - db.getTime();
    });
}

function groupByCategory(transactions: Transaction[], type: "income" | "expense") {
  const filtered = transactions.filter((t) => t.type === type && t.status === "paid");
  const map = new Map<string, number>();

  for (const t of filtered) {
    const label = categoryLabels[t.category] ?? t.category;
    map.set(label, (map.get(label) ?? 0) + t.amount);
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function groupOpportunitiesByStage(opportunities: Opportunity[]) {
  const map = new Map<string, { count: number; value: number }>();

  for (const opp of opportunities) {
    const label = opportunityStageLabels[opp.stage] ?? opp.stage;
    const existing = map.get(label) ?? { count: 0, value: 0 };
    existing.count += 1;
    existing.value += opp.amount ?? 0;
    map.set(label, existing);
  }

  return Array.from(map.entries()).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.value,
  }));
}

export default function ReportsPage() {
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: opportunities = [], isLoading: oppLoading } = useOpportunities();

  const isLoading = txLoading || oppLoading;

  const revenueByMonth = useMemo(() => groupByMonth(transactions, "income"), [transactions]);
  const expensesByMonth = useMemo(() => groupByMonth(transactions, "expense"), [transactions]);
  const revenueByCategory = useMemo(() => groupByCategory(transactions, "income"), [transactions]);
  const expensesByCategory = useMemo(() => groupByCategory(transactions, "expense"), [transactions]);
  const pipelineByStage = useMemo(() => groupOpportunitiesByStage(opportunities), [opportunities]);
  const totalPipelineValue = useMemo(
    () => opportunities.reduce((sum, o) => sum + (o.amount ?? 0), 0),
    [opportunities],
  );

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Business insights and performance metrics</p>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {revenueByMonth.length === 0 && revenueByCategory.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No revenue data"
              description="Income transactions will appear here once recorded."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueByMonth.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueByCategory.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenueByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {revenueByCategory.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {expensesByMonth.length === 0 && expensesByCategory.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No expense data"
              description="Expense transactions will appear here once recorded."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  {expensesByMonth.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={expensesByMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {expensesByCategory.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {expensesByCategory.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          {pipelineByStage.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No pipeline data"
              description="Opportunities will appear here once created."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunities by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pipelineByStage}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="stage" className="text-xs" tick={{ fontSize: 12 }} />
                      <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Pipeline Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-4xl font-bold tracking-tight">
                      {formatCurrencyFull(totalPipelineValue, "EUR")}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Across {opportunities.length} opportunities
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
