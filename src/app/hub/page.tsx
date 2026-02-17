"use client";

import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencyToggle } from "@/components/currency-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Waves,
  Building2,
  Users,
  Banknote,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
  DollarSign,
  LogOut,
  ArrowRight,
  Lock,
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  ArrowLeftRight,
  ClipboardList,
  PlusCircle,
  Search,
  CalendarDays,
  Target,
  FolderKanban,
} from "lucide-react";

type SubItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AppModule = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  active: boolean;
  gradient: string;
  iconBg: string;
  subItems?: SubItem[];
};

const modules: AppModule[] = [
  {
    id: "expo",
    title: "Expo & Events",
    description: "Plan, manage and track trade shows, fairs and business events.",
    icon: CalendarDays,
    href: "#",
    active: false,
    gradient: "from-teal-500 to-cyan-600",
    iconBg: "bg-teal-500/10 text-teal-500",
  },
  {
    id: "leads",
    title: "Leads",
    description: "Search and discover leads via campaigns or Google Maps.",
    icon: Search,
    href: "#",
    active: false,
    gradient: "from-amber-500 to-yellow-600",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
  {
    id: "accounts-crm",
    title: "Accounts",
    description: "Manage client relationships, contacts and interactions.",
    icon: Wallet,
    href: "/accounts-crm",
    active: false,
    gradient: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-500/10 text-cyan-500",
    subItems: [],
  },
  {
    id: "opportunities",
    title: "Opportunities",
    description: "Track sales opportunities, pipelines and forecasts.",
    icon: Target,
    href: "#",
    active: false,
    gradient: "from-green-500 to-emerald-600",
    iconBg: "bg-green-500/10 text-green-500",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Project management, tasks, timelines and collaboration.",
    icon: FolderKanban,
    href: "#",
    active: false,
    gradient: "from-indigo-500 to-blue-600",
    iconBg: "bg-indigo-500/10 text-indigo-500",
  },
  {
    id: "finance",
    title: "Finance",
    description: "Financial overview, transactions, payroll and runway tracking.",
    icon: DollarSign,
    href: "/finance/dashboard",
    active: true,
    gradient: "from-blue-500 to-violet-600",
    iconBg: "bg-blue-500/10 text-blue-500",
    subItems: [
      { label: "Dashboard", href: "/finance/dashboard", icon: LayoutDashboard },
      { label: "Transactions", href: "/finance/transactions", icon: ArrowLeftRight },
      { label: "Payroll", href: "/finance/payroll", icon: ClipboardList },
      { label: "Exchange Rates", href: "/finance/exchange-rates", icon: ArrowRightLeft },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    description: "Centralized document management, templates and e-signatures.",
    icon: FileText,
    href: "#",
    active: false,
    gradient: "from-cyan-500 to-sky-600",
    iconBg: "bg-cyan-500/10 text-cyan-500",
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    description: "Business intelligence, custom dashboards and KPI tracking.",
    icon: BarChart3,
    href: "#",
    active: false,
    gradient: "from-purple-500 to-indigo-600",
    iconBg: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "communications",
    title: "Communications",
    description: "Internal messaging, announcements and team collaboration.",
    icon: MessageSquare,
    href: "#",
    active: false,
    gradient: "from-red-500 to-pink-600",
    iconBg: "bg-red-500/10 text-red-500",
  },
  {
    id: "organization",
    title: "Organization",
    description: "Company structure, departments, roles and org chart.",
    icon: Building2,
    href: "/organization",
    active: true,
    gradient: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-500/10 text-pink-500",
    subItems: [
      { label: "Companies", href: "/organization/companies", icon: Building2 },
      { label: "Departments", href: "/organization/departments", icon: ClipboardList },
      { label: "Roles", href: "/organization/roles", icon: Users },
      { label: "Org Chart", href: "/organization/org-chart", icon: ArrowLeftRight },
      { label: "People", href: "/organization/people", icon: Users },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    description: "General configuration, integrations and user preferences.",
    icon: Settings,
    href: "#",
    active: false,
    gradient: "from-slate-500 to-zinc-600",
    iconBg: "bg-slate-500/10 text-slate-500",
  },
];

export default function HubPage() {
  const { isAuthenticated, username, logout } = useAuth();

  if (!isAuthenticated) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--muted)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.3)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-10">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight">Fluxo</span>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyToggle />
              <ThemeToggle />
              <div className="flex items-center gap-2 rounded-full bg-muted/50 pl-1 pr-3 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[11px] font-bold text-white">
                  {username?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <span className="text-sm font-medium">{username}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-6 py-12">
          {/* Greeting */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
                {username}
              </span>
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Select a module to get started with your business management platform.
            </p>
          </div>

          {/* Module Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((mod) => (
              <ModuleCard key={mod.id} module={mod} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-xs text-muted-foreground">
              Fluxo — Business Management Platform
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function ModuleCard({ module }: { module: AppModule }) {
  const Icon = module.icon;

  if (!module.active) {
    return (
      <div className="group relative flex flex-col rounded-2xl border border-border/50 bg-card/50 p-6 opacity-60 cursor-default select-none">
        {/* Coming soon badge */}
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Lock className="h-2.5 w-2.5" />
            Coming Soon
          </span>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${module.iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold">{module.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {module.description}
        </p>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-transparent hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1">
      {/* Hover gradient border effect */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl scale-105`}
      />
      <div className="absolute inset-[1px] rounded-[15px] bg-card z-0 group-hover:bg-card/95 transition-colors duration-300" />

      {/* Card header — clickable */}
      <Link href={module.href} className="relative z-10 p-6 pb-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${module.iconBg}
                      transition-all duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold group-hover:text-foreground transition-colors">
          {module.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {module.description}
        </p>
      </Link>

      {/* Sub-items — individual clickable links */}
      {module.subItems && module.subItems.length > 0 && (
        <div className="relative z-10 border-t border-border/50 mx-4 mb-4 mt-1 pt-3 space-y-0.5">
          {module.subItems.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <Link
                key={sub.label}
                href={sub.href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                <SubIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{sub.label}</span>
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
