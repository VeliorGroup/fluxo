"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
} from "lucide-react";
import type { Document, DocumentType } from "@/lib/types";
import { documentTypeLabels } from "@/lib/types";

type ColumnCallbacks = {
  onEdit: (doc: Document) => void;
  onDelete: (id: string) => void;
};

const typeVariant: Record<DocumentType, string> = {
  invoice: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  contract: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  proposal: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  report: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  template: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function getDocIcon(type?: DocumentType) {
  switch (type) {
    case "invoice":
    case "contract":
      return <FileText className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "report":
      return <FileSpreadsheet className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "template":
      return <FileImage className="mr-2 h-4 w-4 text-muted-foreground" />;
    default:
      return <File className="mr-2 h-4 w-4 text-muted-foreground" />;
  }
}

function formatFileSize(bytes?: number): string {
  if (bytes == null) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getDocumentColumns({ onEdit, onDelete }: ColumnCallbacks): ColumnDef<Document>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          {getDocIcon(row.original.type)}
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as DocumentType | undefined;
        if (!type) return "-";
        return (
          <Badge variant="outline" className={typeVariant[type]}>
            {documentTypeLabels[type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "file_size",
      header: "Size",
      cell: ({ row }) => formatFileSize(row.original.file_size),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags;
        if (!tags || tags.length === 0) return "-";
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string | undefined;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
