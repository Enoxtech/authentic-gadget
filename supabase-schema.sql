-- ============================================================
-- AUTHENTIC GADGET — Complete Database Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  category text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(10,2),
  description text,
  features text[],
  images text[],
  stock integer DEFAULT 0,
  rating numeric(2,1) DEFAULT 0,
  reviews_count integer DEFAULT 0,
  badge text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  region text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address text,
  shipping_city text,
  shipping_region text,
  order_note text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cod',
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'pending',
  payment_reference text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text,
  product_image text,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- WISHLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'subscribed',
  subscribed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- SUPPORT MESSAGES
-- ============================================================
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

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
INSERT INTO public.categories (name, slug, icon, description) VALUES
  ('Smartphones', 'smartphones', '📱', 'Latest smartphones from Apple, Samsung, Google'),
  ('Laptops', 'laptops', '💻', 'MacBooks, ultrabooks, and productivity laptops'),
  ('Audio', 'audio', '🎧', 'Headphones, earbuds, and speakers'),
  ('Wearables', 'wearables', '⌚', 'Smartwatches and fitness trackers'),
  ('Gaming', 'gaming', '🎮', 'Consoles, handhelds, and accessories'),
  ('Accessories', 'accessories', '🔌', 'Cables, chargers, cases, and more'),
  ('Tablets', 'tablets', '📲', 'iPads and Android tablets')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED PRODUCTS
