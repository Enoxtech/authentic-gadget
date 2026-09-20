ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS meta_pixel_id text,
  ADD COLUMN IF NOT EXISTS meta_conversion_event text,
  ADD COLUMN IF NOT EXISTS meta_capi_token_enc text;

CREATE TABLE IF NOT EXISTS public.sales_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  is_published boolean NOT NULL DEFAULT false,
  meta_pixel_id text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_pages_slug ON public.sales_pages(slug);
CREATE INDEX IF NOT EXISTS idx_sales_pages_product_id ON public.sales_pages(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_pages_published ON public.sales_pages(is_published) WHERE is_published = true;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS sales_page_id uuid REFERENCES public.sales_pages(id) ON DELETE SET NULL;

ALTER TABLE public.sales_pages ENABLE ROW LEVEL SECURITY;

INSERT INTO public.sales_pages (name, slug, product_id, is_published, config)
SELECT
  'iPhone 15 Pro Max Sales Page',
  'iphone-15-pro-max-offer',
  id,
  false,
  '{}'::jsonb
FROM public.products
WHERE slug = 'iphone-15-pro-max'
ON CONFLICT (slug) DO NOTHING;
