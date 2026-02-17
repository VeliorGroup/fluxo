"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencyToggle } from "@/components/currency-toggle";
import { useAuth } from "@/components/auth-provider";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ArrowRightLeft,
  ArrowLeft,
  Users,
  Wallet,
  Menu,
  X,
  Waves,
  TrendingDown,
  TrendingUp,
  LogOut,
  Banknote,
  ClipboardList,
  PlusCircle,
  Building2,
  CalendarDays,
  Search,
  Target,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ExchangeRateData } from "@/lib/exchange-rate";

// ── Module definitions ─────────────────────────────
type NavItem = { href: string; label: string; icon: LucideIcon };

type ModuleDef = {
  id: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  routes: string[];   // pathnames that belong to this module
  navItems: NavItem[];
};

const modules: ModuleDef[] = [
  {
    id: "expo",
    title: "Expo & Events",
    icon: CalendarDays,
    gradient: "from-teal-500 to-cyan-600",
    routes: ["/expo"],
    navItems: [],
  },
  {
    id: "leads",
    title: "Leads",
    icon: Search,
    gradient: "from-amber-500 to-yellow-600",
    routes: ["/leads"],
    navItems: [],
  },
  {
    id: "accounts-crm",
    title: "Accounts",
    icon: Wallet,
    gradient: "from-cyan-500 to-blue-600",
    routes: ["/accounts-crm"],
    navItems: [],
  },
  {
    id: "opportunities",
    title: "Opportunities",
    icon: Target,
    gradient: "from-green-500 to-emerald-600",
    routes: ["/opportunities"],
    navItems: [],
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderKanban,
    gradient: "from-indigo-500 to-blue-600",
    routes: ["/projects"],
    navItems: [],
  },
  {
    id: "finance",
    title: "Finance",
    icon: Waves,
    gradient: "from-blue-500 to-violet-600",
    routes: ["/finance/dashboard", "/finance/accounts", "/finance/exchange-rates", "/finance/transactions", "/finance/payroll"],
    navItems: [
      { href: "/finance/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/finance/accounts", label: "Accounts", icon: Wallet },
      { href: "/finance/transactions", label: "Transactions", icon: ArrowLeftRight },
      { href: "/finance/exchange-rates", label: "Exchange Rates", icon: ArrowRightLeft },
      { href: "/finance/payroll", label: "Payroll", icon: ClipboardList },
    ],
  },
  {
    id: "organization",
    title: "Organization",
    icon: Building2,
    gradient: "from-purple-500 to-pink-600",
    routes: ["/organization"],
    navItems: [
      { href: "/organization/companies", label: "Companies", icon: Building2 },
      { href: "/organization/departments", label: "Departments", icon: ClipboardList },
      { href: "/organization/roles", label: "Roles", icon: Users },
      { href: "/organization/org-chart", label: "Org Chart", icon: ArrowLeftRight },
      { href: "/organization/people", label: "People", icon: Users },
    ],
  },
];

function getActiveModule(pathname: string): ModuleDef | undefined {
  return modules.find((m) => m.routes.some((r) => pathname.startsWith(r)));
}

export function Sidebar({
  exchangeRate,
}: {
  exchangeRate: ExchangeRateData;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, username } = useAuth();

  const activeModule = getActiveModule(pathname);
  const navItems = activeModule?.navItems ?? [];
  const moduleTitle = activeModule?.title ?? "Fluxo";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          collapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo + Module name */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Fluxo
            </span>
            <span className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
              {moduleTitle}
            </span>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* Back to Hub */}
          <Link
            href="/hub"
            onClick={() => setCollapsed(true)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Link>
          <div className="border-b border-border mb-2" />

          {/* Module-specific nav items */}
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCollapsed(true)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer — Exchange Rate + Theme + Currency + Logout */}
        <div className="border-t border-border p-4 space-y-3">
          {/* Exchange rate badge */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                €/L
              </span>
              <span className="text-sm font-bold tabular-nums">
                {exchangeRate.rate.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {exchangeRate.change < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : exchangeRate.change > 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : null}
              <span
                className={cn(
                  "text-[10px] font-medium tabular-nums",
                  exchangeRate.change < 0
                    ? "text-red-500"
                    : exchangeRate.change > 0
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                )}
              >
                {exchangeRate.change > 0 ? "+" : ""}
                {exchangeRate.change.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Currency + Theme toggles */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Currency</span>
            <CurrencyToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          {/* User + Logout */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                {username?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span className="text-xs font-medium truncate">{username}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-500 shrink-0"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
