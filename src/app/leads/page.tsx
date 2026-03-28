"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Users, Sparkles, CheckCircle2, ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { useLeads, useDeleteLead } from "@/lib/supabase-queries";
import { getLeadColumns } from "@/components/leads/lead-columns";
import { LeadForm } from "@/components/leads/lead-form";
import type { Lead } from "@/lib/types";

export default function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads();
  const deleteLead = useDeleteLead();

  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      getLeadColumns(
        (lead) => setEditLead(lead),
        (id) => setDeleteId(id),
      ),
    [],
  );

  const kpis = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const qualified = leads.filter((l) => l.status === "qualified").length;
    const converted = leads.filter((l) => l.status === "converted").length;
    return [
      { label: "Total Leads", value: total, icon: Users, iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-600 dark:text-slate-400" },
      { label: "New", value: newCount, icon: Sparkles, iconBg: "bg-blue-50 dark:bg-blue-950", iconColor: "text-blue-600 dark:text-blue-400" },
      { label: "Qualified", value: qualified, icon: CheckCircle2, iconBg: "bg-emerald-50 dark:bg-emerald-950", iconColor: "text-emerald-600 dark:text-emerald-400" },
      { label: "Converted", value: converted, icon: ArrowRightCircle, iconBg: "bg-violet-50 dark:bg-violet-950", iconColor: "text-violet-600 dark:text-violet-400" },
    ];
  }, [leads]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover and qualify potential customers
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Lead</DialogTitle>
            </DialogHeader>
            <LeadForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="rounded-xl shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl shadow-sm border-border/50">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={leads}
            searchPlaceholder="Search leads..."
            emptyTitle="No leads yet"
            emptyDescription="Add your first lead to start tracking prospects."
            emptyIcon={Search}
            enableExport
            exportFilename="leads"
            exportTitle="Leads"
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editLead} onOpenChange={(open) => !open && setEditLead(null)}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {editLead && (
            <LeadForm lead={editLead} onSuccess={() => setEditLead(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLead.isPending}
        onConfirm={async () => {
          if (deleteId) {
            await deleteLead.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
