-- Homepage hero banner CMS for Authentic Gadget.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  image text NOT NULL,
  headline text NOT NULL,
  subtitle text,
  price_label text,
  badge text,
  cta_label text NOT NULL DEFAULT 'Shop Now',
  cta_href text NOT NULL DEFAULT '/products',
  accent_color text NOT NULL DEFAULT '#19AFFF',
  align text NOT NULL DEFAULT 'left' CHECK (align IN ('left', 'center', 'right')),
  transition text NOT NULL DEFAULT 'fade' CHECK (transition IN ('fade', 'slide', 'zoom')),
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banners_read" ON public.banners;
CREATE POLICY "banners_read" ON public.banners FOR SELECT USING (enabled = true);

CREATE INDEX IF NOT EXISTS idx_banners_sort_order ON public.banners(sort_order);
