import {
  fetchExchangeRate,
  getExchangeRateHistory,
} from "@/lib/exchange-rate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRightLeft,
  Globe,
} from "lucide-react";

export default async function ExchangeRatesPage() {
  const current = await fetchExchangeRate();
  const history = getExchangeRateHistory();

  // Stats
  const rates = history.map((h) => h.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const avg = rates.reduce((s, r) => s + r, 0) / rates.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exchange Rates</h1>
        <p className="mt-1 text-muted-foreground">
          Daily EUR/ALL official rate from the Bank of Albania.
        </p>
      </div>

      {/* Current Rate Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Globe className="h-4 w-4" />
            Today&apos;s Official Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">EUR → ALL</p>
              <p className="text-4xl font-bold tracking-tight tabular-nums">
                {current.rate.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-1 pb-1">
              {current.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : current.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={`text-sm font-semibold tabular-nums ${
                  current.change < 0
                    ? "text-red-500"
                    : current.change > 0
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                }`}
              >
                {current.change > 0 ? "+" : ""}
                {current.change.toFixed(2)}
              </span>
            </div>
            <Badge variant="outline" className="mb-1 ml-auto text-xs">
              {current.source === "boa" ? "Bank of Albania" : "Fallback"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              30-Day Low
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">{min.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              30-Day Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">{avg.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              30-Day High
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">{max.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Rate History (Last 30 Working Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    EUR/ALL Rate
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Change
                  </th>
                  <th className="pb-3 text-center font-medium text-muted-foreground">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((entry, i) => (
                  <tr
                    key={entry.date}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                      i === 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="py-2.5 font-medium">
                      {new Date(entry.date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {i === 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 text-[10px]"
                        >
                          Today
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-bold tabular-nums">
                      {entry.rate.toFixed(2)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-medium tabular-nums ${
                        entry.change < 0
                          ? "text-red-500"
                          : entry.change > 0
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {entry.change > 0 ? "+" : ""}
                      {entry.change.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-center">
                      {entry.change < 0 ? (
                        <TrendingDown className="mx-auto h-3.5 w-3.5 text-red-500" />
                      ) : entry.change > 0 ? (
                        <TrendingUp className="mx-auto h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
