"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect } from "@/components/ui/search-select";
import { Loader2 } from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { opportunityStageLabels } from "@/lib/types";
import {
  useAddOpportunity,
  useUpdateOpportunity,
  useCrmAccounts,
} from "@/lib/supabase-queries";

const opportunitySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  crm_account_id: z.string().optional(),
  stage: z.string().min(1, "Stage is required"),
  amount: z.string().optional(),
  currency: z.enum(["EUR", "ALL"]).optional(),
  probability: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      { message: "Must be between 0 and 100" },
    ),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

type OpportunityFormProps = {
  opportunity?: Opportunity;
  onSuccess: () => void;
};

export function OpportunityForm({ opportunity, onSuccess }: OpportunityFormProps) {
  const addOpportunity = useAddOpportunity();
  const updateOpportunity = useUpdateOpportunity();
  const { data: accounts = [] } = useCrmAccounts();
  const isEdit = !!opportunity;

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: opportunity?.name ?? "",
      crm_account_id: opportunity?.crm_account_id ?? "",
      stage: opportunity?.stage ?? "prospecting",
      amount: opportunity?.amount != null ? String(opportunity.amount) : "",
      currency: opportunity?.currency ?? "EUR",
      probability: opportunity?.probability != null ? String(opportunity.probability) : "",
      expected_close_date: opportunity?.expected_close_date ?? "",
      notes: opportunity?.notes ?? "",
    },
  });

  useEffect(() => {
    if (opportunity) {
      form.reset({
        name: opportunity.name ?? "",
        crm_account_id: opportunity.crm_account_id ?? "",
        stage: opportunity.stage ?? "prospecting",
        amount: opportunity.amount != null ? String(opportunity.amount) : "",
        currency: opportunity.currency ?? "EUR",
        probability: opportunity.probability != null ? String(opportunity.probability) : "",
        expected_close_date: opportunity.expected_close_date ?? "",
        notes: opportunity.notes ?? "",
      });
    }
  }, [opportunity, form]);

  async function onSubmit(data: OpportunityFormData) {
    try {
      const payload = {
        name: data.name,
        crm_account_id: data.crm_account_id || undefined,
        stage: data.stage as Opportunity["stage"],
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency || undefined,
        probability: data.probability ? Number(data.probability) : undefined,
        expected_close_date: data.expected_close_date || undefined,
        notes: data.notes || undefined,
      };

      if (isEdit) {
        await updateOpportunity.mutateAsync({ id: opportunity.id, ...payload });
      } else {
        await addOpportunity.mutateAsync(payload as Parameters<typeof addOpportunity.mutateAsync>[0]);
      }

      form.reset();
      onSuccess();
    } catch {
      // Error toast handled by mutation hook
    }
  }

  const isPending = addOpportunity.isPending || updateOpportunity.isPending;
  const stageEntries = Object.entries(opportunityStageLabels) as [string, string][];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Opportunity name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account */}
        <FormField
          control={form.control}
          name="crm_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <SearchSelect
                options={accounts.map((a) => ({
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

        <div className="grid grid-cols-2 gap-3">
          {/* Stage */}
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stageEntries.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
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

        <div className="grid grid-cols-2 gap-3">
          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Probability */}
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probability (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0-100" min={0} max={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Expected Close Date */}
        <FormField
          control={form.control}
          name="expected_close_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Close Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Update Opportunity" : "Create Opportunity"}
        </Button>
      </form>
    </Form>
  );
}
