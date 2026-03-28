"use client";

import { useMemo, useState } from "react";
import { Plus, FileText, Send, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { useInvoices, useDeleteInvoice } from "@/lib/supabase-queries";
import { getInvoiceColumns } from "@/components/invoices/invoice-columns";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { formatCurrencyFull, invoiceStatusLabels, type Invoice } from "@/lib/types";
import { format, parseISO } from "date-fns";

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  const [addOpen, setAddOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const columns = useMemo(
    () => getInvoiceColumns({
      onView: (inv) => setViewInvoice(inv),
      onEdit: (inv) => setEditInvoice(inv),
      onDelete: (inv) => setDeleteTarget(inv),
    }),
    [],
  );

  const kpis = useMemo(() => {
    const total = invoices.length;
    const draft = invoices.filter((i) => i.status === "draft").length;
    const sent = invoices.filter((i) => i.status === "sent").length;
    const paid = invoices.filter((i) => i.status === "paid").length;
    const overdue = invoices.filter((i) => i.status === "overdue").length;
    const totalAmount = invoices.filter((i) => i.status !== "cancelled").reduce((s, i) => s + i.amount, 0);
    const paidAmount = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const outstandingAmount = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);
    return [
      { label: "Total Invoices", value: total.toString(), icon: FileText, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
      { label: "Paid", value: `€${paidAmount.toLocaleString()}`, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
      { label: "Outstanding", value: `€${outstandingAmount.toLocaleString()}`, icon: Clock, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
      { label: "Overdue", value: overdue.toString(), icon: AlertTriangle, color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
    ];
  }, [invoices]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage invoices for clients</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Invoice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
            <InvoiceForm onSuccess={() => setAddOpen(false)} />
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
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Search invoices..."
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice."
        emptyIcon={FileText}
        enableExport
        exportFilename="invoices"
      />

      {/* View Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Invoice Details</DialogTitle></DialogHeader>
          {viewInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Invoice #" value={viewInvoice.invoice_number} />
                <Detail label="Status">
                  <Badge variant="outline" className="rounded-full border-0 capitalize">
                    {invoiceStatusLabels[viewInvoice.status]}
                  </Badge>
                </Detail>
                <Detail label="Client" value={viewInvoice.client_name} />
                <Detail label="Amount" value={formatCurrencyFull(viewInvoice.amount, viewInvoice.currency ?? "EUR")} />
                <Detail label="Issued" value={format(parseISO(viewInvoice.issue_date), "dd MMM yyyy")} />
                <Detail label="Due" value={viewInvoice.due_date ? format(parseISO(viewInvoice.due_date), "dd MMM yyyy") : "—"} />
              </div>
              {viewInvoice.description && <Detail label="Description" value={viewInvoice.description} />}
              {viewInvoice.notes && <Detail label="Notes" value={viewInvoice.notes} />}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editInvoice} onOpenChange={(open) => !open && setEditInvoice(null)}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          {editInvoice && <InvoiceForm invoice={editInvoice} onSuccess={() => setEditInvoice(null)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Invoice"
        description={deleteTarget ? `Delete invoice ${deleteTarget.invoice_number} for ${deleteTarget.client_name}?` : ""}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteInvoice.isPending}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteInvoice.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      {children ?? <p className="text-sm font-medium">{value}</p>}
    </div>
  );
}
