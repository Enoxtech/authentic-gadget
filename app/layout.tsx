import type { Metadata, Viewport } from "next";
import { manrope, playfair, jetbrainsMono } from "@/lib/fonts";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QuickViewProvider } from "@/context/QuickViewContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import RouteRecovery from "@/components/pwa/RouteRecovery";
import SplashScreen from "@/components/pwa/SplashScreen";
import QuickViewModal from "@/components/ui/QuickViewModal";
import "./globals.css";

const THEME_STORAGE_KEY = "authentic-gadget-theme";

const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var resolved = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

const EARLY_ROUTE_RECOVERY_SCRIPT = `
(function () {
  try {
    var cacheKey = "ag-cache-clean-v3";
    var reloadKey = "ag-route-recovery-reloaded-v2";
    var hasCleaned = localStorage.getItem(cacheKey);

    if (!hasCleaned) {
      localStorage.setItem(cacheKey, "1");
      if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
        navigator.serviceWorker.getRegistrations()
          .then(function (registrations) {
            registrations.forEach(function (registration) { registration.unregister(); });
          })
          .catch(function () {});
      }
      if ("caches" in window) {
        caches.keys()
          .then(function (keys) {
            keys.forEach(function (key) { caches.delete(key); });
          })
          .catch(function () {});
      }
    }

    function shouldRecover(message) {
      var lower = String(message || "").toLowerCase();
      return lower.indexOf("chunkloaderror") !== -1 ||
        lower.indexOf("loading chunk") !== -1 ||
        lower.indexOf("failed to fetch dynamically imported module") !== -1 ||
        lower.indexOf("importing a module script failed") !== -1 ||
        lower.indexOf("unable to preload css") !== -1 ||
        lower.indexOf("failed to fetch rsc payload") !== -1 ||
        lower.indexOf("failed to load static props") !== -1;
    }

    function recover(message) {
      if (!shouldRecover(message) || sessionStorage.getItem(reloadKey)) return;
      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    }

    window.addEventListener("error", function (event) {
      recover((event && event.message ? event.message : "") + " " + (event && event.error && event.error.message ? event.error.message : ""));
    });
    window.addEventListener("unhandledrejection", function (event) {
      var reason = event && event.reason;
      recover(typeof reason === "string" ? reason : ((reason && reason.message ? reason.message : "") + " " + (reason && reason.name ? reason.name : "")));
    });
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: {
    default: "Authentic Gadget | Home Of Luxury With Affordable Price",
    template: "%s | Authentic Gadget",
  },
  description:
    "Discover premium gadgets at unbeatable prices. Authentic products with fast delivery across Ghana.",
  keywords: [
    "gadgets",
    "electronics",
    "Ghana",
    "premium",
    "affordable",
    "smartphones",
    "laptops",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Authentic Gadget",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Authentic Gadget | Home Of Luxury With Affordable Price",
    description: "Premium gadgets, 100% authentic, fast delivery across Ghana.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#040820",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY_ROUTE_RECOVERY_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <div id="pwa-pre-splash" className="pwa-pre-splash" aria-hidden="true">
          <div className="pwa-pre-splash-logo">
            <img src="/logo-white.png" alt="" />
          </div>
          <p>Authentic Gadget</p>
        </div>
        <div className="bg-ambient" aria-hidden="true">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </div>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <QuickViewProvider>
                <RecentlyViewedProvider>
                  <SplashScreen />
                  <RouteRecovery />
                  {children}
                  <InstallPrompt />
                  <QuickViewModal />
                </RecentlyViewedProvider>
              </QuickViewProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
