ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS bank_transfer_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_branch text,
  ADD COLUMN IF NOT EXISTS bank_transfer_note text;
