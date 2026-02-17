"use client";

import { Search, Lock } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <Search className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Leads</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Track potential clients and business opportunities. This module is coming soon.
      </p>
    </div>
  );
}
