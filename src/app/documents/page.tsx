"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { useDocuments, useDeleteDocument } from "@/lib/supabase-queries";
import { getDocumentColumns } from "@/components/documents/document-columns";
import { DocumentForm } from "@/components/documents/document-form";
import type { Document } from "@/lib/types";

export default function DocumentsPage() {
  const { data: documents = [], isLoading } = useDocuments();
  const deleteDocument = useDeleteDocument();
  const [addOpen, setAddOpen] = useState(false);
  const [editDocument, setEditDocument] = useState<Document | null>(null);

  if (isLoading) return <PageSkeleton />;

  const columns = getDocumentColumns({
    onEdit: (doc) => setEditDocument(doc),
    onDelete: (id) => deleteDocument.mutate(id),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage files and documents
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
            </DialogHeader>
            <DocumentForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={documents}
        searchPlaceholder="Search documents..."
        emptyIcon={FileText}
        emptyTitle="No documents yet"
        emptyDescription="Add your first document to get started."
        enableExport
        exportFilename="documents"
      />

      {/* Edit dialog */}
      {editDocument && (
        <Dialog open={!!editDocument} onOpenChange={() => setEditDocument(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
            </DialogHeader>
            <DocumentForm
              document={editDocument}
              onSuccess={() => setEditDocument(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
