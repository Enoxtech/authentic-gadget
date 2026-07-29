ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS hubtel_client_id text,
  ADD COLUMN IF NOT EXISTS hubtel_client_secret_enc text,
  ADD COLUMN IF NOT EXISTS hubtel_request_money_base_url text,
  ADD COLUMN IF NOT EXISTS hubtel_webhook_secret_enc text;
