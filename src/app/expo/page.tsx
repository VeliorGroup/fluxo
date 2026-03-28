"use client";

import { useState } from "react";
import { Plus, CalendarDays, CalendarCheck, Play, DollarSign } from "lucide-react";
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
import { useEvents, useDeleteEvent } from "@/lib/supabase-queries";
import { getEventColumns } from "@/components/events/event-columns";
import { EventForm } from "@/components/events/event-form";
import { formatCurrencyFull } from "@/lib/types";
import type { Event } from "@/lib/types";

export default function ExpoPage() {
  const { data: events = [], isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();
  const [addOpen, setAddOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  if (isLoading) return <PageSkeleton />;

  const total = events.length;
  const upcoming = events.filter(
    (e) => e.status === "planned" || e.status === "confirmed"
  ).length;
  const inProgress = events.filter((e) => e.status === "in_progress").length;
  const totalBudget = events.reduce((sum, e) => sum + (e.budget ?? 0), 0);

  const columns = getEventColumns({
    onEdit: (event) => setEditEvent(event),
    onDelete: (id) => deleteEvent.mutate(id),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage trade shows, fairs, and business events
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            <EventForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyFull(totalBudget, "EUR")}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={events}
        searchPlaceholder="Search events..."
        enableExport
        exportFilename="events"
      />

      {/* Edit dialog */}
      {editEvent && (
        <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EventForm
              event={editEvent}
              onSuccess={() => setEditEvent(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
