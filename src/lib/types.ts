// ── Shared types and utility functions ─────────────────────────

export type Currency = "EUR" | "ALL";

// ── Organization ──────────────────────────────────────────────

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

// ── Finance ───────────────────────────────────────────────────

export type Account = {
  id: string;
  company_id: string;
  name: string;
  currency: Currency;
  type: string;
  description?: string;
  is_default: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  balance?: number;
  inflows?: number;
  outflows?: number;
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
  | "miscellaneous"
  | "transfer";

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
  transfer: "Internal Transfer",
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
  currency?: "EUR" | "ALL";
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

// ── Invoices ──────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type Invoice = {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency?: Currency;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  description?: string;
  notes?: string;
  company_id?: string;
  company_name?: string;
  account_crm_id?: string;
  opportunity_id?: string;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

// ── Finance computed types ────────────────────────────────────

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

// ── CRM ───────────────────────────────────────────────────────

export type CrmAccountType = "client" | "prospect" | "partner" | "vendor";

export type CrmAccount = {
  id: string;
  user_id: string;
  name: string;
  type?: CrmAccountType;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  company_id?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type Contact = {
  id: string;
  user_id: string;
  crm_account_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
  created_at?: string;
};

// ── Leads ─────────────────────────────────────────────────────

export type LeadSource =
  | "google_maps"
  | "campaign"
  | "referral"
  | "website"
  | "cold_outreach"
  | "event"
  | "other";

export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";

export type Lead = {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  status: LeadStatus;
  notes?: string;
  assigned_to?: string;
  company_id?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
};

export const leadSourceLabels: Record<LeadSource, string> = {
  google_maps: "Google Maps",
  campaign: "Campaign",
  referral: "Referral",
  website: "Website",
  cold_outreach: "Cold Outreach",
  event: "Event",
  other: "Other",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  unqualified: "Unqualified",
  converted: "Converted",
};

// ── Opportunities ─────────────────────────────────────────────

export type OpportunityStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type Opportunity = {
  id: string;
  user_id: string;
  name: string;
  crm_account_id?: string;
  account_name?: string;
  stage: OpportunityStage;
  amount?: number;
  currency?: Currency;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
};

export const opportunityStageLabels: Record<OpportunityStage, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

// ── Projects ──────────────────────────────────────────────────

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  start_date?: string;
  end_date?: string;
  company_id?: string;
  company_name?: string;
  account_crm_id?: string;
  opportunity_id?: string;
  budget?: number;
  currency?: Currency;
  created_at?: string;
  updated_at?: string;
};

export type ProjectTask = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigned_to?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

// ── Events ────────────────────────────────────────────────────

export type EventType = "trade_show" | "fair" | "conference" | "networking" | "workshop" | "other";
export type EventStatus = "planned" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type Event = {
  id: string;
  user_id: string;
  name: string;
  type?: EventType;
  location?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: Currency;
  status: EventStatus;
  notes?: string;
  company_id?: string;
  company_name?: string;
  created_at?: string;
};

export const eventTypeLabels: Record<EventType, string> = {
  trade_show: "Trade Show",
  fair: "Fair",
  conference: "Conference",
  networking: "Networking",
  workshop: "Workshop",
  other: "Other",
};

export const eventStatusLabels: Record<EventStatus, string> = {
  planned: "Planned",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ── Documents ─────────────────────────────────────────────────

export type DocumentType = "invoice" | "contract" | "proposal" | "report" | "template" | "other";

export type Document = {
  id: string;
  user_id: string;
  name: string;
  type?: DocumentType;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export const documentTypeLabels: Record<DocumentType, string> = {
  invoice: "Invoice",
  contract: "Contract",
  proposal: "Proposal",
  report: "Report",
  template: "Template",
  other: "Other",
};

// ── Activities / Communications ───────────────────────────────

export type ActivityType = "note" | "email" | "call" | "meeting" | "task_completed" | "status_change";

export type Activity = {
  id: string;
  user_id: string;
  type: ActivityType;
  subject?: string;
  body?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at?: string;
};

export const activityTypeLabels: Record<ActivityType, string> = {
  note: "Note",
  email: "Email",
  call: "Call",
  meeting: "Meeting",
  task_completed: "Task Completed",
  status_change: "Status Change",
};

// ── User Settings ─────────────────────────────────────────────

export type UserSettings = {
  id: string;
  user_id: string;
  default_currency?: Currency;
  default_company_id?: string;
  sidebar_collapsed?: boolean;
  theme?: "light" | "dark" | "system";
  locale?: string;
  created_at?: string;
  updated_at?: string;
};

// ── Currency Formatters ───────────────────────────────────────

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
