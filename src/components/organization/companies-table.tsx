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
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Company } from "@/lib/types";
import { useDeleteCompany } from "@/lib/supabase-queries";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanyForm } from "./company-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";

interface CompaniesTableProps {
  data: Company[];
}

export function CompaniesTable({ data }: CompaniesTableProps) {
  const deleteCompany = useDeleteCompany();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const handleDelete = () => {
    if (deletingCompany) {
      deleteCompany.mutate(deletingCompany.id, {
        onSettled: () => setDeletingCompany(null),
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>NIPT</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <EmptyState
                    icon={Building2}
                    title="No companies found"
                    description="Add your first company to get started."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="capitalize">
                    {company.type.replace("_", " ")}
                  </TableCell>
                  <TableCell>{company.nipt || "-"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {company.email || company.phone || "-"}
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
                          onClick={() => setEditingCompany(company)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeletingCompany(company)}
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
        open={!!editingCompany}
        onOpenChange={(open) => !open && setEditingCompany(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Make changes to the company details here.
            </DialogDescription>
          </DialogHeader>
          {editingCompany && (
            <CompanyForm
              company={editingCompany}
              onSuccess={() => setEditingCompany(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingCompany}
        onOpenChange={(open) => !open && setDeletingCompany(null)}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the company and remove it from our servers."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteCompany.isPending}
      />
    </>
  );
}
