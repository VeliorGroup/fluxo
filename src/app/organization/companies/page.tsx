"use client";

import { useState } from "react";
import { useCompanies } from "@/lib/supabase-data";
import { CompaniesTable } from "@/components/organization/companies-table";
import { CompanyForm } from "@/components/organization/company-form";
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

export default function CompaniesPage() {
  const { companies, loading, refresh } = useCompanies();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your legal entities and their details.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
              <DialogDescription>
                Add a new legal entity to your organization.
              </DialogDescription>
            </DialogHeader>
            <CompanyForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <CompaniesTable data={companies} loading={loading} />
    </div>
  );
}
