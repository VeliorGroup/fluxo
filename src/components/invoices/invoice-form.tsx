"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompanies, useAddInvoice, useUpdateInvoice, useCrmAccounts, useOpportunities, useProjects } from "@/lib/supabase-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect } from "@/components/ui/search-select";
import { Loader2 } from "lucide-react";
import type { Invoice } from "@/lib/types";

const schema = z.object({
  invoice_number: z.string().min(1, "Required"),
  amount: z.number().positive("Must be positive"),
  currency: z.enum(["EUR", "ALL"]),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  issue_date: z.string().min(1, "Required"),
  due_date: z.string().optional(),
  paid_date: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  company_id: z.string().optional(),
  account_crm_id: z.string().optional(),
  opportunity_id: z.string().optional(),
  project_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function InvoiceForm({ invoice, onSuccess }: { invoice?: Invoice; onSuccess: () => void }) {
  const { data: companies = [] } = useCompanies();
  const { data: crmAccounts = [] } = useCrmAccounts();
  const { data: opportunities = [] } = useOpportunities();
  const { data: projects = [] } = useProjects();
  const addInvoice = useAddInvoice();
  const updateInvoice = useUpdateInvoice();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoice_number: invoice?.invoice_number ?? "",
      amount: invoice?.amount ?? 0,
      currency: invoice?.currency ?? "EUR",
      status: invoice?.status ?? "draft",
      issue_date: invoice?.issue_date ?? new Date().toISOString().split("T")[0],
      due_date: invoice?.due_date ?? "",
      paid_date: invoice?.paid_date ?? "",
      description: invoice?.description ?? "",
      notes: invoice?.notes ?? "",
      company_id: invoice?.company_id ?? "",
      account_crm_id: invoice?.account_crm_id ?? "",
      opportunity_id: invoice?.opportunity_id ?? "",
      project_id: invoice?.project_id ?? "",
    },
  });

  // When CRM account changes, auto-fill client name
  const selectedAccountId = form.watch("account_crm_id");
  const selectedAccount = crmAccounts.find((a) => a.id === selectedAccountId);

  const isPending = addInvoice.isPending || updateInvoice.isPending;

  async function onSubmit(data: FormValues) {
    // Get client name from selected CRM account
    const acc = crmAccounts.find((a) => a.id === data.account_crm_id);
    const payload = {
      ...data,
      client_name: acc?.name ?? "—",
      due_date: data.due_date || undefined,
      paid_date: data.paid_date || undefined,
      description: data.description || undefined,
      notes: data.notes || undefined,
      company_id: data.company_id || undefined,
      account_crm_id: data.account_crm_id || undefined,
      opportunity_id: data.opportunity_id || undefined,
      project_id: data.project_id || undefined,
    };

    if (invoice) {
      await updateInvoice.mutateAsync({ id: invoice.id, ...payload });
    } else {
      await addInvoice.mutateAsync(payload as Parameters<typeof addInvoice.mutateAsync>[0]);
    }
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Invoice #</Label>
          <Input {...form.register("invoice_number")} placeholder="INV-001" />
          {form.formState.errors.invoice_number && (
            <p className="text-xs text-destructive">{form.formState.errors.invoice_number.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as FormValues["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Account link */}
      <div className="space-y-1.5">
        <Label>Account</Label>
        <SearchSelect
          options={crmAccounts.map((a) => ({
            value: a.id,
            label: a.name,
            subtitle: [a.type, a.email].filter(Boolean).join(" · "),
          }))}
          value={form.watch("account_crm_id")}
          onChange={(v) => form.setValue("account_crm_id", v)}
          placeholder="Search account..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Amount</Label>
          <Input {...form.register("amount", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={form.watch("currency")} onValueChange={(v) => form.setValue("currency", v as "EUR" | "ALL")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="ALL">ALL (L)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Issue Date</Label>
          <Input {...form.register("issue_date")} type="date" />
        </div>
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input {...form.register("due_date")} type="date" />
        </div>
        <div className="space-y-1.5">
          <Label>Paid Date</Label>
          <Input {...form.register("paid_date")} type="date" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Opportunity link */}
        <div className="space-y-1.5">
          <Label>Opportunity</Label>
          <SearchSelect
            options={opportunities.map((o) => ({
              value: o.id,
              label: o.name,
              subtitle: `${o.stage} ${o.amount ? `· €${o.amount.toLocaleString()}` : ""}`,
            }))}
            value={form.watch("opportunity_id")}
            onChange={(v) => form.setValue("opportunity_id", v)}
            placeholder="Search opportunity..."
          />
        </div>

        {/* Project link */}
        <div className="space-y-1.5">
          <Label>Project</Label>
          <SearchSelect
            options={projects.map((p) => ({
              value: p.id,
              label: p.name,
              subtitle: `${p.status} ${p.company_name ? `· ${p.company_name}` : ""}`,
            }))}
            value={form.watch("project_id")}
            onChange={(v) => form.setValue("project_id", v)}
            placeholder="Search project..."
          />
        </div>
      </div>

      {companies.length > 0 && (
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Select value={form.watch("company_id") || "none"} onValueChange={(v) => form.setValue("company_id", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea {...form.register("description")} placeholder="Services provided..." rows={2} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {invoice ? "Update Invoice" : "Create Invoice"}
      </Button>
    </form>
  );
}
