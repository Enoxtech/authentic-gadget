"use client";

type MetaParams = Record<string, unknown>;
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq & { callMethod?: Fbq; queue?: unknown[]; loaded?: boolean; version?: string };
    _fbq?: Fbq;
    __agMetaPixels?: Set<string>;
  }
}

export function initMetaPixel(pixelId: string) {
  if (typeof window === "undefined" || !window.fbq || !/^\d{5,25}$/.test(pixelId)) return;
  window.__agMetaPixels ??= new Set<string>();
  if (window.__agMetaPixels.has(pixelId)) return;
  window.fbq("init", pixelId);
  window.__agMetaPixels.add(pixelId);
}

export function trackMetaEvent(event: string, params: MetaParams = {}) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

export function trackMetaCustomEvent(event: string, params: MetaParams = {}) {
  if (typeof window === "undefined" || !window.fbq || !event) return;
  window.fbq("trackCustom", event, params);
}
