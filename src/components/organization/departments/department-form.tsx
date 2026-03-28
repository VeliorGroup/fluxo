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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments, useCompanies, useAddDepartment, useUpdateDepartment } from "@/lib/supabase-queries";
import { Department } from "@/lib/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  company_id: z.string().min(1, {
    message: "Please select a company.",
  }),
  parent_id: z.string().optional(),
});

interface DepartmentFormProps {
  department?: Department;
  onSuccess?: () => void;
}

export function DepartmentForm({ department, onSuccess }: DepartmentFormProps) {
  const addDepartment = useAddDepartment();
  const updateDepartment = useUpdateDepartment();
  const { data: departments = [] } = useDepartments();
  const { data: companies = [] } = useCompanies();
  const isPending = addDepartment.isPending || updateDepartment.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: department?.name || "",
      company_id: department?.company_id || "",
      parent_id: department?.parent_id || "none",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const parentId = values.parent_id === "none" ? null : values.parent_id;

    try {
      if (department) {
        await updateDepartment.mutateAsync({
          id: department.id,
          name: values.name,
          company_id: values.company_id,
          parent_id: parentId as string | undefined,
        });
      } else {
        await addDepartment.mutateAsync({
          name: values.name,
          company_id: values.company_id,
          parent_id: parentId as string | undefined,
        });
      }
      onSuccess?.();
    } catch {
      // error toast is automatic
    }
  }

  // Filter departments to avoid circular dependency (can't be parent of itself)
  const availableParents = departments.filter(d =>
    d.company_id === form.watch("company_id") && // Must be in same company
    d.id !== department?.id
  );

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
                <Input placeholder="Engineering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Department (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableParents.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {department ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
