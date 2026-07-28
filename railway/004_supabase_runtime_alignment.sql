CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE IF EXISTS categories
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS compare_at_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS features text[],
  ADD COLUMN IF NOT EXISTS images text[],
  ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating numeric(2,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'review_count'
  ) THEN
    UPDATE products
    SET reviews_count = review_count
    WHERE reviews_count = 0
      AND review_count IS NOT NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY,
  full_name text,
  email text UNIQUE,
  phone text,
  address text,
  city text,
  region text,
  created_at timestamptz DEFAULT now()
);

DO $$
DECLARE
  customer_constraint record;
BEGIN
  FOR customer_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'customers'::regclass
      AND contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE customers DROP CONSTRAINT IF EXISTS %I', customer_constraint.conname);
  END LOOP;
END $$;

DO $$
DECLARE
  order_constraint record;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'id'
      AND data_type <> 'text'
  ) THEN
    FOR order_constraint IN
      SELECT conname, conrelid::regclass AS table_name
      FROM pg_constraint
      WHERE contype = 'f'
        AND (
          confrelid = 'orders'::regclass
          OR (
            conrelid = 'order_items'::regclass
            AND pg_get_constraintdef(oid) ILIKE '%FOREIGN KEY (order_id)%'
          )
        )
    LOOP
      EXECUTE format(
        'ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I',
        order_constraint.table_name,
        order_constraint.conname
      );
    END LOOP;

    ALTER TABLE orders ALTER COLUMN id TYPE text USING id::text;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'order_items'
        AND column_name = 'order_id'
    ) THEN
      ALTER TABLE order_items ALTER COLUMN order_id TYPE text USING order_id::text;
    END IF;
  END IF;
END $$;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS customer_id uuid,
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_region text,
  ADD COLUMN IF NOT EXISTS order_note text,
  ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS order_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'user_id'
  ) THEN
    UPDATE orders SET customer_id = user_id WHERE customer_id IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'delivery_name'
  ) THEN
    UPDATE orders SET customer_name = delivery_name WHERE customer_name IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'delivery_phone'
  ) THEN
    UPDATE orders SET customer_phone = delivery_phone WHERE customer_phone IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'delivery_address'
  ) THEN
    UPDATE orders SET shipping_address = delivery_address WHERE shipping_address IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'delivery_city'
  ) THEN
    UPDATE orders SET shipping_city = delivery_city WHERE shipping_city IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'delivery_region'
  ) THEN
    UPDATE orders SET shipping_region = delivery_region WHERE shipping_region IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'delivery_note'
  ) THEN
    UPDATE orders SET order_note = delivery_note WHERE order_note IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'status'
  ) THEN
    UPDATE orders SET order_status = status WHERE order_status IS NULL OR order_status = 'pending';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'paystack_reference'
  ) THEN
    UPDATE orders SET payment_reference = paystack_reference WHERE payment_reference IS NULL;
  END IF;
END $$;

ALTER TABLE IF EXISTS order_items
  ADD COLUMN IF NOT EXISTS product_slug text,
  ADD COLUMN IF NOT EXISTS product_image text,
  ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'order_items'::regclass
      AND conname = 'order_items_order_id_fkey'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT order_items_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      NOT VALID;
  END IF;
END $$;

ALTER TABLE IF EXISTS reviews
  ADD COLUMN IF NOT EXISTS customer_id uuid,
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'reviews'
      AND column_name = 'user_id'
  ) THEN
    UPDATE reviews SET customer_id = user_id WHERE customer_id IS NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

DO $$
DECLARE
  wishlist_constraint record;
BEGIN
  FOR wishlist_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'wishlists'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) ILIKE '%auth.users%'
  LOOP
    EXECUTE format('ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS %I', wishlist_constraint.conname);
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.wishlist') IS NOT NULL THEN
    INSERT INTO wishlists (id, user_id, product_id, created_at)
    SELECT id, user_id, product_id, created_at
    FROM wishlist
    ON CONFLICT (user_id, product_id) DO NOTHING;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
