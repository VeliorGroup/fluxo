"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import type {
  Company,
  Account,
  Transaction,
  TransactionCategory,
  TransactionType,
  TransactionStatus,
  PayrollStub,
  Department,
  Role,
  Person,
  Invoice,
  CrmAccount,
  Contact,
  Lead,
  Opportunity,
  Project,
  ProjectTask,
  Event,
  Document,
  Activity,
  UserSettings,
} from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// Generic helpers
// ═══════════════════════════════════════════════════════════════

function useUserId() {
  const { user } = useAuth();
  return user?.id ?? null;
}

function throwOnError<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// Generic mutation hook factory
function useEntityMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
  invalidateKeys: string[],
  successMessage?: string,
) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key, userId] });
      });
      if (successMessage) toast.success(successMessage);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// Companies
// ═══════════════════════════════════════════════════════════════

export function useCompanies() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["companies", userId],
    queryFn: async () => {
      const result = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId!)
        .order("name");
      return throwOnError(result) as Company[];
    },
    enabled: !!userId,
  });
}

export function useAddCompany() {
  const userId = useUserId();
  return useEntityMutation(
    async (company: Omit<Company, "id" | "created_at" | "updated_at" | "user_id">) => {
      const result = await supabase.from("companies").insert({ ...company, user_id: userId! });
      return throwOnError(result);
    },
    ["companies"],
    "Company created",
  );
}

export function useUpdateCompany() {
  return useEntityMutation(
    async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const result = await supabase.from("companies").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["companies"],
    "Company updated",
  );
}

export function useDeleteCompany() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("companies").delete().eq("id", id);
      return throwOnError(result);
    },
    ["companies"],
    "Company deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Financial Accounts
// ═══════════════════════════════════════════════════════════════

export function useAccounts() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["financial_accounts", userId],
    queryFn: async () => {
      const result = await supabase
        .from("financial_accounts")
        .select("*")
        .eq("user_id", userId!)
        .order("name");
      return throwOnError(result) as Account[];
    },
    enabled: !!userId,
  });
}

export function useAddAccount() {
  const userId = useUserId();
  return useEntityMutation(
    async (account: Omit<Account, "id" | "user_id" | "created_at" | "updated_at" | "is_default">) => {
      const result = await supabase.from("financial_accounts").insert({
        user_id: userId!,
        company_id: account.company_id,
        name: account.name,
        currency: account.currency,
        type: account.type,
        balance: account.balance ?? 0,
      });
      return throwOnError(result);
    },
    ["financial_accounts"],
    "Account created",
  );
}

export function useUpdateAccount() {
  return useEntityMutation(
    async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      const result = await supabase.from("financial_accounts").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["financial_accounts"],
    "Account updated",
  );
}

export function useDeleteAccount() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("financial_accounts").delete().eq("id", id);
      return throwOnError(result);
    },
    ["financial_accounts"],
    "Account deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// People
// ═══════════════════════════════════════════════════════════════

export function usePeople() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["people", userId],
    queryFn: async () => {
      const result = await supabase
        .from("people")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("first_name");

      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): Person => ({
        id: row.id as string,
        first_name: row.first_name as string,
        last_name: row.last_name as string,
        email: row.email as string,
        role: row.role as string,
        department: row.department as string,
        company_id: row.company_id as string,
        company_name: (row.companies as { name: string } | null)?.name ?? "",
        status: row.status as Person["status"],
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      }));
    },
    enabled: !!userId,
  });
}

export function useAddPerson() {
  const userId = useUserId();
  return useEntityMutation(
    async (person: Omit<Person, "id" | "company_name" | "created_at" | "updated_at">) => {
      const result = await supabase.from("people").insert({
        user_id: userId!,
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        role: person.role,
        department: person.department,
        company_id: person.company_id,
        status: person.status,
      });
      return throwOnError(result);
    },
    ["people"],
    "Person added",
  );
}

export function useUpdatePerson() {
  return useEntityMutation(
    async ({ id, company_name: _, ...updates }: Partial<Person> & { id: string }) => {
      const result = await supabase.from("people").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["people"],
    "Person updated",
  );
}

export function useDeletePerson() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("people").delete().eq("id", id);
      return throwOnError(result);
    },
    ["people"],
    "Person deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Departments
