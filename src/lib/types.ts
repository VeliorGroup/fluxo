// ── Shared types and utility functions ─────────────────────────
// These are pure type definitions and formatters — no dummy data.

export type Currency = "EUR" | "ALL";

export type Company = {
  id: string;
  name: string;
  type: "person_fizik" | "shpk";
  nipt?: string;
  address?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type Account = {
  id: string;
  company_id: string;
  name: string;
  currency: "EUR" | "ALL";
  type: string;
  description?: string;
  is_default: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  // Computed fields
  balance?: number;
  inflows?: number;
  outflows?: number;
};

export type Department = {
  id: string;
  company_id: string;
  name: string;
  parent_id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type Role = {
  id: string;
  department_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
};

export type TransactionStatus = "paid" | "pending" | "forecasted";
export type TransactionType = "income" | "expense";

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
  date: string;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  status: TransactionStatus;
  company_id: string;
  account_id?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type PayrollStub = {
  id: string;
  employee_name: string;
  employee_id: string;
  pay_period_date: string;
  gross_salary: number;
  net_salary: number;
  taxes_and_contributions: number;
  salary_paid_status: "paid" | "pending";
  taxes_paid_status: "paid" | "pending";
  salary_due_date: string;
  taxes_due_date: string;
  company_id: string;
  company_name?: string;
};

export type UpcomingPayment = {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  due_date: string;
  category: TransactionCategory;
  severity: "critical" | "warning" | "info";
};

export type RunwayDataPoint = {
  month: string;
  actual: number | null;
  projected: number | null;
};

export type AccountBalance = {
  companyId: string;
  companyName: string;
  currency: Currency;
  balance: number;
  inflows: number;
  outflows: number;
};

export type LiquiditySummary = {
  eur: number;
  all: number;
};

export type Person = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  role?: string;
  department?: string;
  company_id?: string;
  company_name?: string;
  status: "active" | "terminated" | "on_leave";
  created_at?: string;
  updated_at?: string;
};

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
