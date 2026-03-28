# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run dev` — Start Next.js dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (Next.js core web vitals + TypeScript)

## Tech Stack

- **Next.js 16** (App Router, "use client" for interactive pages)
- **React 19**, **TypeScript 5**
- **Supabase** — Auth + database (all queries filter by `user_id` for multi-tenant isolation)
- **Tailwind CSS 4** with oklch color variables, dark/light mode
- **shadcn/ui** (new-york style, zinc base, lucide icons) — components in `src/components/ui/`
- **React Hook Form + Zod 4** for form validation
- **TanStack React Table** for data tables
- **Recharts** for charts
- **sonner** for toast notifications
- **next-themes** for theme switching

## Architecture

**Path alias:** `@/*` → `./src/*`

### Module-based layout

Each business domain (Finance, Organization, CRM, etc.) owns a route group and a parallel component directory:

```
src/app/finance/         ←→  src/components/finance/
src/app/organization/    ←→  src/components/organization/
```

Pages are client components that fetch data via custom hooks from `src/lib/supabase-data.ts`.

### Key files

- `src/lib/supabase.ts` — Supabase client singleton
- `src/lib/supabase-data.ts` — All data hooks (`useCompanies`, `usePeople`, `useTransactions`, etc.) with CRUD operations, local state, and manual refresh
- `src/lib/types.ts` — Shared TypeScript types
- `src/lib/exchange-rate.ts` — Bank of Albania rate scraping with 24h ISR cache, fallback rate 96.4
- `src/components/auth-provider.tsx` — Supabase auth context, email-based login (`username@fluxo.app`)
- `src/components/currency-provider.tsx` — EUR/ALL conversion context
- `src/components/layout/app-shell.tsx` — Main shell with sidebar, auth gating
- `src/components/layout/sidebar.tsx` — Navigation, module-aware route highlighting

### Provider hierarchy (root layout)

ThemeProvider → AuthProvider → CurrencyProvider → TooltipProvider

### Data patterns

- Supabase queries use relational selects (e.g., `select("*, companies(name)")`)
- All data is user-scoped via `.eq("user_id", user.id)`
- Custom hooks manage loading states, error handling, and toast feedback
- No external REST API layer — direct Supabase client calls

### UI patterns

- Modal dialogs (shadcn Dialog) for add/edit operations
- Tables via TanStack React Table with column definitions
- Forms use React Hook Form + Zod schemas
- Responsive sidebar with mobile toggle

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
