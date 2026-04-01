"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type {
  Company,
  Account,
  Transaction,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
  PayrollStub,
  AccountBalance,
  RunwayDataPoint,
  UpcomingPayment,
  LiquiditySummary,
  Currency,
  Department,
  Role,
} from "@/lib/types";
import { format, subMonths, addMonths, addDays, differenceInDays } from "date-fns";

// ═══════════════════════════════════════════════════════════════
// Companies
// ═══════════════════════════════════════════════════════════════
export function useCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    setCompanies(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addCompany = useCallback(
    async (company: Omit<Company, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user) return;
      const { error } = await supabase.from("companies").insert({
        ...company,
        user_id: user.id,
      });
      if (!error) await refresh();
      return error;
    },
    [user, refresh]
  );

  const updateCompany = useCallback(
    async (id: string, updates: Partial<Company>) => {
      const { error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  return { companies, loading, refresh, addCompany, updateCompany, deleteCompany };
}

// ═══════════════════════════════════════════════════════════════
// Accounts
// ═══════════════════════════════════════════════════════════════
export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("financial_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    
    // Calculate balances from transactions locally for now, or fetch aggregated
    // For now just return raw accounts. Balances will be computed by combining with transactions.
    setAccounts(data as Account[] ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addAccount = useCallback(
    async (account: Omit<Account, "id" | "user_id" | "created_at" | "updated_at" | "is_default">) => {
      if (!user) return;
      const { error } = await supabase.from("financial_accounts").insert({
        user_id: user.id,
        company_id: account.company_id,
        name: account.name,
        currency: account.currency,
        type: account.type,
      });
      if (!error) await refresh();
      return error;
    },
    [user, refresh]
  );

  const updateAccount = useCallback(
    async (id: string, updates: Partial<Account>) => {
      const { error } = await supabase
        .from("financial_accounts")
        .update(updates)
        .eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("financial_accounts").delete().eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  return { accounts, loading, refresh, addAccount, updateAccount, deleteAccount };
}

// ═══════════════════════════════════════════════════════════════
// People
// ═══════════════════════════════════════════════════════════════
import type { Person } from "@/lib/types";

export function usePeople() {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("people")
      .select("*, companies(name)")
      .eq("user_id", user.id)
      .order("first_name");

    const mapped: Person[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      first_name: row.first_name as string,
      last_name: row.last_name as string,
      email: row.email as string,
      role: row.role as string,
      department: row.department as string,
      company_id: row.company_id as string,
      company_name: (row.companies as { name: string } | null)?.name ?? "",
      status: row.status as "active" | "terminated" | "on_leave",
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }));
    setPeople(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addPerson = useCallback(
    async (person: Omit<Person, "id" | "company_name" | "created_at" | "updated_at">) => {
      if (!user) return;
      const { error } = await supabase.from("people").insert({
        user_id: user.id,
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        role: person.role,
        department: person.department,
        company_id: person.company_id,
        status: person.status,
      });
      if (!error) await refresh();
      return error;
    },
    [user, refresh]
  );

  const updatePerson = useCallback(
    async (id: string, updates: Partial<Person>) => {
      // Remove derived fields
      const { company_name, ...cleanUpdates } = updates;
      const { error } = await supabase
        .from("people")
        .update(cleanUpdates)
        .eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  const deletePerson = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("people").delete().eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  return { people, loading, refresh, addPerson, updatePerson, deletePerson };
}

// ═══════════════════════════════════════════════════════════════
// Departments
// ═══════════════════════════════════════════════════════════════
export function useDepartments() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("departments")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    setDepartments((data as Department[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addDepartment = useCallback(
    async (dept: Omit<Department, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user) return;
      const { error } = await supabase.from("departments").insert({
        ...dept,
        user_id: user.id,
      });
      if (!error) await refresh();
      return error;
    },
    [user, refresh]
  );

  const updateDepartment = useCallback(
    async (id: string, updates: Partial<Department>) => {
      const { error } = await supabase
        .from("departments")
        .update(updates)
        .eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  const deleteDepartment = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  return { departments, loading, refresh, addDepartment, updateDepartment, deleteDepartment };
}

// ═══════════════════════════════════════════════════════════════
// Roles
// ═══════════════════════════════════════════════════════════════
export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("roles")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    setRoles((data as Role[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addRole = useCallback(
    async (role: Omit<Role, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user) return;
      const { error } = await supabase.from("roles").insert({
        ...role,
        user_id: user.id,
      });
      if (!error) await refresh();
      return error;
    },
    [user, refresh]
  );

  const updateRole = useCallback(
    async (id: string, updates: Partial<Role>) => {
      const { error } = await supabase
        .from("roles")
        .update(updates)
        .eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  const deleteRole = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("roles").delete().eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  return { roles, loading, refresh, addRole, updateRole, deleteRole };
}

// ═══════════════════════════════════════════════════════════════
// Transactions
// ═══════════════════════════════════════════════════════════════
export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*, companies(name)")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const mapped: Transaction[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      amount: row.type === "expense"
        ? -Math.abs(row.amount as number)
        : Math.abs(row.amount as number),
      date: row.date as string,
      description: row.description as string,
      category: row.category as TransactionCategory,
      type: row.type as TransactionType,
      status: row.status as TransactionStatus,
      recurrence: (row.recurrence as Transaction["recurrence"]) ?? "one_time",
      source_type: (row.source_type as Transaction["source_type"]) ?? "business",
      transfer_id: row.transfer_id as string | undefined,
      company_id: row.company_id as string,
      account_id: row.account_id as string | undefined,
      company_name: (row.companies as { name: string } | null)?.name ?? "",
      currency: (row.currency as "EUR" | "ALL") ?? "EUR",
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }));
    setTransactions(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addTransaction = useCallback(
    async (tx: Omit<Transaction, "id" | "created_at" | "updated_at" | "company_name">) => {
      if (!user) return;
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        company_id: tx.company_id,
        account_id: tx.account_id,
        amount: Math.abs(tx.amount),
        date: tx.date,
        description: tx.description,
        category: tx.category,
        type: tx.type,
        status: tx.status,
      });
      if (!error) await refresh();
      return error;
    },
    [user, refresh]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  return { transactions, loading, refresh, addTransaction, deleteTransaction };
}

// ═══════════════════════════════════════════════════════════════
// Payroll
// ═══════════════════════════════════════════════════════════════
export function usePayroll() {
  const { user } = useAuth();
  const [stubs, setStubs] = useState<PayrollStub[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("payroll_stubs")
      .select("*, companies(name)")
      .eq("user_id", user.id)
      .order("pay_period_date", { ascending: false });

    const mapped: PayrollStub[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      employee_name: row.employee_name as string,
      employee_id: row.employee_id as string,
      pay_period_date: row.pay_period_date as string,
      gross_salary: row.gross_salary as number,
      net_salary: row.net_salary as number,
      taxes_and_contributions: row.taxes_and_contributions as number,
      salary_paid_status: row.salary_paid_status as "paid" | "pending",
      taxes_paid_status: row.taxes_paid_status as "paid" | "pending",
      salary_due_date: row.salary_due_date as string,
      taxes_due_date: row.taxes_due_date as string,
      company_id: row.company_id as string,
      company_name: (row.companies as { name: string } | null)?.name ?? "",
    }));
    setStubs(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addStub = useCallback(
    async (stub: Omit<PayrollStub, "id" | "company_name">) => {
      if (!user) return;
      const { error } = await supabase.from("payroll_stubs").insert({
        user_id: user.id,
        company_id: stub.company_id,
        employee_name: stub.employee_name,
        employee_id: stub.employee_id,
        pay_period_date: stub.pay_period_date,
        gross_salary: stub.gross_salary,
        net_salary: stub.net_salary,
        taxes_and_contributions: stub.taxes_and_contributions,
        salary_paid_status: stub.salary_paid_status,
        taxes_paid_status: stub.taxes_paid_status,
        salary_due_date: stub.salary_due_date,
        taxes_due_date: stub.taxes_due_date,
      });
      if (!error) await refresh();
      return error;
    },
    [user, refresh]
  );

  const deleteStub = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("payroll_stubs").delete().eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  return { stubs, loading, refresh, addStub, deleteStub };
}

// ═══════════════════════════════════════════════════════════════
// KPI Helpers (computed from transactions)
// ═══════════════════════════════════════════════════════════════
export function computeKPIs(transactions: Transaction[], exchangeRate: number = 96) {
  const toEUR = (amount: number, currency?: string) =>
    currency === "ALL" ? amount / exchangeRate : amount;

  const paid = transactions.filter((t) => t.status === "paid");
  const real = paid.filter((t) => t.category !== "transfer");

  // LIQUIDITY = actual bank balance (ALL transactions including transfers)
  // This is the real money in the accounts right now
  const liquidity = paid.reduce(
    (sum, t) => sum + toEUR(t.amount, t.currency),
    0
  );

  // BURN RATE = total real expenses from Jan 1 this year to now, divided by months elapsed
  const yearStart = format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd");
  const now = new Date();
  const monthsThisYear = Math.max(1, now.getMonth() + (now.getDate() > 15 ? 1 : 0)) || 1;

  const ytdExpenses = real.filter(
    (t) => t.type === "expense" && t.date >= yearStart
  );
  const totalExpensesEUR = ytdExpenses.reduce(
    (sum, t) => sum + Math.abs(toEUR(t.amount, t.currency)),
    0
  );
  const burnRate = Math.round(totalExpensesEUR / monthsThisYear);

  // PENDING INVOICES = income that hasn't been paid yet
  const pending = real.filter(
    (t) => t.type === "income" && (t.status === "pending" || t.status === "forecasted")
  );
  const pendingTotal = pending.reduce(
    (sum, t) => sum + toEUR(t.amount, t.currency),
    0
  );

  // RUNWAY = months until cash runs out at current burn rate
  const runway = burnRate > 0 ? Math.round((liquidity / burnRate) * 10) / 10 : Infinity;

  return {
    liquidity: Math.round(liquidity * 100) / 100,
    burnRate,
    pendingInvoices: { count: pending.length, total: Math.round(pendingTotal * 100) / 100 },
    runway,
  };
}

// ═══════════════════════════════════════════════════════════════
// Cost Breakdown (recurring vs one-time, business vs personal)
// ═══════════════════════════════════════════════════════════════
export function computeCostBreakdown(transactions: Transaction[], exchangeRate: number = 96) {
  const toEUR = (amount: number, currency?: string) =>
    currency === "ALL" ? amount / exchangeRate : amount;

  const expenses = transactions.filter(
    (t) => t.type === "expense" && t.category !== "transfer" && t.status === "paid"
  );

  const recurring = expenses.filter((t) => t.recurrence === "monthly" || t.recurrence === "annual");
  const oneTime = expenses.filter((t) => !t.recurrence || t.recurrence === "one_time");
  const personal = expenses.filter((t) => t.source_type === "personal");
  const business = expenses.filter((t) => t.source_type !== "personal");

  const sumEUR = (txs: Transaction[]) =>
    Math.round(txs.reduce((sum, t) => sum + Math.abs(toEUR(t.amount, t.currency)), 0) * 100) / 100;

  // Monthly recurring = monthly costs + annual costs / 12
  const monthlyRecurring = recurring.reduce((sum, t) => {
    const amt = Math.abs(toEUR(t.amount, t.currency));
    return sum + (t.recurrence === "annual" ? amt / 12 : amt);
  }, 0);

  return {
    recurringTotal: sumEUR(recurring),
    recurringMonthly: Math.round(monthlyRecurring * 100) / 100,
    recurringCount: recurring.length,
    oneTimeTotal: sumEUR(oneTime),
    oneTimeCount: oneTime.length,
    personalTotal: sumEUR(personal),
    personalCount: personal.length,
    businessTotal: sumEUR(business),
    businessCount: business.length,
  };
}

// ═══════════════════════════════════════════════════════════════
// Upcoming Payments (derived from pending/forecasted transactions)
// ═══════════════════════════════════════════════════════════════
export function computeUpcomingPayments(transactions: Transaction[]): UpcomingPayment[] {
  const today = new Date();
  const upcoming = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category !== "transfer" &&
        (t.status === "pending" || t.status === "forecasted") &&
        t.date >= format(today, "yyyy-MM-dd")
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  return upcoming.map((t) => {
    const daysUntilDue = differenceInDays(new Date(t.date), today);
    let severity: "critical" | "warning" | "info" = "info";
    if (daysUntilDue <= 5) severity = "critical";
    else if (daysUntilDue <= 14) severity = "warning";

    return {
      id: t.id,
      description: t.description,
      amount: Math.abs(t.amount),
      currency: "EUR" as Currency, // default currency
      due_date: t.date,
      category: t.category,
      severity,
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// Runway Chart Data (derived from transactions)
// ═══════════════════════════════════════════════════════════════
export function computeRunwayData(transactions: Transaction[], exchangeRate: number = 96, burnRate: number = 0): RunwayDataPoint[] {
  // Use ALL transactions for balance (including transfers — this is the real bank balance)
  const toEUR = (amount: number, currency?: string) =>
    currency === "ALL" ? amount / exchangeRate : amount;
  const today = new Date();
  const paid = transactions.filter((t) => t.status === "paid");
  const data: RunwayDataPoint[] = [];

  // Monthly balance snapshots — last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthEnd = subMonths(today, i);
    const cutoff = format(monthEnd, "yyyy-MM-dd");
    const balance = paid
      .filter((t) => t.date <= cutoff)
      .reduce((sum, t) => sum + toEUR(t.amount, t.currency), 0);
    data.push({
      month: format(monthEnd, "MMM yyyy"),
      actual: Math.round(balance),
      projected: null,
    });
  }

  // Projected: decrease by burn rate each month
  if (data.length > 0) {
    const lastBalance = data[data.length - 1].actual ?? 0;
    data[data.length - 1].projected = lastBalance;

    for (let i = 1; i <= 6; i++) {
      const projected = Math.max(0, lastBalance - burnRate * i);
      data.push({
        month: format(addMonths(today, i), "MMM yyyy"),
        actual: null,
        projected: Math.round(projected),
      });
    }
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════
// Account Balances (computed from transactions grouped by account)
// ═══════════════════════════════════════════════════════════════
export function computeAccountsWithBalances(
  accounts: Account[],
  transactions: Transaction[]
): Account[] {
  return accounts.map((account) => {
    const accountTxs = transactions.filter(
      (t) => t.account_id === account.id && t.status === "paid"
    );

    // Balance uses ALL transactions (including transfers) — this is the real bank balance
    const allInflows = accountTxs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const allOutflows = accountTxs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
    const initial = account.balance || 0;

    // Inflows/outflows displayed exclude transfers — shows real business activity
    const realTxs = accountTxs.filter((t) => t.category !== "transfer");
    const inflows = realTxs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const outflows = realTxs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

    return {
      ...account,
      balance: initial + allInflows + allOutflows,
      inflows,
      outflows,
    };
  });
}
