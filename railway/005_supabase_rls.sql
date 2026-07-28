ALTER TABLE IF EXISTS auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS auth_rate_limits ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlists ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_public_read ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY categories_public_read ON categories
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS products_public_read_active ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "products_read" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY products_public_read_active ON products
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS banners_public_read_enabled ON banners;
DROP POLICY IF EXISTS "banners_read" ON banners;
CREATE POLICY banners_public_read_enabled ON banners
  FOR SELECT
  USING (enabled = true);

DROP POLICY IF EXISTS reviews_public_read ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "reviews_read" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY reviews_public_read ON reviews
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS delivery_areas_public_read_enabled ON delivery_areas;
CREATE POLICY delivery_areas_public_read_enabled ON delivery_areas
  FOR SELECT
  USING (enabled = true);

DROP POLICY IF EXISTS "customers_read" ON customers;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "orders_read" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "order_items_read" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "wishlists_read" ON wishlists;
DROP POLICY IF EXISTS "wishlists_insert" ON wishlists;
DROP POLICY IF EXISTS "wishlists_delete" ON wishlists;

DO $$
BEGIN
  IF to_regclass('public.wishlist') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist';
  END IF;
END $$;
