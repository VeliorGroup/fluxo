import { addMonths, subMonths, format, addDays, endOfMonth, setDate } from "date-fns";

// ── Currency Type ──────────────────────────────────────────────
export type Currency = "EUR" | "ALL";

// ── Company Types ──────────────────────────────────────────────
export type Company = {
  id: string;
  name: string;
  type: "person_fizik" | "shpk";
  currencies: Currency[];
};

export const companies: Company[] = [
  { id: "c1", name: "Devis Gjyzeli P.F.", type: "person_fizik", currencies: ["EUR", "ALL"] },
  { id: "c2", name: "Velior Group SH.P.K.", type: "shpk", currencies: ["ALL", "EUR"] },
];

// ── Transaction Types ──────────────────────────────────────────
export type TransactionStatus = "paid" | "pending" | "forecasted";
export type TransactionType = "income" | "expense";
export type RecurrenceType = "one_time" | "monthly" | "annual";

export const recurrenceLabels: Record<RecurrenceType, string> = {
  one_time: "One-time",
  monthly: "Monthly",
  annual: "Annual",
};
export type TransactionCategory =
  | "client_invoice"
  | "office_rent"
  | "utilities"
  | "software_subscriptions"
  | "payroll"
  | "taxes"
  | "freelance_income"
  | "consulting"
  | "equipment"
  | "marketing"
  | "miscellaneous";

export const categoryLabels: Record<TransactionCategory, string> = {
  client_invoice: "Client Invoice",
  office_rent: "Office Rent",
  utilities: "Utilities",
  software_subscriptions: "Software Subscriptions",
  payroll: "Payroll",
  taxes: "Taxes",
  freelance_income: "Freelance Income",
  consulting: "Consulting",
  equipment: "Equipment",
  marketing: "Marketing",
  miscellaneous: "Miscellaneous",
};

export type Transaction = {
  id: string;
  amount: number;
  currency: Currency;
  date: string;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  recurrence: RecurrenceType;
  status: TransactionStatus;
  company_id: string;
};

const today = new Date();

