"use client";

import { type Activity, type ActivityType, activityTypeLabels } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  StickyNote,
  Mail,
  Phone,
  Video,
  CheckCircle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<ActivityType, LucideIcon> = {
  note: StickyNote,
  email: Mail,
  call: Phone,
  meeting: Video,
  task_completed: CheckCircle,
  status_change: RefreshCw,
};

const badgeVariantMap: Record<ActivityType, "default" | "secondary" | "outline"> = {
  note: "secondary",
  email: "default",
  call: "outline",
  meeting: "default",
  task_completed: "secondary",
  status_change: "outline",
};

export function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = iconMap[activity.type] ?? StickyNote;
  const label = activityTypeLabels[activity.type] ?? activity.type;
  const variant = badgeVariantMap[activity.type] ?? "secondary";

  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold truncate">
              {activity.subject || "Untitled"}
            </h3>
            <Badge variant={variant} className="shrink-0 text-[10px]">
              {label}
            </Badge>
          </div>
          {activity.body && (
            <p className="text-sm text-muted-foreground line-clamp-2">{activity.body}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {activity.created_at
              ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
              : "Unknown date"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
