-- Rename the existing financial accounts table to financial_accounts
-- Run this BEFORE 001_new_modules.sql

ALTER TABLE IF EXISTS accounts RENAME TO financial_accounts;
ALTER INDEX IF EXISTS idx_accounts_user RENAME TO idx_financial_accounts_user;
