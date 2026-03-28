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
import { MoreHorizontal, Pencil, Trash, FolderTree } from "lucide-react";
import { Department } from "@/lib/types";
import { useDeleteDepartment, useCompanies, useDepartments } from "@/lib/supabase-queries";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DepartmentForm } from "./department-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface DepartmentsTableProps {
  data: Department[];
}

export function DepartmentsTable({ data }: DepartmentsTableProps) {
  const deleteDepartment = useDeleteDepartment();
  const { data: companies = [] } = useCompanies();
  const { data: allDepartments = [] } = useDepartments();
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  const handleDelete = () => {
    if (deletingDepartment) {
      deleteDepartment.mutate(deletingDepartment.id, {
        onSettled: () => setDeletingDepartment(null),
      });
    }
  };

  const getCompanyName = (id: string) => {
    return companies.find((c) => c.id === id)?.name || "Unknown";
  };

  const getParentName = (parentId?: string) => {
    if (!parentId) return "-";
    return allDepartments.find((d) => d.id === parentId)?.name || "Unknown";
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Parent Department</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <EmptyState
                    icon={FolderTree}
                    title="No departments found"
                    description="Add your first department to get started."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{getCompanyName(dept.company_id)}</TableCell>
                  <TableCell>{getParentName(dept.parent_id)}</TableCell>
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
                          onClick={() => setEditingDepartment(dept)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeletingDepartment(dept)}
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
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Make changes to the department details here.
            </DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <DepartmentForm
              department={editingDepartment}
              onSuccess={() => setEditingDepartment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingDepartment}
        onOpenChange={(open) => !open && setDeletingDepartment(null)}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the department and remove it from our servers."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteDepartment.isPending}
      />
    </>
  );
}
