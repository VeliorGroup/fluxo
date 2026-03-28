"use client";

import { useDepartments, useRoles } from "@/lib/supabase-queries";
import { OrgChartTree } from "@/components/organization/org-chart/org-chart-tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

export default function OrgChartPage() {
  const { data: departments = [], isLoading: loadingDepts } = useDepartments();
  const { data: roles = [], isLoading: loadingRoles } = useRoles();

  const loading = loadingDepts || loadingRoles;

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Organization Chart</h1>
          <p className="mt-1 text-muted-foreground">
            Visual representation of your company structure.
          </p>
        </div>
      </div>

      <div className="flex-1 border rounded-lg p-3 sm:p-6 bg-muted/20 overflow-x-auto">
        <Tabs defaultValue="departments" className="w-full flex flex-col h-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="departments" className="flex-1 mt-0">
            <OrgChartTree items={departments} type="departments" />
          </TabsContent>
          <TabsContent value="roles" className="flex-1 mt-0">
            <OrgChartTree items={roles} type="roles" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
