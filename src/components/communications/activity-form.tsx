"use client";

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
import { type ActivityType, activityTypeLabels } from "@/lib/types";
import { useAddActivity } from "@/lib/supabase-queries";

const activitySchema = z.object({
  type: z.enum(["note", "email", "call", "meeting", "task_completed", "status_change"], {
    message: "Activity type is required",
  }),
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

const activityTypes = Object.entries(activityTypeLabels) as [ActivityType, string][];

export function ActivityForm({ onSuccess }: { onSuccess?: () => void }) {
  const addActivity = useAddActivity();

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "note",
      subject: "",
      body: "",
    },
  });

  async function onSubmit(values: ActivityFormData) {
    await addActivity.mutateAsync({
      type: values.type,
      subject: values.subject,
      body: values.body || undefined,
    });
    form.reset();
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activityTypes.map(([value, label]) => (
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

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Activity subject..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional notes or details..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={addActivity.isPending}>
            {addActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Activity
          </Button>
        </div>
      </form>
    </Form>
  );
}
