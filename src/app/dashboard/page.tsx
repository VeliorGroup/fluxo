import { KPICards } from "@/components/dashboard/kpi-cards";
import { RunwayChart } from "@/components/dashboard/runway-chart";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your real-time cash flow overview across all entities.
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Runway Chart */}
      <RunwayChart />

      {/* Upcoming Payments */}
      <UpcomingPayments />
    </div>
  );
}
