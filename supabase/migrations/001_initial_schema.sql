-- ============================================================
-- Authentic Gadget — Initial Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Anyone can view categories"
  on public.categories for select using (true);

create policy "Admins can manage categories"
  on public.categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed categories
insert into public.categories (name, slug, description) values
  ('Smartphones', 'smartphones', 'Latest smartphones from top brands'),
  ('Laptops', 'laptops', 'Business and personal laptops'),
  ('Audio', 'audio', 'Headphones, earbuds, and speakers'),
  ('Wearables', 'wearables', 'Smartwatches and fitness trackers'),
  ('Gaming', 'gaming', 'Consoles, games, and accessories'),
  ('Tablets', 'tablets', 'iPads and Android tablets')
on conflict do nothing;

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  images text[] not null default '{}',
  category_id uuid references public.categories(id),
  brand text,
  sku text,
  stock integer not null default 0,
  rating numeric(2,1) default 0,
  review_count integer default 0,
  tags text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select using (is_active = true);

create policy "Admins can manage products"
  on public.products for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  status text not null default 'pending',
  payment_status text not null default 'pending',
  payment_method text,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  delivery_name text,
  delivery_phone text,
  delivery_address text,
  delivery_city text,
  delivery_region text,
  delivery_note text,
  paystack_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Anyone can create orders"
  on public.orders for insert with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  product_image text,
  price numeric(10,2) not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "Users can view own order items"
  on public.order_items for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );

create policy "Admins can manage order items"
  on public.order_items for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- CUSTOMER ADDRESSES
-- ============================================================
create table if not exists public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  address text not null,
  city text not null,
  region text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "Users can manage own addresses"
  on public.addresses for all using (auth.uid() = user_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews"
  on public.reviews for select using (true);

create policy "Users can create reviews"
  on public.reviews for insert with check (auth.uid() = user_id);

-- Trigger to update product rating
create or replace function update_product_rating()
returns trigger as $$
begin
  update public.products
  set
    rating = (select avg(rating) from public.reviews where product_id = new.product_id),
    review_count = (select count(*) from public.reviews where product_id = new.product_id)
  where id = new.product_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure update_product_rating();

-- ============================================================
-- WISHLIST
-- ============================================================
create table if not exists public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table public.wishlist enable row level security;

create policy "Users can manage own wishlist"
  on public.wishlist for all using (auth.uid() = user_id);
