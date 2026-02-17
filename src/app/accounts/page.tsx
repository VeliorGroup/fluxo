"use client";

import {
  getAccountBalances,
  companies,
} from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

export default function AccountsPage() {
  const balances = getAccountBalances();
  const { displayCurrency, formatDisplay, exchangeRate } = useCurrency();

  // Group by company
  const grouped = companies.map((c) => ({
    company: c,
    accounts: balances.filter((b) => b.companyId === c.id),
  }));

  // Totals in display currency
  const total = balances.reduce((sum, b) => {
    if (b.currency === displayCurrency) return sum + b.balance;
    if (b.currency === "EUR" && displayCurrency === "ALL")
      return sum + b.balance * exchangeRate;
    return sum + b.balance / exchangeRate;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <p className="mt-1 text-muted-foreground">
          Manage EUR and ALL balances for each entity.
        </p>
      </div>

      {/* Totals */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ArrowRightLeft className="h-4 w-4" />
            Total Across All Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-xs text-muted-foreground">
              Total in {displayCurrency}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {displayCurrency === "EUR" ? "€" : "L"}
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: displayCurrency === "EUR" ? 2 : 0,
                maximumFractionDigits: displayCurrency === "EUR" ? 2 : 0,
              }).format(total)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              at €/L {exchangeRate.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company sections */}
      {grouped.map(({ company, accounts }) => (
        <div key={company.id} className="space-y-3">
          <h2 className="text-lg font-semibold">{company.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map((acct) => (
              <Card key={`${acct.companyId}-${acct.currency}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {acct.currency} Account
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {acct.currency === "EUR" ? "Euro" : "Albanian Lek"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs font-mono"
                  >
                    {acct.currency}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Balance */}
                  <div>
                    <p
                      className={`text-2xl font-bold tracking-tight ${
                        acct.balance >= 0
                          ? "text-foreground"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatDisplay(acct.balance, acct.currency)}
                    </p>
                    {acct.currency !== displayCurrency && (
                      <p className="text-xs text-muted-foreground">
                        Original: {acct.currency === "EUR" ? "€" : "L"}
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: acct.currency === "EUR" ? 2 : 0,
                          maximumFractionDigits: acct.currency === "EUR" ? 2 : 0,
                        }).format(acct.balance)}
                      </p>
                    )}
                  </div>

                  {/* Inflows / Outflows */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatDisplay(acct.inflows, acct.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {formatDisplay(acct.outflows, acct.currency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