export const transactions: Transaction[] = [
  // P.F. invoices — mostly EUR, some ALL
  { id: "t1", amount: 3800, currency: "EUR", date: format(subMonths(today, 3), "yyyy-MM-dd"), description: "Web App Development — Phase 1", category: "client_invoice", type: "income", recurrence: "one_time", status: "paid", company_id: "c1" },
  { id: "t4", amount: 2400, currency: "EUR", date: format(subMonths(today, 2), "yyyy-MM-dd"), description: "Consulting Retainer — November", category: "consulting", type: "income", recurrence: "monthly", status: "paid", company_id: "c1" },
  { id: "t7", amount: 2900, currency: "EUR", date: format(subMonths(today, 1), "yyyy-MM-dd"), description: "Mobile App Contract", category: "client_invoice", type: "income", recurrence: "one_time", status: "paid", company_id: "c1" },
  { id: "t10", amount: 1500, currency: "EUR", date: format(today, "yyyy-MM-dd"), description: "Freelance Web Design", category: "freelance_income", type: "income", recurrence: "one_time", status: "paid", company_id: "c1" },
  { id: "t19", amount: 150000, currency: "ALL", date: format(subMonths(today, 2), "yyyy-MM-dd"), description: "Local Client — Branding Package", category: "client_invoice", type: "income", recurrence: "one_time", status: "paid", company_id: "c1" },
  // Velior Group SH.P.K. — mostly ALL, some EUR
  { id: "t2", amount: -60000, currency: "ALL", date: format(subMonths(today, 3), "yyyy-MM-dd"), description: "Office Rent — October", category: "office_rent", type: "expense", recurrence: "monthly", status: "paid", company_id: "c2" },
  { id: "t3", amount: -15000, currency: "ALL", date: format(subMonths(today, 2), "yyyy-MM-dd"), description: "AWS Hosting", category: "software_subscriptions", type: "expense", recurrence: "monthly", status: "paid", company_id: "c2" },
  { id: "t5", amount: -120000, currency: "ALL", date: format(subMonths(today, 2), "yyyy-MM-dd"), description: "Employee Salaries — November", category: "payroll", type: "expense", recurrence: "monthly", status: "paid", company_id: "c2" },
  { id: "t6", amount: -45000, currency: "ALL", date: format(subMonths(today, 1), "yyyy-MM-dd"), description: "Tax Contributions — Q3", category: "taxes", type: "expense", recurrence: "annual", status: "paid", company_id: "c2" },
  { id: "t8", amount: -60000, currency: "ALL", date: format(subMonths(today, 1), "yyyy-MM-dd"), description: "Office Rent — December", category: "office_rent", type: "expense", recurrence: "monthly", status: "paid", company_id: "c2" },
  { id: "t9", amount: -8000, currency: "ALL", date: format(subMonths(today, 1), "yyyy-MM-dd"), description: "Figma & Design Tools", category: "software_subscriptions", type: "expense", recurrence: "annual", status: "paid", company_id: "c2" },
  { id: "t20", amount: -450, currency: "EUR", date: format(subMonths(today, 1), "yyyy-MM-dd"), description: "Google Workspace — Annual", category: "software_subscriptions", type: "expense", recurrence: "annual", status: "paid", company_id: "c2" },
  { id: "t21", amount: 5200, currency: "EUR", date: format(subMonths(today, 1), "yyyy-MM-dd"), description: "EU Client Invoice — Consulting", category: "client_invoice", type: "income", recurrence: "one_time", status: "paid", company_id: "c2" },
  // Current month
  { id: "t11", amount: -60000, currency: "ALL", date: format(today, "yyyy-MM-dd"), description: "Office Rent — January", category: "office_rent", type: "expense", recurrence: "monthly", status: "pending", company_id: "c2" },
  { id: "t12", amount: -120000, currency: "ALL", date: format(addDays(today, 5), "yyyy-MM-dd"), description: "Employee Salaries — January", category: "payroll", type: "expense", recurrence: "monthly", status: "pending", company_id: "c2" },
  // Future forecasted
  { id: "t13", amount: 4200, currency: "EUR", date: format(addMonths(today, 1), "yyyy-MM-dd"), description: "E-commerce Platform — Phase 2", category: "client_invoice", type: "income", recurrence: "one_time", status: "forecasted", company_id: "c1" },
  { id: "t14", amount: -60000, currency: "ALL", date: format(addMonths(today, 1), "yyyy-MM-dd"), description: "Office Rent — February", category: "office_rent", type: "expense", recurrence: "monthly", status: "forecasted", company_id: "c2" },
  { id: "t15", amount: -120000, currency: "ALL", date: format(addMonths(today, 1), "yyyy-MM-dd"), description: "Employee Salaries — February", category: "payroll", type: "expense", recurrence: "monthly", status: "forecasted", company_id: "c2" },
  { id: "t16", amount: -50000, currency: "ALL", date: format(addMonths(today, 1), "yyyy-MM-dd"), description: "Tax Contributions — January", category: "taxes", type: "expense", recurrence: "annual", status: "forecasted", company_id: "c2" },
  { id: "t17", amount: 2700, currency: "EUR", date: format(addMonths(today, 2), "yyyy-MM-dd"), description: "SaaS Dashboard Contract", category: "client_invoice", type: "income", recurrence: "one_time", status: "forecasted", company_id: "c1" },
  { id: "t18", amount: -25000, currency: "ALL", date: format(addMonths(today, 2), "yyyy-MM-dd"), description: "Marketing Campaign", category: "marketing", type: "expense", recurrence: "one_time", status: "forecasted", company_id: "c2" },
];

// ── Runway Chart Data ──────────────────────────────────────────
export type RunwayDataPoint = {
  month: string;
  actualEUR: number | null;
  projectedEUR: number | null;
  actualALL: number | null;
  projectedALL: number | null;
};

