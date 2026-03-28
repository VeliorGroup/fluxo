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
import { MoreHorizontal, Pencil, Trash, Users } from "lucide-react";
import { Person } from "@/lib/types";
import { useDeletePerson } from "@/lib/supabase-queries";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonForm } from "./person-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

interface PeopleTableProps {
  data: Person[];
}

export function PeopleTable({ data }: PeopleTableProps) {
  const deletePerson = useDeletePerson();
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);

  const handleDelete = () => {
    if (deletingPerson) {
      deletePerson.mutate(deletingPerson.id, {
        onSettled: () => setDeletingPerson(null),
      });
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <EmptyState
                    icon={Users}
                    title="No people found"
                    description="Add your first person to get started."
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>
                        {person.first_name} {person.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {person.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{person.role || "\u2014"}</span>
                      <span className="text-xs text-muted-foreground">
                        {person.department}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{person.company_name || "\u2014"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        person.status === "active"
                          ? "default"
                          : person.status === "on_leave"
                          ? "secondary"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {person.status.replace("_", " ")}
                    </Badge>
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
                          onClick={() => setEditingPerson(person)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeletingPerson(person)}
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
        open={!!editingPerson}
        onOpenChange={(open) => !open && setEditingPerson(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Person</DialogTitle>
            <DialogDescription>
              Update person details and assignment.
            </DialogDescription>
          </DialogHeader>
          {editingPerson && (
            <PersonForm
              person={editingPerson}
              onSuccess={() => setEditingPerson(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingPerson}
        onOpenChange={(open) => !open && setDeletingPerson(null)}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the person record."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deletePerson.isPending}
      />
    </>
  );
}
