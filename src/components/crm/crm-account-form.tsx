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
import { Loader2 } from "lucide-react";
import type { CrmAccount } from "@/lib/types";
import {
  useAddCrmAccount,
  useUpdateCrmAccount,
  useCompanies,
} from "@/lib/supabase-queries";

const crmAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  company_id: z.string().optional(),
});

type CrmAccountFormData = z.infer<typeof crmAccountSchema>;

type CrmAccountFormProps = {
  account?: CrmAccount;
  onSuccess: () => void;
};

export function CrmAccountForm({ account, onSuccess }: CrmAccountFormProps) {
  const addAccount = useAddCrmAccount();
  const updateAccount = useUpdateCrmAccount();
  const { data: companies = [] } = useCompanies();
  const isEdit = !!account;

  const form = useForm<CrmAccountFormData>({
    resolver: zodResolver(crmAccountSchema),
    defaultValues: {
      name: account?.name ?? "",
      type: account?.type ?? "",
      industry: account?.industry ?? "",
      website: account?.website ?? "",
      email: account?.email ?? "",
      phone: account?.phone ?? "",
      address: account?.address ?? "",
      notes: account?.notes ?? "",
      company_id: account?.company_id ?? "",
    },
  });

  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name ?? "",
        type: account.type ?? "",
        industry: account.industry ?? "",
        website: account.website ?? "",
        email: account.email ?? "",
        phone: account.phone ?? "",
        address: account.address ?? "",
        notes: account.notes ?? "",
        company_id: account.company_id ?? "",
      });
    }
  }, [account, form]);

  async function onSubmit(data: CrmAccountFormData) {
    try {
      const payload = {
        name: data.name,
        type: data.type || undefined,
        industry: data.industry || undefined,
        website: data.website || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        company_id: data.company_id || undefined,
      };

      if (isEdit) {
        await updateAccount.mutateAsync({ id: account.id, ...payload } as Parameters<typeof updateAccount.mutateAsync>[0]);
      } else {
        await addAccount.mutateAsync(payload as Parameters<typeof addAccount.mutateAsync>[0]);
      }

      form.reset();
      onSuccess();
    } catch {
      // Error toast handled by mutation hook
    }
  }

  const isPending = addAccount.isPending || updateAccount.isPending;

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
                <Input placeholder="Account name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industry */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Technology" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+355..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street, City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Company */}
        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company (optional)" />
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
          {isEdit ? "Update Account" : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
