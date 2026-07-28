CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY DEFAULT 'default',

  store_name text NOT NULL DEFAULT 'Authentic Gadget',
  tagline text NOT NULL DEFAULT 'Premium gadgets at unbeatable prices',
  store_email text NOT NULL DEFAULT 'authenticgadgets@gmail.com',
  store_address text NOT NULL DEFAULT 'Accra, Ghana',

  business_hours_weekdays text NOT NULL DEFAULT '9:00 AM - 7:00 PM',
  business_hours_saturday text NOT NULL DEFAULT '10:00 AM - 6:00 PM',
  business_hours_sunday text NOT NULL DEFAULT 'Closed',

  vat_percent numeric(5,2) NOT NULL DEFAULT 0,

  whatsapp_phone_number_id text,
  whatsapp_access_token_enc text,
  whatsapp_business_account_id text,
  whatsapp_order_template_name text DEFAULT 'order_update',
  whatsapp_template_language text DEFAULT 'en_US',

  paystack_public_key text,
  paystack_secret_key_enc text,
  flutterwave_public_key text,
  flutterwave_secret_key_enc text,

  gmail_user text,
  gmail_app_password_enc text,
  admin_email text,
  resend_api_key_enc text,
  resend_from_email text,

  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax numeric(10,2) NOT NULL DEFAULT 0;
