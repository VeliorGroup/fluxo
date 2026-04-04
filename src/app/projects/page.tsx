"use client";

import { useState } from "react";
import { Plus, FolderKanban, Clock, PauseCircle, CheckCircle2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects, useDeleteProject } from "@/lib/supabase-queries";
import { getProjectColumns } from "@/components/projects/project-columns";
import { ProjectForm } from "@/components/projects/project-form";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [addOpen, setAddOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  if (isLoading) return <PageSkeleton />;

  const total = projects.length;
  const active = projects.filter((p) => p.status === "active").length;
  const onHold = projects.filter((p) => p.status === "on_hold").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  const columns = getProjectColumns({
    onEdit: (project) => setEditProject(project),
    onDelete: (id) => deleteProject.mutate(id),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Project management and task tracking
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <PauseCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        searchPlaceholder="Search projects..."
        enableExport
        exportFilename="projects"
      />

      {/* Edit dialog */}
      {editProject && (
        <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              project={editProject}
              onSuccess={() => setEditProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