// ═══════════════════════════════════════════════════════════════

export function useDepartments() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["departments", userId],
    queryFn: async () => {
      const result = await supabase
        .from("departments")
        .select("*")
        .eq("user_id", userId!)
        .order("name");
      return throwOnError(result) as Department[];
    },
    enabled: !!userId,
  });
}

export function useAddDepartment() {
  const userId = useUserId();
  return useEntityMutation(
    async (dept: Omit<Department, "id" | "created_at" | "updated_at" | "user_id">) => {
      const result = await supabase.from("departments").insert({ ...dept, user_id: userId! });
      return throwOnError(result);
    },
    ["departments"],
    "Department created",
  );
}

export function useUpdateDepartment() {
  return useEntityMutation(
    async ({ id, ...updates }: Partial<Department> & { id: string }) => {
      const result = await supabase.from("departments").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["departments"],
    "Department updated",
  );
}

export function useDeleteDepartment() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("departments").delete().eq("id", id);
      return throwOnError(result);
    },
    ["departments"],
    "Department deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Roles
// ═══════════════════════════════════════════════════════════════

export function useRoles() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["roles", userId],
    queryFn: async () => {
      const result = await supabase
        .from("roles")
        .select("*")
        .eq("user_id", userId!)
        .order("name");
      return throwOnError(result) as Role[];
    },
    enabled: !!userId,
  });
}

export function useAddRole() {
  const userId = useUserId();
  return useEntityMutation(
    async (role: Omit<Role, "id" | "created_at" | "updated_at" | "user_id">) => {
      const result = await supabase.from("roles").insert({ ...role, user_id: userId! });
      return throwOnError(result);
    },
    ["roles"],
    "Role created",
  );
}

export function useUpdateRole() {
  return useEntityMutation(
    async ({ id, ...updates }: Partial<Role> & { id: string }) => {
      const result = await supabase.from("roles").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["roles"],
    "Role updated",
  );
}

export function useDeleteRole() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("roles").delete().eq("id", id);
      return throwOnError(result);
    },
    ["roles"],
    "Role deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Transactions
// ═══════════════════════════════════════════════════════════════

export function useTransactions() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      const result = await supabase
        .from("transactions")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("date", { ascending: false });

      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): Transaction => ({
        id: row.id as string,
        amount:
          row.type === "expense"
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
        currency: (row.currency as "EUR" | "ALL") ?? "EUR",
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      }));
    },
    enabled: !!userId,
  });
}

export function useAddTransaction() {
  const userId = useUserId();
  return useEntityMutation(
    async (tx: Omit<Transaction, "id" | "created_at" | "updated_at" | "company_name">) => {
      const result = await supabase.from("transactions").insert({
        user_id: userId!,
        company_id: tx.company_id,
        account_id: tx.account_id,
        amount: Math.abs(tx.amount),
        date: tx.date,
        description: tx.description,
        category: tx.category,
        type: tx.type,
        status: tx.status,
      });
      return throwOnError(result);
    },
    ["transactions"],
    "Transaction added",
  );
}

export function useDeleteTransaction() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("transactions").delete().eq("id", id);
      return throwOnError(result);
    },
    ["transactions"],
    "Transaction deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Payroll
// ═══════════════════════════════════════════════════════════════

export function usePayroll() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["payroll", userId],
    queryFn: async () => {
      const result = await supabase
        .from("payroll_stubs")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("pay_period_date", { ascending: false });

      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): PayrollStub => ({
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
    },
    enabled: !!userId,
  });
}

