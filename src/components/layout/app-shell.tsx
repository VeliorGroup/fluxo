"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencyToggle } from "@/components/currency-toggle";
import { Search, Bell, Menu } from "lucide-react";
import type { ExchangeRateData } from "@/lib/exchange-rate";

export function AppShell({
  exchangeRate,
  children,
}: {
  exchangeRate: ExchangeRateData;
  children: React.ReactNode;
}) {
  const { isAuthenticated, username } = useAuth();
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar
        exchangeRate={exchangeRate}
        onOpenCommandPalette={() => setCmdOpen(true)}
        mobileOpen={sidebarOpen}
        onMobileOpenChange={setSidebarOpen}
      />

      <main className="flex-1 transition-all duration-300 max-md:ml-0 md:ml-60 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="px-3 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-2 sm:gap-4">
              {/* Mobile hamburger — inside top bar */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors md:hidden shrink-0"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search trigger */}
              <button
                onClick={() => setCmdOpen(true)}
                className="flex flex-1 max-w-md items-center gap-2.5 rounded-xl bg-muted/50 px-3 sm:px-4 py-2 text-sm text-muted-foreground hover:bg-muted/80 transition-all duration-200 hover:shadow-sm min-w-0"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left text-xs truncate">Search...</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-md border border-border/60 bg-background/80 px-1.5 text-[10px] font-medium text-muted-foreground shrink-0">
                  ⌘K
                </kbd>
              </button>

              <div className="flex-1" />

              {/* Controls */}
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <div className="hidden sm:flex">
                  <CurrencyToggle />
                </div>
                <ThemeToggle />

                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 transition-all duration-200 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                </button>
              </div>

              {/* User */}
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 ml-1 border-l border-border/60 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {username?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold leading-tight">{username}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb — hidden on mobile for space */}
        <div className="hidden sm:block px-4 sm:px-6 lg:px-8 py-2.5 border-b border-border/30">
          <BreadcrumbNav />
        </div>

        {/* Content */}
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </main>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