export function generateRunwayData(): RunwayDataPoint[] {
  const data: RunwayDataPoint[] = [];
  let balEUR = 5200; // Starting EUR balance 6 months ago
  let balALL = 420000; // Starting ALL balance 6 months ago

  // Historical data (6 months back → today)
  const eurChanges = [800, -200, 1200, -100, 600, 400];
  const allChanges = [60000, -35000, 80000, -20000, 45000, 30000];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    balEUR += eurChanges[5 - i];
    balALL += allChanges[5 - i];
    data.push({
      month: format(date, "MMM yyyy"),
      actualEUR: balEUR,
      projectedEUR: null,
      actualALL: balALL,
      projectedALL: null,
    });
  }

  let projEUR = balEUR;
  let projALL = balALL;

  // Projected data (next 6 months)
  const eurProj = [500, 300, -150, 400, 200, 500];
  const allProj = [40000, 25000, -10000, 35000, 15000, 40000];
  for (let i = 1; i <= 6; i++) {
    const date = addMonths(today, i);
    projEUR += eurProj[i - 1];
    projALL += allProj[i - 1];
    data.push({
      month: format(date, "MMM yyyy"),
      actualEUR: null,
      projectedEUR: projEUR,
      actualALL: null,
      projectedALL: projALL,
    });
  }

  // Bridge: last actual month also gets projected values
  data[5].projectedEUR = data[5].actualEUR;
  data[5].projectedALL = data[5].actualALL;

  return data;
}

// ── Payroll Stubs ──────────────────────────────────────────────
export type PayrollStub = {
  id: string;
  employee_name: string;
  employee_id: string;
  pay_period_date: string;
  gross_salary: number;
  net_salary: number;
  taxes_and_contributions: number;
  currency: Currency;
  salary_paid_status: "paid" | "pending";
  taxes_paid_status: "paid" | "pending";
  salary_due_date: string;
  taxes_due_date: string;
  company_id: string;
};

