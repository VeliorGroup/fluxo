"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { modules } from "@/lib/navigation";
import {
  Search,
  Plus,
  ArrowRight,
} from "lucide-react";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Reset search when opened
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  // All navigable pages
  const allPages = modules.flatMap((mod) =>
    mod.navItems.map((item) => ({
      ...item,
      module: mod.title,
      moduleIcon: mod.icon,
    }))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-lg [&>button]:hidden">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12" loop>
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Search pages, actions..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[350px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Navigation */}
            <Command.Group heading="Pages">
              {allPages.map((page) => (
                <Command.Item
                  key={page.href}
                  value={`${page.module} ${page.label}`}
                  onSelect={() => navigate(page.href)}
                  className="flex items-center gap-3 rounded-lg text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                >
                  <page.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1">{page.label}</span>
                  <span className="text-[10px] text-muted-foreground">{page.module}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                </Command.Item>
              ))}
            </Command.Group>

            {/* Quick actions */}
            <Command.Group heading="Quick Actions">
              <Command.Item
                value="add transaction"
                onSelect={() => navigate("/finance/transactions")}
                className="flex items-center gap-3 rounded-lg text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Add Transaction</span>
              </Command.Item>
              <Command.Item
                value="add person employee"
                onSelect={() => navigate("/organization/people")}
                className="flex items-center gap-3 rounded-lg text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Add Person</span>
              </Command.Item>
              <Command.Item
                value="add company"
                onSelect={() => navigate("/organization/companies")}
                className="flex items-center gap-3 rounded-lg text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Add Company</span>
              </Command.Item>
              <Command.Item
                value="add lead"
                onSelect={() => navigate("/leads")}
                className="flex items-center gap-3 rounded-lg text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Add Lead</span>
              </Command.Item>
              <Command.Item
                value="add project"
                onSelect={() => navigate("/projects")}
                className="flex items-center gap-3 rounded-lg text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Add Project</span>
              </Command.Item>
            </Command.Group>

            {/* Modules */}
            <Command.Group heading="Modules">
              {modules.map((mod) => (
                <Command.Item
                  key={mod.id}
                  value={`module ${mod.title} ${mod.description}`}
                  onSelect={() => navigate(mod.navItems[0]?.href ?? mod.routes[0])}
                  className="flex items-center gap-3 rounded-lg text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                >
                  <mod.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{mod.title}</span>
                    <p className="text-[10px] text-muted-foreground truncate">{mod.description}</p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Hook for keyboard shortcut
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
