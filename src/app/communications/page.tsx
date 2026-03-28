"use client";

import { useState, useMemo } from "react";
import { useActivities } from "@/lib/supabase-queries";
import { type ActivityType, activityTypeLabels } from "@/lib/types";
import { ActivityCard } from "@/components/communications/activity-card";
import { ActivityForm } from "@/components/communications/activity-form";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MessageSquare } from "lucide-react";

const activityTypes = Object.entries(activityTypeLabels) as [ActivityType, string][];

export default function CommunicationsPage() {
  const { data: activities = [], isLoading } = useActivities();
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return activities;
    return activities.filter((a) => a.type === typeFilter);
  }, [activities, typeFilter]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground">Track all communications and interactions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>
                Record a new communication or interaction.
              </DialogDescription>
            </DialogHeader>
            <ActivityForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {activityTypes.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No activities found"
          description={
            typeFilter === "all"
              ? "Log your first activity to start tracking communications."
              : "No activities match the selected filter."
          }
          action={
            typeFilter === "all"
              ? { label: "Log Activity", onClick: () => setOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
