"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { categoryLabels, type TransactionCategory } from "@/lib/types";
import { useTransactions, useAccounts, useCompanies } from "@/lib/supabase-data";
import { toast } from "sonner";

const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) !== 0, {
      message: "Must be a non-zero number",
    }),
  currency: z.enum(["EUR", "ALL"], {
    message: "Currency is required",
  }),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required").max(200),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["income", "expense"], {
    message: "Type is required",
  }),
  recurrence: z.enum(["one_time", "monthly", "annual"], {
    message: "Recurrence is required",
  }),
  status: z.enum(["paid", "pending", "forecasted"], {
    message: "Status is required",
  }),
  company_id: z.string().min(1, "Company is required"),
  account_id: z.string().min(1, "Account is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const { addTransaction } = useTransactions();
  const { accounts, loading: accLoading } = useAccounts();
  const { companies, loading: compLoading } = useCompanies();
  const [loading, setLoading] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      currency: "EUR",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      type: "expense",
      recurrence: "one_time",
      status: "pending",
      company_id: "",
      account_id: "",
    },
  });

  // Watch account selection to update currency and company
  const selectedAccountId = form.watch("account_id");
  useEffect(() => {
    if (selectedAccountId) {
      const acc = accounts.find((a) => a.id === selectedAccountId);
      if (acc) {
        form.setValue("currency", acc.currency);
        form.setValue("company_id", acc.company_id);
      }
    }
  }, [selectedAccountId, accounts, form]);

  async function onSubmit(data: TransactionFormData) {
    setLoading(true);
    try {
      const amount = Number(data.amount);
      const finalAmount = data.type === "expense" ? -Math.abs(amount) : Math.abs(amount);
      
      await addTransaction({
        ...data,
        amount: finalAmount,
        category: data.category as TransactionCategory,
      });
      
      toast.success("Transaction created successfully");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create transaction");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const categories = Object.entries(categoryLabels) as [
    TransactionCategory,
    string
  ][];

  // Group accounts by company
  const groupedAccounts = companies.map(company => ({
    company,
    accounts: accounts.filter(a => a.company_id === company.id)
  })).filter(g => g.accounts.length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Add a new income or expense entry.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Income
                          </span>
                        </SelectItem>
                        <SelectItem value="expense">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Expense
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="forecasted">Forecasted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account Selection (implies Company and Currency) */}
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={accLoading || compLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {groupedAccounts.map(group => (
                         <SelectGroup key={group.company.id}>
                           <SelectLabel>{group.company.name}</SelectLabel>
                           {group.accounts.map(acc => (
                             <SelectItem key={acc.id} value={acc.id}>
                               {acc.name} ({acc.currency})
                             </SelectItem>
                           ))}
                         </SelectGroup>
                       ))}
                       {groupedAccounts.length === 0 && (
                         <div className="p-2 text-sm text-muted-foreground">
                           No accounts found. Create one in Accounts page first.
                         </div>
                       )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden fields for validity or manual overrides if needed. 
                For now we rely on useEffect to set them, but we can display them read-only if we want.
                Let's display Currency as read-only. */}
            
             <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="hidden">
                     <FormControl>
                       <Input {...field} />
                     </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem className="hidden">
                     <FormControl>
                       <Input {...field} />
                     </FormControl>
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                           {form.watch("currency") === "EUR" ? "€" : "L"}
                         </span>
                         <Input
                           type="number"
                           placeholder="0.00"
                           {...field}
                           className="pl-8"
                         />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(([value, label]) => (
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
              
              {/* Recurrence */}
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="one_time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Website Redesign Payment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Transaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
