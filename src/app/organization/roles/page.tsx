"use client";

import { useRoles } from "@/lib/supabase-queries";
import { RolesTable } from "@/components/organization/roles/roles-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoleForm } from "@/components/organization/roles/role-form";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";

export default function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define roles and responsibilities within your organization.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Role</DialogTitle>
              <DialogDescription>
                Create a new role for your organization.
              </DialogDescription>
            </DialogHeader>
            <RoleForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <RolesTable data={roles} />
      )}
    </div>
  );
}
