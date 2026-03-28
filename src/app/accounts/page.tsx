"use client";

import { useMemo, useState } from "react";
import { Plus, Wallet, Users, UserCheck, Handshake, Store } from "lucide-react";
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
import { useCrmAccounts, useDeleteCrmAccount } from "@/lib/supabase-queries";
import { getCrmAccountColumns } from "@/components/crm/crm-account-columns";
import { CrmAccountForm } from "@/components/crm/crm-account-form";
import type { CrmAccount } from "@/lib/types";

export default function AccountsCRMPage() {
  const { data: accounts = [], isLoading } = useCrmAccounts();
  const deleteAccount = useDeleteCrmAccount();

  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<CrmAccount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      getCrmAccountColumns(
        (account) => setEditAccount(account),
        (id) => setDeleteId(id),
      ),
    [],
  );

  const kpis = useMemo(() => {
    const total = accounts.length;
    const clients = accounts.filter((a) => a.type === "client").length;
    const prospects = accounts.filter((a) => a.type === "prospect").length;
    const partners = accounts.filter((a) => a.type === "partner").length;
    return [
      { label: "Total Accounts", value: total, icon: Users, iconBg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-600 dark:text-slate-400" },
      { label: "Clients", value: clients, icon: UserCheck, iconBg: "bg-blue-50 dark:bg-blue-950", iconColor: "text-blue-600 dark:text-blue-400" },
      { label: "Prospects", value: prospects, icon: Handshake, iconBg: "bg-amber-50 dark:bg-amber-950", iconColor: "text-amber-600 dark:text-amber-400" },
      { label: "Partners", value: partners, icon: Store, iconBg: "bg-emerald-50 dark:bg-emerald-950", iconColor: "text-emerald-600 dark:text-emerald-400" },
    ];
  }, [accounts]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage client relationships and contacts
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Account</DialogTitle>
            </DialogHeader>
            <CrmAccountForm onSuccess={() => setAddOpen(false)} />
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
            data={accounts}
            searchPlaceholder="Search accounts..."
            emptyTitle="No accounts yet"
            emptyDescription="Add your first account to get started."
            emptyIcon={Wallet}
            enableExport
            exportFilename="crm-accounts"
            exportTitle="Accounts"
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editAccount} onOpenChange={(open) => !open && setEditAccount(null)}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          {editAccount && (
            <CrmAccountForm
              account={editAccount}
              onSuccess={() => setEditAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteAccount.isPending}
        onConfirm={async () => {
          if (deleteId) {
            await deleteAccount.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
