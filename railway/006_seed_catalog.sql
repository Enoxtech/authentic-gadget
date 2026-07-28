INSERT INTO categories (name, slug, icon, description) VALUES
  ('Smartphones', 'smartphones', 'Phone', 'Latest smartphones from Apple, Samsung, Google'),
  ('Laptops', 'laptops', 'Laptop', 'MacBooks, ultrabooks, and productivity laptops'),
  ('Audio', 'audio', 'Audio', 'Headphones, earbuds, and speakers'),
  ('Wearables', 'wearables', 'Watch', 'Smartwatches and fitness trackers'),
  ('Gaming', 'gaming', 'Game', 'Consoles, handhelds, and accessories'),
  ('Accessories', 'accessories', 'Cable', 'Cables, chargers, cases, and more'),
  ('Tablets', 'tablets', 'Tablet', 'iPads and Android tablets')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'iPhone 15 Pro Max 256GB Natural Titanium', 'iphone-15-pro-max', 'Apple', 'Smartphones',
  (SELECT id FROM categories WHERE slug = 'smartphones'),
  12499, 13999,
  'A17 Pro performance, premium titanium design, and a powerful camera system.',
  ARRAY['A17 Pro chip', '48MP main camera', '6.7 inch Super Retina XDR display', 'Titanium design', 'USB-C'],
  ARRAY['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', 'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800'],
  8, 4.9, 128, 'Best Seller'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'Samsung Galaxy S24 Ultra 256GB Titanium Black', 'samsung-galaxy-s24-ultra', 'Samsung', 'Smartphones',
  (SELECT id FROM categories WHERE slug = 'smartphones'),
  10999, 11999,
  'A flagship Galaxy phone with AI features, S Pen, and a 200MP camera.',
  ARRAY['Snapdragon 8 Gen 3', '200MP camera', '6.8 inch AMOLED display', 'S Pen included', '5000mAh battery'],
  ARRAY['https://images.unsplash.com/photo-1614707268917-71c4c5c6bbb6?w=800', 'https://images.unsplash.com/photo-1605236453806-6f1e0a0f03ac?w=800'],
  12, 4.8, 96, 'New'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'MacBook Air M3 13 inch 256GB Space Grey', 'macbook-air-m3', 'Apple', 'Laptops',
  (SELECT id FROM categories WHERE slug = 'laptops'),
  8999, 9999,
  'A thin, silent laptop powered by Apple M3 with all-day battery life.',
  ARRAY['Apple M3 chip', '13.6 inch Liquid Retina display', 'Up to 18 hours battery', 'Fanless design', 'MagSafe charging'],
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800'],
  6, 4.9, 64, NULL
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'Sony WH-1000XM5 Wireless Headphones', 'sony-wh-1000xm5', 'Sony', 'Audio',
  (SELECT id FROM categories WHERE slug = 'audio'),
  2499, 2999,
  'Premium wireless headphones with excellent noise cancellation and long battery life.',
  ARRAY['Active noise cancellation', '30-hour battery life', 'Hi-Res audio', 'Multipoint connection', 'Comfort fit'],
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
  20, 4.7, 215, '-17%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'iPad Pro 12.9 inch M2 256GB Space Grey', 'ipad-pro-12-9', 'Apple', 'Tablets',
  (SELECT id FROM categories WHERE slug = 'tablets'),
  7499, 8499,
  'A large-screen iPad for creativity, work, and entertainment.',
  ARRAY['Apple M2 chip', '12.9 inch Liquid Retina XDR display', 'Face ID', 'USB-C', 'Apple Pencil support'],
  ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
  9, 4.8, 89, NULL
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'Apple Watch Ultra 2 49mm Titanium', 'apple-watch-ultra-2', 'Apple', 'Wearables',
  (SELECT id FROM categories WHERE slug = 'wearables'),
  4499, 4999,
  'A rugged Apple Watch with precision GPS and long battery life.',
  ARRAY['49mm titanium case', 'Precision GPS', 'Action button', 'Water resistant', 'Long battery life'],
  ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800'],
  5, 4.9, 156, '-10%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'Samsung Galaxy Buds2 Pro', 'samsung-galaxy-buds2-pro', 'Samsung', 'Audio',
  (SELECT id FROM categories WHERE slug = 'audio'),
  999, 1299,
  'Compact wireless earbuds with active noise cancellation and rich sound.',
  ARRAY['Active noise cancellation', '360 audio', 'Water resistant', 'Wireless charging case', 'Comfort fit'],
  ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
  18, 4.6, 78, '-23%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'Dell XPS 15 OLED', 'dell-xps-15', 'Dell', 'Laptops',
  (SELECT id FROM categories WHERE slug = 'laptops'),
  11499, 12999,
  'A premium Windows laptop with OLED display and strong creative performance.',
  ARRAY['Intel Core i7', 'OLED touch display', '16GB RAM', '512GB SSD', 'RTX graphics'],
  ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
  4, 4.7, 53, '-12%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'PlayStation 5 Disc Edition', 'playstation-5', 'Sony', 'Gaming',
  (SELECT id FROM categories WHERE slug = 'gaming'),
  4999, NULL,
  'Next-generation console gaming with fast loading, 4K support, and DualSense controls.',
  ARRAY['4K gaming', 'Ultra-fast SSD', 'DualSense controller', 'Ray tracing support', 'PS4 compatibility'],
  ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800', 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800'],
  4, 4.9, 312, 'New'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'AirPods Max Space Grey', 'airpods-max', 'Apple', 'Audio',
  (SELECT id FROM categories WHERE slug = 'audio'),
  3499, 3999,
  'Over-ear Apple headphones with high-fidelity audio and active noise cancellation.',
  ARRAY['Active noise cancellation', 'Spatial audio', '20-hour battery life', 'Digital Crown controls', 'Premium fit'],
  ARRAY['https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=800', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'],
  11, 4.8, 189, '-13%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'Google Pixel 8 Pro 256GB Obsidian', 'google-pixel-8-pro', 'Google', 'Smartphones',
  (SELECT id FROM categories WHERE slug = 'smartphones'),
  7999, 8999,
  'A Google flagship phone with Tensor AI features and a versatile camera system.',
  ARRAY['Google Tensor chip', '50MP main camera', '120Hz OLED display', 'AI photo tools', 'Long software support'],
  ARRAY['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'],
  7, 4.8, 67, '-11%'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, brand, category, category_id, price, compare_at_price,
  description, features, images, stock, rating, reviews_count, badge
)
SELECT 'Nintendo Switch OLED Model', 'nintendo-switch-oled', 'Nintendo', 'Gaming',
  (SELECT id FROM categories WHERE slug = 'gaming'),
  2499, 2799,
  'A portable Nintendo console with a vivid OLED screen and improved stand.',
  ARRAY['7 inch OLED display', '64GB storage', 'Enhanced audio', 'Wide adjustable stand', 'TV and handheld modes'],
  ARRAY['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'],
  15, 4.8, 241, NULL
ON CONFLICT (slug) DO NOTHING;
