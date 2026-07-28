import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';
const railwayBackendUrl = process.env.RAILWAY_BACKEND_URL?.replace(/\/+$/, '');
const shouldProxyApiToRailway = Boolean(railwayBackendUrl && !process.env.RAILWAY_SERVICE_ID);
const backendConnectSource = shouldProxyApiToRailway ? ` ${railwayBackendUrl}` : '';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.paystack.co https://checkout.paystack.com https://checkout.flutterwave.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
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
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
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