-- ============================================================

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'iPhone 15 Pro Max 256GB Natural Titanium', 'iphone-15-pro-max', 'Apple', 'Smartphones',
  (SELECT id FROM public.categories WHERE slug='smartphones'),
  12499, 13999,
  E'The most powerful iPhone ever. A17 Pro chip with 6-core GPU, 48MP camera system, and aerospace-grade titanium design.',
  ARRAY[E'A17 Pro chip with 6-core GPU', E'48MP Main + 12MP Ultra Wide + 12MP Telephoto', E'6.7" Super Retina XDR display with ProMotion 120Hz', E'Titanium design with textured matte glass back', E'Action button + USB 3 (up to 10Gbps)', E'5x optical zoom'],
  ARRAY[E'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', E'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800', E'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800'],
  8, 4.9, 128, 'Best Seller'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'Samsung Galaxy S24 Ultra 256GB Titanium Black', 'samsung-galaxy-s24-ultra', 'Samsung', 'Smartphones',
  (SELECT id FROM public.categories WHERE slug='smartphones'),
  10999, 11999,
  E'The ultimate Galaxy experience. Snapdragon 8 Gen 3, 200MP camera with AI features, and S Pen included in the box.',
  ARRAY[E'Snapdragon 8 Gen 3 processor', E'200MP main + 12MP ultrawide + 50MP telephoto', E'6.8" Dynamic AMOLED 2X display, 120Hz', E'5000mAh battery with 45W fast charging', E'S Pen included', E'Galaxy AI features pre-loaded'],
  ARRAY[E'https://images.unsplash.com/photo-1614707268917-71c4c5c6bbb6?w=800', E'https://images.unsplash.com/photo-1605236453806-6f1e0a0f03ac?w=800'],
  12, 4.8, 96, 'New'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'MacBook Air M3 13" 256GB Space Grey', 'macbook-air-m3', 'Apple', 'Laptops',
  (SELECT id FROM public.categories WHERE slug='laptops'),
  8999, 9999,
  E'Supercharged by the M3 chip. Fanless design with all-day battery life and stunning Liquid Retina display.',
  ARRAY[E'Apple M3 chip (8-core CPU, 10-core GPU)', E'13.6" Liquid Retina display with True Tone', E'Up to 18 hours battery life', E'Fanless silent design', E'MagSafe 3 charging + two Thunderbolt ports', E'1080p FaceTime HD camera'],
  ARRAY[E'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', E'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', E'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
  6, 4.9, 64, NULL
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'Sony WH-1000XM5 Wireless Headphones', 'sony-wh-1000xm5', 'Sony', 'Audio',
  (SELECT id FROM public.categories WHERE slug='audio'),
  2499, 2999,
  E'Industry-leading noise cancellation with 8 microphones. Hi-Res Audio, LDAC, and up to 30-hour battery.',
  ARRAY[E'8 microphones for industry-leading noise cancellation', E'30-hour battery life with ANC on', E'Hi-Res Audio + LDAC support', E'Multipoint connection (2 devices at once)', E'Speak-to-chat auto pauses music', E'Foldable with carrying case'],
  ARRAY[E'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', E'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
  20, 4.7, 215, '-17%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'iPad Pro 12.9" M2 256GB Space Grey', 'ipad-pro-12-9', 'Apple', 'Tablets',
  (SELECT id FROM public.categories WHERE slug='tablets'),
  7499, 8499,
  E'The ultimate iPad experience. M2 chip with 10-core GPU, Liquid Retina XDR display with ProMotion 120Hz.',
  ARRAY[E'Apple M2 chip (8-core CPU, 10-core GPU)', E'12.9" Liquid Retina XDR with ProMotion 120Hz', E'Face ID + 12MP cameras', E'Thunderbolt / USB 4 port', E'Apple Pencil 2 support', E'Up to 10 hours battery'],
  ARRAY[E'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
  9, 4.8, 89, NULL
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'Apple Watch Ultra 2 49mm Titanium', 'apple-watch-ultra-2', 'Apple', 'Wearables',
  (SELECT id FROM public.categories WHERE slug='wearables'),
  4499, 4999,
  E'The most rugged and capable Apple Watch. Titanium case, precision GPS, and up to 36-hour battery life.',
  ARRAY[E'49mm titanium case (aerospace grade)', E'Precision dual-frequency GPS', E'36-hour battery (up to 72h in low power mode)', E'S9 SiP chip with Double Tap', E'Water resistant 100m + dive certified', E'Action button configurable'],
  ARRAY[E'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800'],
  5, 4.9, 156, '-10%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'Samsung Galaxy Buds2 Pro', 'samsung-galaxy-buds2-pro', 'Samsung', 'Audio',
  (SELECT id FROM public.categories WHERE slug='audio'),
  999, 1299,
  E'Studio-quality sound with Active Noise Cancellation. 360 Audio, IPX7 water resistance, and wireless charging case.',
  ARRAY[E'24-bit Hi-Fi sound (Samsung Seamless Codec)', E'Active Noise Cancellation (3 mic AI)', E'360 Audio with head tracking', E'IPX7 water resistant', E'5 hours earbuds + 18 hours case', E'Wireless charging case'],
  ARRAY[E'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
  18, 4.6, 78, '-23%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'Dell XPS 15 OLED', 'dell-xps-15', 'Dell', 'Laptops',
  (SELECT id FROM public.categories WHERE slug='laptops'),
  11499, 12999,
  E'Intel Core i7-13700H, 16GB RAM, 512GB SSD, and stunning 3.5K OLED touch display with NVIDIA RTX 4050.',
  ARRAY[E'Intel Core i7-13700H (14-core)', E'16GB LPDDR5 RAM, 512GB NVMe SSD', E'15.6" 3.5K OLED touch display, 400 nits', E'NVIDIA GeForce RTX 4050', E'Thunderbolt 4 + SD card slot', E'Fingerprint reader + Windows Hello'],
  ARRAY[E'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
  4, 4.7, 53, '-12%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'PlayStation 5 Disc Edition', 'playstation-5', 'Sony', 'Gaming',
  (SELECT id FROM public.categories WHERE slug='gaming'),
  4999, NULL,
  E'Next-gen gaming with 4K TV gaming, haptic feedback DualSense controller, and the largest PS5 game library.',
  ARRAY[E'AMD Ryzen Zen 2 + RDNA 2 GPU', E'4K gaming at up to 120fps', E'Ray tracing support', E'825GB SSD for ultra fast load times', E'DualSense controller with haptic feedback', E'Backwards compatible with PS4 games'],
  ARRAY[E'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800', E'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800', E'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'],
  4, 4.9, 312, 'New'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'AirPods Max Space Grey', 'airpods-max', 'Apple', 'Audio',
  (SELECT id FROM public.categories WHERE slug='audio'),
  3499, 3999,
  E'High-fidelity audio with Active Noise Cancellation, Transparency mode, and Computational audio with 9 microphones.',
  ARRAY[E'Custom 40mm Apple driver for rich bass', E'Active Noise Cancellation + Transparency mode', E'Computational audio with 9 microphones', E'20-hour battery life', E'Digital Crown for volume and controls', E'Spatial audio with dynamic head tracking'],
  ARRAY[E'https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=800', E'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'],
  11, 4.8, 189, '-13%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'Google Pixel 8 Pro 256GB Obsidian', 'google-pixel-8-pro', 'Google', 'Smartphones',
  (SELECT id FROM public.categories WHERE slug='smartphones'),
  7999, 8999,
  E'Powered by Google Tensor G3. 50MP camera with Night Sight, 7 years of OS and security updates included.',
  ARRAY[E'Google Tensor G3 chip', E'50MP main + 48MP ultrawide + 48MP telephoto', E'6.7" LTPO OLED 120Hz display', E'Magic Eraser + Best Take AI features', E'7 years of OS and security updates', E'24-hour battery with 30W fast charging'],
  ARRAY[E'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'],
  7, 4.8, 67, '-11%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, brand, category, category_id, price, compare_at_price, description, features, images, stock, rating, reviews_count, badge)
SELECT 'Nintendo Switch OLED Model', 'nintendo-switch-oled', 'Nintendo', 'Gaming',
  (SELECT id FROM public.categories WHERE slug='gaming'),
  2499, 2799,
  E'Vivid 7-inch OLED screen, enhanced audio, and a wide adjustable stand for tabletop gaming anywhere.',
  ARRAY[E'7" vibrant OLED display', E'Wide adjustable stand for tabletop mode', E'64GB internal storage', E'Enhanced audio with OLED screen', E'Wired LAN port in dock', E'Compatible with all Nintendo Switch games'],
  ARRAY[E'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'],
  15, 4.8, 241, NULL
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

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

-- Categories: public read
CREATE POLICY "categories_read" ON public.categories FOR SELECT USING (true);

-- Products: public read only. Admin writes go through server API routes using the service role.
CREATE POLICY "products_read" ON public.products FOR SELECT USING (is_active = true);

-- Customers: users own their profile
CREATE POLICY "customers_read" ON public.customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE USING (auth.uid() = id);

-- Orders: users can read their own registered orders. Guest tracking and admin updates use server API routes.
CREATE POLICY "orders_read" ON public.orders FOR SELECT USING (auth.uid() = customer_id);

-- Order items: users can read items for their own registered orders.
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

-- Reviews: public read, authenticated insert
CREATE POLICY "reviews_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Wishlists: account-scoped persistence
CREATE POLICY "wishlists_read" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlists_insert" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlists_delete" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at DESC);
