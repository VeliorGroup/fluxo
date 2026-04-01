-- Add recurrence, source_type, and currency columns to transactions
-- These support tracking recurring vs one-time costs and personal vs business expenses

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS recurrence text DEFAULT 'one_time' CHECK (recurrence IN ('one_time', 'monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'business' CHECK (source_type IN ('business', 'personal')),
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR' CHECK (currency IN ('EUR', 'ALL'));

-- Backfill existing rows
UPDATE transactions SET recurrence = 'one_time' WHERE recurrence IS NULL;
UPDATE transactions SET source_type = 'business' WHERE source_type IS NULL;
UPDATE transactions SET currency = 'EUR' WHERE currency IS NULL;
