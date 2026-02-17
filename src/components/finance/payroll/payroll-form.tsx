"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyFull, type Company } from "@/lib/types";
import { addMonths, endOfMonth, setDate, format } from "date-fns";
import { ArrowRight, Banknote, Landmark, Percent, Hash } from "lucide-react";

type TaxMode = "percentage" | "fixed";

const payrollSchema = z.object({
  employee_name: z.string().min(1, "Employee name is required"),
  employee_id: z.string().min(1, "Employee ID is required"),
  gross_salary: z
    .string()
    .min(1, "Gross salary is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Must be a positive number",
    }),
  tax_value: z
    .string()
    .min(1, "Tax value is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Must be a non-negative number",
    }),
  company_id: z.string().min(1, "Company is required"),
  pay_period_date: z.string().min(1, "Pay period is required"),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

export function PayrollForm({ companies = [], onAdd }: { companies?: Company[]; onAdd?: () => void }) {
  const [taxMode, setTaxMode] = useState<TaxMode>("percentage");
  const [preview, setPreview] = useState<{
    net: number;
    taxes: number;
    salaryDue: string;
    taxesDue: string;
  } | null>(null);

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employee_name: "",
      employee_id: "",
      gross_salary: "",
      tax_value: "25",
      company_id: "",
      pay_period_date: new Date().toISOString().split("T")[0],
    },
  });

  const watchGross = form.watch("gross_salary");
  const watchTaxValue = form.watch("tax_value");
  const watchDate = form.watch("pay_period_date");

  // Recompute preview whenever values change
  const gross = Number(watchGross);
  const taxVal = Number(watchTaxValue);
  const canPreview = !isNaN(gross) && !isNaN(taxVal) && gross > 0 && taxVal >= 0;

  let computedTaxes = 0;
  let computedNet = 0;
  if (canPreview) {
    computedTaxes =
      taxMode === "percentage"
        ? Math.round(gross * (taxVal / 100))
        : taxVal;
    computedNet = gross - computedTaxes;
  }

  const payDate = new Date(watchDate || new Date());
  const salaryDue = format(endOfMonth(payDate), "MMM dd, yyyy");
  const taxesDue = format(setDate(addMonths(payDate, 1), 15), "MMM dd, yyyy");

  // Sync preview
  if (canPreview) {
    if (
      !preview ||
      preview.net !== computedNet ||
      preview.taxes !== computedTaxes ||
      preview.salaryDue !== salaryDue ||
      preview.taxesDue !== taxesDue
    ) {
      setTimeout(
        () =>
          setPreview({
            net: computedNet,
            taxes: computedTaxes,
            salaryDue,
            taxesDue,
          }),
        0
      );
    }
  }

  async function onSubmit(data: PayrollFormData) {
    console.log("Payroll submitted:", { ...data, taxMode });
    form.reset();
    setPreview(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Payroll Entry</CardTitle>
        <CardDescription>
          Enter gross salary and tax contribution — choose between percentage or
          fixed amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Andi Hoxha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. E001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="gross_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Salary (ALL)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="80000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax Mode Toggle + Value */}
              <FormField
                control={form.control}
                name="tax_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Tax & Contributions</span>
                      <div className="flex items-center rounded-md border border-border overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            setTaxMode("percentage");
                            form.setValue("tax_value", "25");
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium transition-colors ${
                            taxMode === "percentage"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          <Percent className="h-2.5 w-2.5" />
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxMode("fixed");
                            form.setValue("tax_value", "20000");
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium transition-colors ${
                            taxMode === "fixed"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          <Hash className="h-2.5 w-2.5" />
                          Fixed
                        </button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          taxMode === "percentage" ? "25" : "20000"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pay_period_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Period Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

            {/* Preview: Split Cash Outflows */}
            {preview && (
              <>
                <Separator />
                <div className="rounded-lg border border-dashed border-border p-4">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Cash Outflow Split Preview
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-lg bg-emerald-500/5 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Banknote className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Net Salary</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrencyFull(preview.net)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Due: {preview.salaryDue}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-amber-500/5 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                        <Landmark className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Taxes & Contributions
                        </p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrencyFull(preview.taxes)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Due: {preview.taxesDue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Create Payroll Entry
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
