"use client";

import { useAuth } from "@/components/auth-provider";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import type { ExchangeRateData } from "@/lib/exchange-rate";

export function AppShell({
  exchangeRate,
  children,
}: {
  exchangeRate: ExchangeRateData;
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Login page — no sidebar, full-bleed
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Hub page — no sidebar, full-bleed
  if (pathname === "/hub") {
    return <>{children}</>;
  }

  // Authenticated — sidebar + content
  return (
    <div className="flex min-h-screen">
      <Sidebar exchangeRate={exchangeRate} />
      <main className="flex-1 md:ml-64">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 md:py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