export function useAddPayrollStub() {
  const userId = useUserId();
  return useEntityMutation(
    async (stub: Omit<PayrollStub, "id" | "company_name">) => {
      const result = await supabase.from("payroll_stubs").insert({
        user_id: userId!,
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
      return throwOnError(result);
    },
    ["payroll"],
    "Payroll entry added",
  );
}

export function useDeletePayrollStub() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("payroll_stubs").delete().eq("id", id);
      return throwOnError(result);
    },
    ["payroll"],
    "Payroll entry deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Invoices
// ═══════════════════════════════════════════════════════════════

export function useInvoices() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["invoices", userId],
    queryFn: async () => {
      const result = await supabase
        .from("invoices")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("issue_date", { ascending: false });
      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): Invoice => ({
        ...(row as unknown as Invoice),
        company_name: (row.companies as { name: string } | null)?.name ?? "",
      }));
    },
    enabled: !!userId,
  });
}

export function useAddInvoice() {
  const userId = useUserId();
  return useEntityMutation(
    async (invoice: Omit<Invoice, "id" | "created_at" | "updated_at" | "user_id" | "company_name">) => {
      const result = await supabase.from("invoices").insert({ ...invoice, user_id: userId! });
      return throwOnError(result);
    },
    ["invoices"],
    "Invoice created",
  );
}

export function useUpdateInvoice() {
  return useEntityMutation(
    async ({ id, company_name: _, ...updates }: Partial<Invoice> & { id: string }) => {
      const result = await supabase.from("invoices").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["invoices"],
    "Invoice updated",
  );
}

export function useDeleteInvoice() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("invoices").delete().eq("id", id);
      return throwOnError(result);
    },
    ["invoices"],
    "Invoice deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// CRM Accounts
// ═══════════════════════════════════════════════════════════════

export function useCrmAccounts() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["accounts", userId],
    queryFn: async () => {
      const result = await supabase
        .from("accounts")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("name");
      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): CrmAccount => ({
        ...(row as unknown as CrmAccount),
        company_name: (row.companies as { name: string } | null)?.name ?? "",
      }));
    },
    enabled: !!userId,
  });
}

export function useAddCrmAccount() {
  const userId = useUserId();
  return useEntityMutation(
    async (account: Omit<CrmAccount, "id" | "created_at" | "updated_at" | "user_id" | "company_name">) => {
      const result = await supabase.from("accounts").insert({ ...account, user_id: userId! });
      return throwOnError(result);
    },
    ["accounts"],
    "Account created",
  );
}

export function useUpdateCrmAccount() {
  return useEntityMutation(
    async ({ id, company_name: _, ...updates }: Partial<CrmAccount> & { id: string }) => {
      const result = await supabase.from("accounts").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["accounts"],
    "Account updated",
  );
}

export function useDeleteCrmAccount() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("accounts").delete().eq("id", id);
      return throwOnError(result);
    },
    ["accounts"],
    "Account deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Contacts
// ═══════════════════════════════════════════════════════════════

export function useContacts(crmAccountId?: string) {
  const userId = useUserId();

  return useQuery({
    queryKey: ["contacts", userId, crmAccountId],
    queryFn: async () => {
      let query = supabase
        .from("contacts")
        .select("*")
        .eq("user_id", userId!)
        .order("first_name");
      if (crmAccountId) query = query.eq("crm_account_id", crmAccountId);
      return throwOnError(await query) as Contact[];
    },
    enabled: !!userId,
  });
}

export function useAddContact() {
  const userId = useUserId();
  return useEntityMutation(
    async (contact: Omit<Contact, "id" | "created_at" | "user_id">) => {
      const result = await supabase.from("contacts").insert({ ...contact, user_id: userId! });
      return throwOnError(result);
    },
    ["contacts"],
    "Contact added",
  );
}

export function useUpdateContact() {
  return useEntityMutation(
    async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const result = await supabase.from("contacts").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["contacts"],
    "Contact updated",
  );
}

export function useDeleteContact() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("contacts").delete().eq("id", id);
      return throwOnError(result);
    },
    ["contacts"],
    "Contact deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Leads
// ═══════════════════════════════════════════════════════════════

export function useLeads() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["leads", userId],
    queryFn: async () => {
      const result = await supabase
        .from("leads")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): Lead => ({
        ...(row as unknown as Lead),
        company_name: (row.companies as { name: string } | null)?.name ?? "",
      }));
    },
    enabled: !!userId,
  });
}

