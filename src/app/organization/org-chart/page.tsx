"use client";

import { useDepartments, useRoles } from "@/lib/supabase-data";
import { OrgChartTree } from "@/components/organization/org-chart/org-chart-tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function OrgChartPage() {
  const { departments, loading: loadingDepts } = useDepartments();
  const { roles, loading: loadingRoles } = useRoles();

  const loading = loadingDepts || loadingRoles;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
          <p className="mt-1 text-muted-foreground">
            Visual representation of your company structure.
          </p>
        </div>
      </div>

      <div className="flex-1 border rounded-lg p-6 bg-muted/20">
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
