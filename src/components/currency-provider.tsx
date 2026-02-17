"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Currency } from "@/lib/dummy-data";

type DisplayCurrency = Currency; // "EUR" | "ALL"

type CurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  /** Convert an amount from its original currency to the display currency */
  convert: (amount: number, fromCurrency: Currency) => number;
  /** Format a converted amount with symbol */
  formatDisplay: (amount: number, fromCurrency: Currency) => string;
  exchangeRate: number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

const symbols: Record<Currency, string> = { EUR: "€", ALL: "L" };

export function CurrencyProvider({
  children,
  exchangeRate,
}: {
  children: ReactNode;
  exchangeRate: number;
}) {
  const [displayCurrency, setDisplayCurrency] =
    useState<DisplayCurrency>("EUR");

  const convert = useCallback(
    (amount: number, fromCurrency: Currency): number => {
      if (fromCurrency === displayCurrency) return amount;
      // EUR → ALL: multiply by rate
      if (fromCurrency === "EUR" && displayCurrency === "ALL")
        return amount * exchangeRate;
      // ALL → EUR: divide by rate
      return amount / exchangeRate;
    },
    [displayCurrency, exchangeRate]
  );

  const formatDisplay = useCallback(
    (amount: number, fromCurrency: Currency): string => {
      const converted = convert(amount, fromCurrency);
      const sym = symbols[displayCurrency];
      const decimals = displayCurrency === "EUR" ? 2 : 0;
      return `${sym}${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(converted)}`;
    },
    [convert, displayCurrency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        displayCurrency,
        setDisplayCurrency,
        convert,
        formatDisplay,
        exchangeRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