export function useAddLead() {
  const userId = useUserId();
  return useEntityMutation(
    async (lead: Omit<Lead, "id" | "created_at" | "updated_at" | "user_id" | "company_name">) => {
      const result = await supabase.from("leads").insert({ ...lead, user_id: userId! });
      return throwOnError(result);
    },
    ["leads"],
    "Lead created",
  );
}

export function useUpdateLead() {
  return useEntityMutation(
    async ({ id, company_name: _, ...updates }: Partial<Lead> & { id: string }) => {
      const result = await supabase.from("leads").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["leads"],
    "Lead updated",
  );
}

export function useDeleteLead() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("leads").delete().eq("id", id);
      return throwOnError(result);
    },
    ["leads"],
    "Lead deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Opportunities
// ═══════════════════════════════════════════════════════════════

export function useOpportunities() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["opportunities", userId],
    queryFn: async () => {
      const result = await supabase
        .from("opportunities")
        .select("*, crm_accounts(name)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): Opportunity => ({
        ...(row as unknown as Opportunity),
        account_name: (row.crm_accounts as { name: string } | null)?.name ?? "",
      }));
    },
    enabled: !!userId,
  });
}

export function useAddOpportunity() {
  const userId = useUserId();
  return useEntityMutation(
    async (opp: Omit<Opportunity, "id" | "created_at" | "updated_at" | "user_id" | "account_name">) => {
      const result = await supabase.from("opportunities").insert({ ...opp, user_id: userId! });
      return throwOnError(result);
    },
    ["opportunities"],
    "Opportunity created",
  );
}

export function useUpdateOpportunity() {
  return useEntityMutation(
    async ({ id, account_name: _, ...updates }: Partial<Opportunity> & { id: string }) => {
      const result = await supabase.from("opportunities").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["opportunities"],
    "Opportunity updated",
  );
}

export function useDeleteOpportunity() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("opportunities").delete().eq("id", id);
      return throwOnError(result);
    },
    ["opportunities"],
    "Opportunity deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Projects
// ═══════════════════════════════════════════════════════════════

export function useProjects() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["projects", userId],
    queryFn: async () => {
      const result = await supabase
        .from("projects")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): Project => ({
        ...(row as unknown as Project),
        company_name: (row.companies as { name: string } | null)?.name ?? "",
      }));
    },
    enabled: !!userId,
  });
}

export function useAddProject() {
  const userId = useUserId();
  return useEntityMutation(
    async (project: Omit<Project, "id" | "created_at" | "updated_at" | "user_id" | "company_name">) => {
      const result = await supabase.from("projects").insert({ ...project, user_id: userId! });
      return throwOnError(result);
    },
    ["projects"],
    "Project created",
  );
}

export function useUpdateProject() {
  return useEntityMutation(
    async ({ id, company_name: _, ...updates }: Partial<Project> & { id: string }) => {
      const result = await supabase.from("projects").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["projects"],
    "Project updated",
  );
}

export function useDeleteProject() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("projects").delete().eq("id", id);
      return throwOnError(result);
    },
    ["projects"],
    "Project deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Project Tasks
// ═══════════════════════════════════════════════════════════════

export function useProjectTasks(projectId?: string) {
  const userId = useUserId();

  return useQuery({
    queryKey: ["project_tasks", userId, projectId],
    queryFn: async () => {
      let query = supabase
        .from("project_tasks")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (projectId) query = query.eq("project_id", projectId);
      return throwOnError(await query) as ProjectTask[];
    },
    enabled: !!userId,
  });
}

export function useAddProjectTask() {
  const userId = useUserId();
  return useEntityMutation(
    async (task: Omit<ProjectTask, "id" | "created_at" | "updated_at" | "user_id">) => {
      const result = await supabase.from("project_tasks").insert({ ...task, user_id: userId! });
      return throwOnError(result);
    },
    ["project_tasks"],
    "Task created",
  );
}

