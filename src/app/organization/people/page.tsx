"use client";

import { useState } from "react";
import { usePeople } from "@/lib/supabase-queries";
import { PeopleTable } from "@/components/organization/people-table";
import { PersonForm } from "@/components/organization/person-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";

export default function PeoplePage() {
  const { data: people = [], isLoading } = usePeople();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">People</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your employees and their roles.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Person</DialogTitle>
              <DialogDescription>
                Add a new person to your organization.
              </DialogDescription>
            </DialogHeader>
            <PersonForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <PeopleTable data={people} />
      )}
    </div>
  );
}
