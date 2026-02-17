// ── Bank of Albania EUR/ALL Exchange Rate ─────────────────────
// Scrapes the official rate from https://www.bankofalbania.org
// and caches it in-memory for 24 hours.

import { format, subDays } from "date-fns";

const FALLBACK_RATE = 96.4;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

let cachedRate: { value: number; change: number; fetchedAt: number } | null =
  null;

export type ExchangeRateData = {
  rate: number;
  change: number;
  source: "boa" | "fallback";
  fetchedAt: string;
};

export type ExchangeRateHistoryEntry = {
  date: string;
  rate: number;
  change: number;
};

export async function fetchExchangeRate(): Promise<ExchangeRateData> {
  // Return cache if fresh
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL_MS) {
    return {
      rate: cachedRate.value,
      change: cachedRate.change,
      source: "boa",
      fetchedAt: new Date(cachedRate.fetchedAt).toISOString(),
    };
  }

  try {
    const res = await fetch(
      "https://www.bankofalbania.org/Tregjet/Kursi_zyrtar_i_kembimit/",
      { next: { revalidate: 86400 } } // Next.js ISR: revalidate every 24h
    );
    const html = await res.text();

    // Find the EUR row in the exchange rate table:
    // <td nowrap="">Euro</td><td nowrap="">EUR</td><td align="right" nowrap="">96.40</td><td align="right" nowrap="">-0.03</td>
    const eurRowRegex =
      /<td[^>]*>\s*Euro\s*<\/td>\s*<td[^>]*>\s*EUR\s*<\/td>\s*<td[^>]*>\s*([\d.]+)\s*<\/td>\s*<td[^>]*>\s*([+-]?[\d.]+)\s*<\/td>/i;
    const match = html.match(eurRowRegex);

    if (match) {
      const rate = parseFloat(match[1]);
      const change = parseFloat(match[2]);
      cachedRate = { value: rate, change, fetchedAt: Date.now() };
      return {
        rate,
        change,
        source: "boa",
        fetchedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error("[exchange-rate] Failed to fetch BoA rate:", err);
  }

  // Fallback
  return {
    rate: FALLBACK_RATE,
    change: 0,
    source: "fallback",
    fetchedAt: new Date().toISOString(),
  };
}

// ── Historical Exchange Rates (simulated 30-day log) ──────────
// In production, these would be stored in a DB each day.
// For now we generate realistic daily rates around the current live rate.
export function getExchangeRateHistory(): ExchangeRateHistoryEntry[] {
  const today = new Date();
  const baseRate = cachedRate?.value ?? FALLBACK_RATE;
  const history: ExchangeRateHistoryEntry[] = [];

  // Seed-based deterministic random for consistent SSR
  const seed = (d: number) => {
    const x = Math.sin(d * 9301 + 49297) * 49999;
    return x - Math.floor(x);
  };

  let prevRate = baseRate;
  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    // Skip weekends (BoA doesn't publish on Sat/Sun)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    let rate: number;
    if (i === 0) {
      rate = baseRate; // today = live rate
    } else {
      // Small daily fluctuation ±0.15
      const delta = (seed(i) - 0.5) * 0.3;
      rate = Math.round((baseRate + delta * (i / 10)) * 100) / 100;
    }
    const change = Math.round((rate - prevRate) * 100) / 100;
    history.push({
      date: format(date, "yyyy-MM-dd"),
      rate,
      change,
    });
    prevRate = rate;
  }

  return history;
}

