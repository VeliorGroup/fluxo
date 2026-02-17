-- ═══════════════════════════════════════════════════════════════
-- Fluxo — Supabase Schema
-- Run this in Database → SQL Editor on your Supabase project.
-- ═══════════════════════════════════════════════════════════════

-- ── Enum Types ─────────────────────────────────────────────────
CREATE TYPE company_type AS ENUM ('person_fizik', 'shpk');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE transaction_status AS ENUM ('paid', 'pending', 'forecasted');
CREATE TYPE transaction_category AS ENUM (
  'client_invoice', 'office_rent', 'utilities', 'software_subscriptions',
  'payroll', 'taxes', 'freelance_income', 'consulting',
  'equipment', 'marketing', 'miscellaneous'
);
CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE payment_status AS ENUM ('paid', 'pending');

-- ── Companies ──────────────────────────────────────────────────
CREATE TABLE public.companies (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  type        company_type NOT NULL DEFAULT 'person_fizik',
  currency    TEXT NOT NULL DEFAULT 'ALL',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Transactions ───────────────────────────────────────────────
CREATE TABLE public.transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id  UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  amount      NUMERIC(15, 2) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL DEFAULT '',
  category    transaction_category NOT NULL DEFAULT 'miscellaneous',
  type        transaction_type NOT NULL,
  status      transaction_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Recurring Rules ────────────────────────────────────────────
CREATE TABLE public.recurring_rules (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id        UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  description       TEXT NOT NULL,
  amount            NUMERIC(15, 2) NOT NULL,
  category          transaction_category NOT NULL DEFAULT 'miscellaneous',
  type              transaction_type NOT NULL,
  frequency         frequency_type NOT NULL DEFAULT 'monthly',
  start_date        DATE NOT NULL,
  end_date          DATE,
  next_due_date     DATE NOT NULL,
  auto_generate     BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Payroll Stubs ──────────────────────────────────────────────
CREATE TABLE public.payroll_stubs (
  id                         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id                 UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  employee_name              TEXT NOT NULL,
  employee_id                TEXT NOT NULL,
  pay_period_date            DATE NOT NULL,
  gross_salary               NUMERIC(15, 2) NOT NULL,
  net_salary                 NUMERIC(15, 2) NOT NULL,
  taxes_and_contributions    NUMERIC(15, 2) NOT NULL,
  salary_paid_status         payment_status DEFAULT 'pending',
  taxes_paid_status          payment_status DEFAULT 'pending',
  salary_due_date            DATE NOT NULL,
  taxes_due_date             DATE NOT NULL,
  created_at                 TIMESTAMPTZ DEFAULT now(),
  updated_at                 TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX idx_transactions_user      ON public.transactions (user_id);
CREATE INDEX idx_transactions_company   ON public.transactions (company_id);
CREATE INDEX idx_transactions_date      ON public.transactions (date);
CREATE INDEX idx_recurring_next_due     ON public.recurring_rules (next_due_date);
CREATE INDEX idx_payroll_period         ON public.payroll_stubs (pay_period_date);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_stubs    ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY "Users can view own companies"    ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own companies"  ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own companies"  ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own companies"  ON public.companies FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions"   ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions"  ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions"  ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions"  ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Recurring Rules
CREATE POLICY "Users can view own rules"    ON public.recurring_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rules"  ON public.recurring_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rules"  ON public.recurring_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rules"  ON public.recurring_rules FOR DELETE USING (auth.uid() = user_id);

-- Payroll Stubs
CREATE POLICY "Users can view own payroll"    ON public.payroll_stubs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payroll"  ON public.payroll_stubs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payroll"  ON public.payroll_stubs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payroll"  ON public.payroll_stubs FOR DELETE USING (auth.uid() = user_id);

-- ── Updated-at Trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_companies_updated_at       BEFORE UPDATE ON public.companies       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_transactions_updated_at    BEFORE UPDATE ON public.transactions    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_recurring_rules_updated_at BEFORE UPDATE ON public.recurring_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_payroll_stubs_updated_at   BEFORE UPDATE ON public.payroll_stubs   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
