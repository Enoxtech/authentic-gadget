import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';
const railwayBackendUrl = process.env.RAILWAY_BACKEND_URL?.replace(/\/+$/, '');
const shouldProxyApiToRailway = Boolean(railwayBackendUrl && !process.env.RAILWAY_SERVICE_ID);
const backendConnectSource = shouldProxyApiToRailway ? ` ${railwayBackendUrl}` : '';
const cloudflareR2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/+$/, '');
const cloudflareR2PublicHost = cloudflareR2PublicUrl ? new URL(cloudflareR2PublicUrl).hostname : '';
const cloudflareImageSource = cloudflareR2PublicUrl ? ` ${cloudflareR2PublicUrl}` : '';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.paystack.co https://checkout.paystack.com https://checkout.flutterwave.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co${cloudflareImageSource}`,
  "font-src 'self' data:",
  `connect-src 'self'${backendConnectSource} https://*.supabase.co https://api.paystack.co https://api.flutterwave.com https://checkout.flutterwave.com`,
  "frame-src https://checkout.paystack.com https://checkout.flutterwave.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=(self), browsing-topics=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

// NOTE: Do NOT add `Clear-Site-Data: "cache"` here. Sending it on HTML navigations makes the
// browser wipe the origin's HTTP cache *while the page is still fetching its own JS/CSS chunks*,
// which aborts those requests and surfaces as "This page couldn't load" (ChunkLoadError) on
// first load, appearing to work only after a manual refresh.
// `no-store` alone is enough to keep HTML fresh without destroying the asset cache.
const staleClientRecoveryHeaders = [
  {
    key: 'Cache-Control',
    value: 'no-store, max-age=0',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_OUTPUT_STANDALONE === 'true' ? { output: 'standalone' } : {}),
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      ...(cloudflareR2PublicHost ? [{ protocol: 'https', hostname: cloudflareR2PublicHost }] : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/',
        headers: staleClientRecoveryHeaders,
      },
      {
        source: '/:path((?!api|_next|favicon.ico|manifest.json|icons|banners|.*\\..*).*)',
        headers: staleClientRecoveryHeaders,
      },
    ];
  },
  async rewrites() {
    if (!shouldProxyApiToRailway) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${railwayBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
