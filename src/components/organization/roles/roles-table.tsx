"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Shield } from "lucide-react";
import { Role } from "@/lib/types";
import { useDeleteRole, useDepartments, useRoles } from "@/lib/supabase-queries";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleForm } from "./role-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface RolesTableProps {
  data: Role[];
}

export function RolesTable({ data }: RolesTableProps) {
  const deleteRole = useDeleteRole();
  const { data: departments = [] } = useDepartments();
  const { data: allRoles = [] } = useRoles();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const handleDelete = () => {
    if (deletingRole) {
      deleteRole.mutate(deletingRole.id, {
        onSettled: () => setDeletingRole(null),
      });
    }
  };

  const getDepartmentName = (id: string) => {
    return departments.find((d) => d.id === id)?.name || "Unknown";
  };

  const getParentName = (parentId?: string) => {
    if (!parentId) return "-";
    return allRoles.find((r) => r.id === parentId)?.name || "Unknown";
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Parent Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <EmptyState
                    icon={Shield}
                    title="No roles found"
                    description="Add your first role to get started."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{getDepartmentName(role.department_id)}</TableCell>
                  <TableCell>{getParentName(role.parent_id)}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[200px]">
                    {role.description || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setEditingRole(role)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeletingRole(role)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Make changes to the role details here.
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <RoleForm
              role={editingRole}
              onSuccess={() => setEditingRole(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the role and remove it from our servers."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteRole.isPending}
      />
    </>
  );
}
