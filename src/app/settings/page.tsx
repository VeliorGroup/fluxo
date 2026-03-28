"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserSettings, useUpdateUserSettings, useCompanies } from "@/lib/supabase-queries";
import { useAuth } from "@/components/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { Loader2, Settings, User } from "lucide-react";

const settingsSchema = z.object({
  default_currency: z.enum(["EUR", "ALL"]),
  default_company_id: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { data: settings, isLoading: settingsLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { user, username } = useAuth();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      default_currency: "EUR",
      default_company_id: "",
      theme: "system",
    },
  });

  // Sync form values when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        default_currency: settings.default_currency ?? "EUR",
        default_company_id: settings.default_company_id ?? "",
        theme: settings.theme ?? "system",
      });
    }
  }, [settings, form]);

  const isLoading = settingsLoading || companiesLoading;

  if (isLoading) return <PageSkeleton />;

  async function onSubmit(values: SettingsFormData) {
    await updateSettings.mutateAsync({
      default_currency: values.default_currency,
      default_company_id: values.default_company_id || undefined,
      theme: values.theme,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Configure your default settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="default_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="ALL">ALL - Albanian Lek</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="default_company_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Company</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[300px]">
                              <SelectValue placeholder="Select a company" />
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
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateSettings.isPending}>
                      {updateSettings.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-bold text-white">
                  {username?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="text-lg font-semibold">{username ?? "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email ?? "No email"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 max-w-md">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Username</Label>
                  <p className="text-sm font-medium">{username ?? "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="text-sm font-medium">{user?.email ?? "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">User ID</Label>
                  <p className="text-sm font-mono text-xs text-muted-foreground">{user?.id ?? "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