export function useUpdateProjectTask() {
  return useEntityMutation(
    async ({ id, ...updates }: Partial<ProjectTask> & { id: string }) => {
      const result = await supabase.from("project_tasks").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["project_tasks"],
    "Task updated",
  );
}

export function useDeleteProjectTask() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("project_tasks").delete().eq("id", id);
      return throwOnError(result);
    },
    ["project_tasks"],
    "Task deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Events
// ═══════════════════════════════════════════════════════════════

export function useEvents() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["events", userId],
    queryFn: async () => {
      const result = await supabase
        .from("events")
        .select("*, companies(name)")
        .eq("user_id", userId!)
        .order("start_date", { ascending: false });
      const data = throwOnError(result) as Record<string, unknown>[];
      return data.map((row): Event => ({
        ...(row as unknown as Event),
        company_name: (row.companies as { name: string } | null)?.name ?? "",
      }));
    },
    enabled: !!userId,
  });
}

export function useAddEvent() {
  const userId = useUserId();
  return useEntityMutation(
    async (event: Omit<Event, "id" | "created_at" | "user_id" | "company_name">) => {
      const result = await supabase.from("events").insert({ ...event, user_id: userId! });
      return throwOnError(result);
    },
    ["events"],
    "Event created",
  );
}

export function useUpdateEvent() {
  return useEntityMutation(
    async ({ id, company_name: _, ...updates }: Partial<Event> & { id: string }) => {
      const result = await supabase.from("events").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["events"],
    "Event updated",
  );
}

export function useDeleteEvent() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("events").delete().eq("id", id);
      return throwOnError(result);
    },
    ["events"],
    "Event deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Documents
// ═══════════════════════════════════════════════════════════════

export function useDocuments() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["documents", userId],
    queryFn: async () => {
      const result = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      return throwOnError(result) as Document[];
    },
    enabled: !!userId,
  });
}

export function useAddDocument() {
  const userId = useUserId();
  return useEntityMutation(
    async (doc: Omit<Document, "id" | "created_at" | "updated_at" | "user_id">) => {
      const result = await supabase.from("documents").insert({ ...doc, user_id: userId! });
      return throwOnError(result);
    },
    ["documents"],
    "Document uploaded",
  );
}

export function useUpdateDocument() {
  return useEntityMutation(
    async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      const result = await supabase.from("documents").update(updates).eq("id", id);
      return throwOnError(result);
    },
    ["documents"],
    "Document updated",
  );
}

export function useDeleteDocument() {
  return useEntityMutation(
    async (id: string) => {
      const result = await supabase.from("documents").delete().eq("id", id);
      return throwOnError(result);
    },
    ["documents"],
    "Document deleted",
  );
}

// ═══════════════════════════════════════════════════════════════
// Activities
// ═══════════════════════════════════════════════════════════════

export function useActivities(entityType?: string, entityId?: string) {
  const userId = useUserId();

  return useQuery({
    queryKey: ["activities", userId, entityType, entityId],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (entityType) query = query.eq("related_entity_type", entityType);
      if (entityId) query = query.eq("related_entity_id", entityId);
      return throwOnError(await query) as Activity[];
    },
    enabled: !!userId,
  });
}

export function useAddActivity() {
  const userId = useUserId();
  return useEntityMutation(
    async (activity: Omit<Activity, "id" | "created_at" | "user_id">) => {
      const result = await supabase.from("activities").insert({ ...activity, user_id: userId! });
      return throwOnError(result);
    },
    ["activities"],
  );
}

// ═══════════════════════════════════════════════════════════════
// User Settings
// ═══════════════════════════════════════════════════════════════

export function useUserSettings() {
  const userId = useUserId();

  return useQuery({
    queryKey: ["user_settings", userId],
    queryFn: async () => {
      const result = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId!)
        .single();
      // Settings might not exist yet
      if (result.error && result.error.message.includes("0 rows")) return null;
      return result.data as UserSettings | null;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserSettings() {
  const userId = useUserId();
  return useEntityMutation(
    async (settings: Partial<UserSettings>) => {
      const result = await supabase
        .from("user_settings")
        .upsert({ ...settings, user_id: userId! }, { onConflict: "user_id" });
      return throwOnError(result);
    },
    ["user_settings"],
    "Settings saved",
  );
}
