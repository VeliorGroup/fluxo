import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/components/auth-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppShell } from "@/components/layout/app-shell";
import { fetchExchangeRate } from "@/lib/exchange-rate";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fluxo",
  description:
    "Manage cash flow, accounts, and runway for Person Fizik and Sh.p.k entities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const exchangeRate = await fetchExchangeRate();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${jakarta.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <CurrencyProvider exchangeRate={exchangeRate.rate}>
                <TooltipProvider>
                  <ErrorBoundary>
                    <AppShell exchangeRate={exchangeRate}>
                      {children}
                    </AppShell>
                  </ErrorBoundary>
                  <Toaster richColors closeButton />
                </TooltipProvider>
              </CurrencyProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
