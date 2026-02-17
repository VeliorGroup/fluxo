import type { Metadata } from "next";
import { Nova_Square } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import { fetchExchangeRate } from "@/lib/exchange-rate";

const novaSquare = Nova_Square({
  variable: "--font-nova-square",
  subsets: ["latin"],
  weight: "400",
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
      <body className={`${novaSquare.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CurrencyProvider exchangeRate={exchangeRate.rate}>
              <TooltipProvider>
                <AppShell exchangeRate={exchangeRate}>
                  {children}
                </AppShell>
              </TooltipProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
