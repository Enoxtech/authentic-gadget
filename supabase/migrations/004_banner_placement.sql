-- Distinguish hero-slider banners from homepage promo-section banners.

ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'hero'
    CHECK (placement IN ('hero', 'promo'));

CREATE INDEX IF NOT EXISTS idx_banners_placement ON public.banners(placement);