export const payrollStubs: PayrollStub[] = [
  {
    id: "p1",
    employee_name: "Andi Hoxha",
    employee_id: "e1",
    pay_period_date: format(subMonths(today, 1), "yyyy-MM-dd"),
    gross_salary: 80000,
    net_salary: 60000,
    taxes_and_contributions: 20000,
    currency: "ALL",
    salary_paid_status: "paid",
    taxes_paid_status: "paid",
    salary_due_date: format(endOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
    taxes_due_date: format(setDate(today, 15), "yyyy-MM-dd"),
    company_id: "c2",
  },
  {
    id: "p2",
    employee_name: "Elira Basha",
    employee_id: "e2",
    pay_period_date: format(subMonths(today, 1), "yyyy-MM-dd"),
    gross_salary: 70000,
    net_salary: 52000,
    taxes_and_contributions: 18000,
    currency: "ALL",
    salary_paid_status: "paid",
    taxes_paid_status: "pending",
    salary_due_date: format(endOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
    taxes_due_date: format(setDate(today, 15), "yyyy-MM-dd"),
    company_id: "c2",
  },
  {
    id: "p3",
    employee_name: "Andi Hoxha",
    employee_id: "e1",
    pay_period_date: format(today, "yyyy-MM-dd"),
    gross_salary: 80000,
    net_salary: 60000,
    taxes_and_contributions: 20000,
    currency: "ALL",
    salary_paid_status: "pending",
    taxes_paid_status: "pending",
    salary_due_date: format(endOfMonth(today), "yyyy-MM-dd"),
    taxes_due_date: format(setDate(addMonths(today, 1), 15), "yyyy-MM-dd"),
    company_id: "c2",
  },
  {
    id: "p4",
    employee_name: "Elira Basha",
    employee_id: "e2",
    pay_period_date: format(today, "yyyy-MM-dd"),
    gross_salary: 70000,
    net_salary: 52000,
    taxes_and_contributions: 18000,
    currency: "ALL",
    salary_paid_status: "pending",
    taxes_paid_status: "pending",
    salary_due_date: format(endOfMonth(today), "yyyy-MM-dd"),
    taxes_due_date: format(setDate(addMonths(today, 1), 15), "yyyy-MM-dd"),
    company_id: "c2",
  },
];

// ── Upcoming Critical Payments ─────────────────────────────────
export type UpcomingPayment = {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  due_date: string;
  category: TransactionCategory;
  severity: "critical" | "warning" | "info";
};

export const upcomingPayments: UpcomingPayment[] = [
  {
    id: "u1",
    description: "Employee Salaries — January",
    amount: 120000,
    currency: "ALL",
    due_date: format(addDays(today, 3), "yyyy-MM-dd"),
    category: "payroll",
    severity: "critical",
  },
  {
    id: "u2",
    description: "Tax Contributions — Q4",
    amount: 50000,
    currency: "ALL",
    due_date: format(addDays(today, 6), "yyyy-MM-dd"),
    category: "taxes",
    severity: "critical",
  },
  {
    id: "u3",
    description: "Office Rent — February",
    amount: 60000,
    currency: "ALL",
    due_date: format(addDays(today, 12), "yyyy-MM-dd"),
    category: "office_rent",
    severity: "warning",
  },
  {
    id: "u4",
    description: "AWS Hosting Renewal",
    amount: 150,
    currency: "EUR",
    due_date: format(addDays(today, 18), "yyyy-MM-dd"),
    category: "software_subscriptions",
    severity: "info",
  },
];

// ── KPI Helpers ────────────────────────────────────────────────
export type LiquiditySummary = {
  eur: number;
  all: number;
};

export function getCurrentLiquidity(): LiquiditySummary {
  const paid = transactions.filter((t) => t.status === "paid");
  return {
    eur: paid.filter((t) => t.currency === "EUR").reduce((sum, t) => sum + t.amount, 0),
    all: paid.filter((t) => t.currency === "ALL").reduce((sum, t) => sum + t.amount, 0),
  };
}

export function getMonthlyBurnRate(): LiquiditySummary {
  const expenses = transactions.filter((t) => t.type === "expense" && t.status === "paid");
  return {
    eur: Math.round(
      expenses.filter((t) => t.currency === "EUR").reduce((sum, t) => sum + Math.abs(t.amount), 0) / 3
    ),
    all: Math.round(
      expenses.filter((t) => t.currency === "ALL").reduce((sum, t) => sum + Math.abs(t.amount), 0) / 3
    ),
  };
}

export function getRunwayMonths(): number {
  // Use ALL burn as primary indicator (largest recurring cost)
  const liquidity = getCurrentLiquidity();
  const burn = getMonthlyBurnRate();
  if (burn.all <= 0) return Infinity;
  return Math.round((liquidity.all / burn.all) * 10) / 10;
}

export function getPendingInvoices(): { count: number; totalEUR: number; totalALL: number } {
  const pending = transactions.filter(
    (t) => t.type === "income" && (t.status === "pending" || t.status === "forecasted")
  );
  return {
    count: pending.length,
    totalEUR: pending.filter((t) => t.currency === "EUR").reduce((sum, t) => sum + t.amount, 0),
    totalALL: pending.filter((t) => t.currency === "ALL").reduce((sum, t) => sum + t.amount, 0),
  };
}

// ── Currency Formatters ────────────────────────────────────────
const currencySymbols: Record<Currency, string> = {
  EUR: "€",
  ALL: "L",
};

export function formatCurrency(amount: number, currency: Currency = "ALL"): string {
  const abs = Math.abs(amount);
  const sym = currencySymbols[currency];
  const formatted =
    abs >= 1000000
      ? `${(abs / 1000000).toFixed(1)}M`
      : abs >= 1000
      ? `${(abs / 1000).toFixed(0)}k`
      : abs.toFixed(0);
  return `${amount < 0 ? "-" : ""}${sym}${formatted}`;
}

export function formatCurrencyFull(amount: number, currency: Currency = "ALL"): string {
  const sym = currencySymbols[currency];
  return `${sym}${new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: currency === "EUR" ? 2 : 0,
    maximumFractionDigits: currency === "EUR" ? 2 : 0,
  }).format(amount)}`;
}

// ── Account Balance Helpers ────────────────────────────────────
export type AccountBalance = {
  companyId: string;
  companyName: string;
  currency: Currency;
  balance: number;
  inflows: number;
  outflows: number;
};

export function getAccountBalances(): AccountBalance[] {
  const balances: AccountBalance[] = [];

  for (const company of companies) {
    for (const currency of company.currencies) {
      const txs = transactions.filter(
        (t) => t.company_id === company.id && t.currency === currency && t.status === "paid"
      );
      const inflows = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const outflows = txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
      balances.push({
        companyId: company.id,
        companyName: company.name,
        currency,
        balance: inflows + outflows,
        inflows,
        outflows,
      });
    }
  }

  return balances;
}

