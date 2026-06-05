-- Security hardening and customer feature tables for Authentic Gadget.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'subscribed',
  subscribed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL DEFAULT 'General support',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_read" ON public.categories;
DROP POLICY IF EXISTS "products_read" ON public.products;
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "products_delete" ON public.products;
DROP POLICY IF EXISTS "customers_read" ON public.customers;
DROP POLICY IF EXISTS "customers_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_update" ON public.customers;
DROP POLICY IF EXISTS "orders_read" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_read" ON public.order_items;
DROP POLICY IF EXISTS "reviews_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete" ON public.reviews;
DROP POLICY IF EXISTS "wishlists_read" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_insert" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_delete" ON public.wishlists;

CREATE POLICY "categories_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "products_read" ON public.products FOR SELECT USING (is_active = true);

CREATE POLICY "customers_read" ON public.customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "orders_read" ON public.orders FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "order_items_read" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders own_orders
      WHERE own_orders.id = order_items.order_id
        AND own_orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "reviews_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "wishlists_read" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlists_insert" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlists_delete" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at DESC);
