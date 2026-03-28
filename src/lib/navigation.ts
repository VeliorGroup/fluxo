import {
  LayoutDashboard,
  ArrowLeftRight,
  ArrowRightLeft,
  Users,
  Wallet,
  Waves,
  ClipboardList,
  Building2,
  CalendarDays,
  Search,
  Target,
  FolderKanban,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export type ModuleDef = {
  id: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  description: string;
  routes: string[];
  navItems: NavItem[];
  active: boolean;
};

export const modules: ModuleDef[] = [
  {
    id: "finance",
    title: "Finance",
    icon: Waves,
    gradient: "from-violet-500 to-indigo-600",
    description: "Cash flow, accounts, transactions, payroll, exchange rates",
    routes: ["/finance"],
    active: true,
    navItems: [
      { href: "/finance/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/finance/accounts", label: "Bank Accounts", icon: Wallet },
      { href: "/finance/transactions", label: "Transactions", icon: ArrowLeftRight },
      { href: "/finance/exchange-rates", label: "Exchange Rates", icon: ArrowRightLeft },
      { href: "/finance/payroll", label: "Payroll", icon: ClipboardList },
      { href: "/finance/import", label: "Import Statement", icon: FileText },
    ],
  },
  {
    id: "organization",
    title: "Organization",
    icon: Building2,
    gradient: "from-pink-500 to-rose-600",
    description: "Companies, departments, roles, people, org chart",
    routes: ["/organization"],
    active: true,
    navItems: [
      { href: "/organization/companies", label: "Companies", icon: Building2 },
      { href: "/organization/departments", label: "Departments", icon: ClipboardList },
      { href: "/organization/roles", label: "Roles", icon: Users },
      { href: "/organization/org-chart", label: "Org Chart", icon: ArrowLeftRight },
      { href: "/organization/people", label: "People", icon: Users },
    ],
  },
  {
    id: "leads",
    title: "Leads",
    icon: Search,
    gradient: "from-amber-500 to-orange-600",
    description: "Discover and qualify leads",
    routes: ["/leads"],
    active: true,
    navItems: [
      { href: "/leads", label: "All Leads", icon: Search },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    icon: Wallet,
    gradient: "from-cyan-500 to-blue-600",
    description: "Client accounts, contacts, and relationships",
    routes: ["/accounts"],
    active: true,
    navItems: [
      { href: "/accounts", label: "All Accounts", icon: Wallet },
    ],
  },
  {
    id: "opportunities",
    title: "Opportunities",
    icon: Target,
    gradient: "from-emerald-500 to-green-600",
    description: "Sales pipeline and forecasting",
    routes: ["/opportunities"],
    active: true,
    navItems: [
      { href: "/opportunities", label: "Pipeline", icon: Target },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderKanban,
    gradient: "from-blue-500 to-indigo-600",
    description: "Project management and task tracking",
    routes: ["/projects"],
    active: true,
    navItems: [
      { href: "/projects", label: "All Projects", icon: FolderKanban },
    ],
  },
  {
    id: "invoices",
    title: "Invoices",
    icon: FileText,
    gradient: "from-indigo-500 to-blue-600",
    description: "Create and manage client invoices",
    routes: ["/invoices"],
    active: true,
    navItems: [
      { href: "/invoices", label: "All Invoices", icon: FileText },
    ],
  },
  {
    id: "expo",
    title: "Expo & Events",
    icon: CalendarDays,
    gradient: "from-teal-500 to-cyan-600",
    description: "Trade shows, fairs, and business events",
    routes: ["/expo"],
    active: true,
    navItems: [
      { href: "/expo", label: "All Events", icon: CalendarDays },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    icon: FileText,
    gradient: "from-slate-500 to-gray-600",
    description: "File management and document storage",
    routes: ["/documents"],
    active: true,
    navItems: [
      { href: "/documents", label: "All Documents", icon: FileText },
    ],
  },
  {
    id: "reports",
    title: "Reports",
    icon: BarChart3,
    gradient: "from-purple-500 to-violet-600",
    description: "Analytics, dashboards, and insights",
    routes: ["/reports"],
    active: true,
    navItems: [
      { href: "/reports", label: "Overview", icon: BarChart3 },
    ],
  },
  {
    id: "communications",
    title: "Activity",
    icon: MessageSquare,
    gradient: "from-orange-500 to-red-600",
    description: "Activity log, notes, and communications",
    routes: ["/communications"],
    active: true,
    navItems: [
      { href: "/communications", label: "Activity Feed", icon: MessageSquare },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    gradient: "from-gray-500 to-slate-600",
    description: "Preferences, profile, and configuration",
    routes: ["/settings"],
    active: true,
    navItems: [
      { href: "/settings", label: "General", icon: Settings },
    ],
  },
];

export function getActiveModule(pathname: string): ModuleDef | undefined {
  return modules.find((m) => m.routes.some((r) => pathname.startsWith(r)));
}

// Auto-generate route labels from modules
export const routeLabels: Record<string, string> = Object.fromEntries(
  modules.flatMap((m) => [
    [m.routes[0], m.title],
    ...m.navItems.map((item) => [item.href, item.label]),
  ])
);
