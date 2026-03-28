"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect } from "@/components/ui/search-select";
import {
  useAddProject,
  useUpdateProject,
  useCompanies,
  useCrmAccounts,
  useOpportunities,
} from "@/lib/supabase-queries";
import type { Project, ProjectStatus, Priority, Currency } from "@/lib/types";
import { projectStatusLabels, priorityLabels } from "@/lib/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  company_id: z.string().optional(),
  account_crm_id: z.string().optional(),
  opportunity_id: z.string().optional(),
  budget: z.string().optional(),
  currency: z.enum(["EUR", "ALL"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const { data: companies = [] } = useCompanies();
  const { data: crmAccounts = [] } = useCrmAccounts();
  const { data: opportunities = [] } = useOpportunities();
  const isPending = addProject.isPending || updateProject.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "planning",
      priority: project?.priority || "medium",
      start_date: project?.start_date || "",
      end_date: project?.end_date || "",
      company_id: project?.company_id || "",
      account_crm_id: project?.account_crm_id || "",
      opportunity_id: project?.opportunity_id || "",
      budget: project?.budget != null ? String(project.budget) : "",
      currency: project?.currency || "EUR",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const budgetNum = values.budget ? Number(values.budget) : undefined;
      const payload = {
        name: values.name,
        description: values.description || undefined,
        status: values.status as ProjectStatus,
        priority: values.priority as Priority,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
        company_id: values.company_id || undefined,
        account_crm_id: values.account_crm_id || undefined,
        opportunity_id: values.opportunity_id || undefined,
        budget: budgetNum && budgetNum > 0 ? budgetNum : undefined,
        currency: values.currency as Currency,
      };

      if (project) {
        await updateProject.mutateAsync({ id: project.id, ...payload });
      } else {
        await addProject.mutateAsync(payload);
      }
      onSuccess?.();
    } catch {
      // error toast is automatic
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Project description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.entries(projectStatusLabels) as [ProjectStatus, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.entries(priorityLabels) as [Priority, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Account */}
          <FormField
            control={form.control}
            name="account_crm_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <SearchSelect
                  options={crmAccounts.map((a) => ({
                    value: a.id,
                    label: a.name,
                    subtitle: [a.type, a.email].filter(Boolean).join(" · "),
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search account..."
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Opportunity */}
          <FormField
            control={form.control}
            name="opportunity_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity</FormLabel>
                <SearchSelect
                  options={opportunities.map((o) => ({
                    value: o.id,
                    label: o.name,
                    subtitle: `${o.stage} ${o.amount ? `· €${o.amount.toLocaleString()}` : ""}`,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search opportunity..."
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="ALL">ALL</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {project ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
}
