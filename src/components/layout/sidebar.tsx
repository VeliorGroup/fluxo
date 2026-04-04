"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { modules, getActiveModule } from "@/lib/navigation";
import {
  X,
  TrendingDown,
  TrendingUp,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import type { ExchangeRateData } from "@/lib/exchange-rate";

const STORAGE_KEY = "fluxo-sidebar-collapsed";

const allOrder = ["finance", "leads", "accounts", "opportunities", "projects", "invoices", "documents", "expo", "organization"];
const modulesById = Object.fromEntries(modules.map((m) => [m.id, m]));
const orderedModules = allOrder.map((id) => modulesById[id]).filter(Boolean);

export function Sidebar({
  exchangeRate,
  onOpenCommandPalette,
  mobileOpen,
  onMobileOpenChange,
}: {
  exchangeRate: ExchangeRateData;
  onOpenCommandPalette?: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const activeModule = getActiveModule(pathname);

  const renderModuleItem = (mod: typeof modules[0]) => {
    const isActive = mod.routes.some((r) => pathname.startsWith(r));
    const hasSubItems = mod.navItems.length > 1;
    const mainHref = mod.navItems[0]?.href ?? mod.routes[0];
    const Icon = mod.icon;

    if (collapsed) {
      return (
        <Tooltip key={mod.id}>
          <TooltipTrigger asChild>
            <Link
              href={mainHref}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{mod.title}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div key={mod.id}>
        <Link
          href={mainHref}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1">{mod.title}</span>
          {hasSubItems && isActive && (
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          )}
        </Link>

        {isActive && hasSubItems && (
          <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-primary/25 pl-3">
            {mod.navItems.map((sub) => {
              const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                    subActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => onMobileOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-dvh flex-col border-r border-border/60 bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "md:w-[68px]" : "md:w-60",
          "max-md:w-[280px] max-md:-translate-x-full",
          mobileOpen && "max-md:translate-x-0 max-md:shadow-2xl",
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-14 items-center shrink-0 border-b border-border/30",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}>
          {!collapsed ? (
            <>
              <Link href="/finance/dashboard" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-extrabold shadow-sm">
                  F
                </div>
                <span className="text-base font-bold tracking-tight">Fluxo</span>
              </Link>
              {/* Close button on mobile */}
              <button
                onClick={() => onMobileOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:hidden"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link href="/finance/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-extrabold shadow-sm">
              F
            </Link>
          )}
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-2.5 py-4">
          <div className="space-y-1">
            {orderedModules.map(renderModuleItem)}
          </div>
        </nav>

        {/* Footer */}
        <div className={cn(
          "shrink-0 border-t border-border/30",
          collapsed ? "p-2 space-y-1.5" : "p-3 space-y-2"
        )}>
          {/* Exchange rate */}
          {!collapsed ? (
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">EUR/ALL</span>
                <span className="text-xs font-bold tabular-nums">{exchangeRate.rate.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {exchangeRate.change < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : exchangeRate.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : null}
                <span className={cn(
                  "text-[10px] font-medium tabular-nums",
                  exchangeRate.change < 0 ? "text-red-500" : exchangeRate.change > 0 ? "text-emerald-500" : "text-muted-foreground"
                )}>
                  {exchangeRate.change > 0 ? "+" : ""}
                  {exchangeRate.change.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center rounded-xl bg-muted/50 py-2 text-[10px] font-bold tabular-nums">
                  {exchangeRate.rate.toFixed(0)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">EUR/ALL {exchangeRate.rate.toFixed(2)}</TooltipContent>
            </Tooltip>
          )}

          {/* Logout */}
          {!collapsed ? (
            <>
              <button
                onClick={logout}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/8 transition-all duration-200 w-full"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground w-full justify-start h-auto"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
              >
                <ChevronsLeft className="h-4 w-4" />
                Collapse
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="flex h-10 w-full items-center justify-center rounded-xl text-red-500 hover:bg-red-500/8 transition-all duration-200"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}

          {/* Expand button */}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-full rounded-xl text-muted-foreground hover:text-foreground hidden md:flex"
                  onClick={toggleCollapsed}
                  aria-label="Expand sidebar"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
}
