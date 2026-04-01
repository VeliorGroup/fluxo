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
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useAccounts, useCompanies, useAddTransfer } from "@/lib/supabase-queries";

const transferSchema = z
  .object({
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Must be a positive number",
      }),
    date: z.string().min(1, "Date is required"),
    description: z.string().min(1, "Description is required").max(200),
    from_account_id: z.string().min(1, "Source account is required"),
    to_account_id: z.string().min(1, "Destination account is required"),
  })
  .refine((data) => data.from_account_id !== data.to_account_id, {
    message: "Cannot transfer to the same account",
    path: ["to_account_id"],
  });

type TransferFormData = z.infer<typeof transferSchema>;

export function TransferDialog() {
  const [open, setOpen] = useState(false);
  const addTransfer = useAddTransfer();
  const { data: accounts = [], isLoading: accLoading } = useAccounts();
  const { data: companies = [], isLoading: compLoading } = useCompanies();

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      from_account_id: "",
      to_account_id: "",
    },
  });

  const fromAccountId = form.watch("from_account_id");
  const toAccountId = form.watch("to_account_id");
  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  async function onSubmit(data: TransferFormData) {
    const from = accounts.find((a) => a.id === data.from_account_id)!;
    const to = accounts.find((a) => a.id === data.to_account_id)!;

    try {
      await addTransfer.mutateAsync({
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: Number(data.amount),
        date: data.date,
        description: data.description,
        from_company_id: from.company_id,
        to_company_id: to.company_id,
        from_currency: from.currency,
        to_currency: to.currency,
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  // Group accounts by company
  const groupedAccounts = companies
    .map((company) => ({
      company,
      accounts: accounts.filter((a) => a.company_id === company.id),
    }))
    .filter((g) => g.accounts.length > 0);

  const currencySymbol = (currency?: string) =>
    currency === "ALL" ? "L" : "€";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
          <DialogDescription>
            Move money between accounts. This creates two linked transactions
            and won&apos;t count as income or expense.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* From Account */}
            <FormField
              control={form.control}
              name="from_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={accLoading || compLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupedAccounts.map((group) => (
                        <SelectGroup key={group.company.id}>
                          <SelectLabel>{group.company.name}</SelectLabel>
                          {group.accounts.map((acc) => (
                            <SelectItem
                              key={acc.id}
                              value={acc.id}
                              disabled={acc.id === toAccountId}
                            >
                              {acc.name} ({acc.currency})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Arrow indicator */}
            <div className="flex items-center justify-center py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px w-12 bg-border" />
                <ArrowRightLeft className="h-4 w-4" />
                <div className="h-px w-12 bg-border" />
              </div>
            </div>

            {/* To Account */}
            <FormField
              control={form.control}
              name="to_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={accLoading || compLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupedAccounts.map((group) => (
                        <SelectGroup key={group.company.id}>
                          <SelectLabel>{group.company.name}</SelectLabel>
                          {group.accounts.map((acc) => (
                            <SelectItem
                              key={acc.id}
                              value={acc.id}
                              disabled={acc.id === fromAccountId}
                            >
                              {acc.name} ({acc.currency})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                          {currencySymbol(fromAccount?.currency)}
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Move funds to EUR account"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            {fromAccount && toAccount && form.watch("amount") && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="text-muted-foreground">
                  {currencySymbol(fromAccount.currency)}
                  {form.watch("amount")} will leave{" "}
                  <span className="font-medium text-foreground">
                    {fromAccount.name}
                  </span>{" "}
                  and arrive in{" "}
                  <span className="font-medium text-foreground">
                    {toAccount.name}
                  </span>
                </p>
                {fromAccount.currency !== toAccount.currency && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Different currencies — the amount will be recorded as-is in
                    both accounts.
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addTransfer.isPending}>
                {addTransfer.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Record Transfer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
