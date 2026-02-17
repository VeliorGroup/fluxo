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
      .from("accounts")
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
      const { error } = await supabase.from("accounts").insert({
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
        .from("accounts")
        .update(updates)
        .eq("id", id);
      if (!error) await refresh();
      return error;
    },
    [refresh]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
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
      .select("*, companies(name), accounts(name)")
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
      company_id: row.company_id as string,
      account_id: row.account_id as string | undefined,
      company_name: (row.companies as { name: string } | null)?.name ?? "",
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
export function computeKPIs(transactions: Transaction[]) {
  const paid = transactions.filter((t) => t.status === "paid");

  // Liquidity
  const liquidity: LiquiditySummary = {
    eur: paid.reduce((sum, t) => sum + t.amount, 0), // all in single currency since DB doesn't have currency on TX
    all: 0,
  };

  // Since DB transactions don't have currency field, we compute from company
  // For now, aggregate all amounts as single currency
  const totalBalance = paid.reduce((sum, t) => sum + t.amount, 0);
  liquidity.eur = totalBalance;
  liquidity.all = totalBalance;

  // Monthly burn rate (average of last 3 months expenses)
  const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd");
  const recentExpenses = paid.filter(
    (t) => t.type === "expense" && t.date >= threeMonthsAgo
  );
  const totalExpenses = recentExpenses.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );
  const burnRate = Math.round(totalExpenses / 3);

  // Pending invoices
  const pending = transactions.filter(
    (t) => t.type === "income" && (t.status === "pending" || t.status === "forecasted")
  );
  const pendingTotal = pending.reduce((sum, t) => sum + t.amount, 0);

  // Runway
  const runway = burnRate > 0 ? Math.round((totalBalance / burnRate) * 10) / 10 : Infinity;

  return {
    liquidity: totalBalance,
    burnRate,
    pendingInvoices: { count: pending.length, total: pendingTotal },
    runway,
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
      currency: "ALL" as Currency, // default currency
      due_date: t.date,
      category: t.category,
      severity,
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// Runway Chart Data (derived from transactions)
// ═══════════════════════════════════════════════════════════════
export function computeRunwayData(transactions: Transaction[]): RunwayDataPoint[] {
  const today = new Date();
  const data: RunwayDataPoint[] = [];

  // Compute cumulative balance over the last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(today, i);
    const monthStr = format(monthDate, "yyyy-MM");
    const txsUpTo = transactions.filter(
      (t) => t.status === "paid" && t.date <= format(monthDate, "yyyy-MM-dd")
    );
    const balance = txsUpTo.reduce((sum, t) => sum + t.amount, 0);
    data.push({
      month: format(monthDate, "MMM yyyy"),
      actual: balance,
      projected: null,
    });
  }

  // Projected: simple linear projection from current balance + avg monthly net
  if (data.length >= 2) {
    const lastBalance = data[data.length - 1].actual ?? 0;
    const prevBalance = data[data.length - 3]?.actual ?? data[data.length - 2].actual ?? 0;
    const avgChange = (lastBalance - prevBalance) / 3;

    // Bridge point
    data[data.length - 1].projected = lastBalance;

    for (let i = 1; i <= 6; i++) {
      data.push({
        month: format(addMonths(today, i), "MMM yyyy"),
        actual: null,
        projected: Math.round(lastBalance + avgChange * i),
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
    const inflows = accountTxs
      .filter((t) => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const outflows = accountTxs
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + t.amount, 0);

    // If account has an initial balance field in DB, use it. 
    // For now we treat DB balance as initial? 
    // The type says balance?: number. In DB it's numeric.
    // Let's assume account.balance is from DB (initial).
    const initial = account.balance || 0;

    return {
      ...account,
      balance: initial + inflows + outflows,
      inflows,
      outflows,
    };
  });
}
