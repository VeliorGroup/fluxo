-- ═══════════════════════════════════════════════════════════════
-- Fluxo: New Modules Schema
-- CRM, Leads, Opportunities, Projects, Events, Documents,
-- Activities, User Settings
-- ═══════════════════════════════════════════════════════════════

-- ── CRM Accounts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('client', 'prospect', 'partner', 'vendor')),
  industry text,
  website text,
  email text,
  phone text,
  address text,
  notes text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);

-- ── Contacts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  crm_account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  role text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(crm_account_id);

-- ── Leads ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  source text CHECK (source IN ('google_maps', 'campaign', 'referral', 'website', 'cold_outreach', 'event', 'other')),
  status text CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')) DEFAULT 'new',
  notes text,
  assigned_to uuid REFERENCES people(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(user_id, status);

-- ── Opportunities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  crm_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  stage text CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')) DEFAULT 'prospecting',
  amount numeric,
  currency text CHECK (currency IN ('EUR', 'ALL')) DEFAULT 'EUR',
  probability integer CHECK (probability BETWEEN 0 AND 100),
  expected_close_date date,
  notes text,
  assigned_to uuid REFERENCES people(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_user ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(user_id, stage);

-- ── Projects ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  status text CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'planning',
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  start_date date,
  end_date date,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  budget numeric,
  currency text CHECK (currency IN ('EUR', 'ALL')) DEFAULT 'EUR',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- ── Project Tasks ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('todo', 'in_progress', 'review', 'done')) DEFAULT 'todo',
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to uuid REFERENCES people(id) ON DELETE SET NULL,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_user ON project_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);

-- ── Events ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('trade_show', 'fair', 'conference', 'networking', 'workshop', 'other')),
  location text,
  start_date date,
  end_date date,
  budget numeric,
  currency text CHECK (currency IN ('EUR', 'ALL')) DEFAULT 'EUR',
  status text CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
  notes text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);

-- ── Documents ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('invoice', 'contract', 'proposal', 'report', 'template', 'other')),
  file_url text,
  file_size integer,
  mime_type text,
  related_entity_type text,
  related_entity_id uuid,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);

-- ── Activities / Communications ───────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text CHECK (type IN ('note', 'email', 'call', 'meeting', 'task_completed', 'status_change')),
  subject text,
  body text,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(related_entity_type, related_entity_id);

-- ── User Settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  default_currency text CHECK (default_currency IN ('EUR', 'ALL')) DEFAULT 'EUR',
  default_company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  sidebar_collapsed boolean DEFAULT false,
  theme text CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
  locale text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security (all tables scoped to user_id)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Generic RLS policy: users can only access their own rows
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'accounts', 'contacts', 'leads', 'opportunities',
      'projects', 'project_tasks', 'events', 'documents',
      'activities', 'user_settings'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      'policy_' || tbl || '_user',
      tbl
    );
  END LOOP;
END
$$;
