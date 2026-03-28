"use client";

import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { useOpportunities, useDeleteOpportunity } from "@/lib/supabase-queries";
import { getOpportunityColumns } from "@/components/opportunities/opportunity-columns";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { formatCurrencyFull } from "@/lib/types";
import type { Opportunity } from "@/lib/types";

export default function OpportunitiesPage() {
  const { data: opportunities = [], isLoading } = useOpportunities();
  const deleteOpportunity = useDeleteOpportunity();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpportunity, setEditOpportunity] = useState<Opportunity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      getOpportunityColumns(
        (opp) => setEditOpportunity(opp),
        (id) => setDeleteId(id),
      ),
    [],
  );

  const kpis = useMemo(() => {
    const totalPipeline = opportunities.reduce(
      (sum, o) => sum + (o.amount ?? 0),
      0,
    );
    const weightedValue = opportunities.reduce(
      (sum, o) => sum + (o.amount ?? 0) * ((o.probability ?? 0) / 100),
      0,
    );
    const openCount = opportunities.filter(
      (o) => o.stage !== "closed_won" && o.stage !== "closed_lost",
    ).length;
    const closedWon = opportunities.filter((o) => o.stage === "closed_won").length;
    const closedTotal = opportunities.filter(
      (o) => o.stage === "closed_won" || o.stage === "closed_lost",
    ).length;
    const winRate = closedTotal > 0 ? Math.round((closedWon / closedTotal) * 100) : 0;

    return { totalPipeline, weightedValue, openCount, winRate };
  }, [opportunities]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">Track your sales pipeline</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Opportunity</DialogTitle>
            </DialogHeader>
            <OpportunityForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyFull(kpis.totalPipeline, "EUR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrencyFull(kpis.weightedValue, "EUR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {kpis.openCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {kpis.winRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={opportunities}
        searchPlaceholder="Search opportunities..."
        emptyTitle="No opportunities yet"
        emptyDescription="Add your first opportunity to start tracking deals."
        emptyIcon={Target}
        enableExport
        exportFilename="opportunities"
        exportTitle="Opportunities"
      />

      {/* Edit Dialog */}
      <Dialog
        open={!!editOpportunity}
        onOpenChange={(open) => !open && setEditOpportunity(null)}
      >
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
          </DialogHeader>
          {editOpportunity && (
            <OpportunityForm
              opportunity={editOpportunity}
              onSuccess={() => setEditOpportunity(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Opportunity"
        description="Are you sure you want to delete this opportunity? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteOpportunity.isPending}
        onConfirm={async () => {
          if (deleteId) {
            await deleteOpportunity.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
