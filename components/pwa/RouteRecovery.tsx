"use client";

import { useEffect } from "react";

const RECOVERY_FLAG = "ag-route-recovery-reloaded-v1";
const CACHE_CLEAN_FLAG = "ag-cache-clean-v2";

function isChunkLoadFailure(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("chunkloaderror") ||
    lower.includes("loading chunk") ||
    lower.includes("failed to fetch dynamically imported module") ||
    lower.includes("unable to preload css")
  );
}

export default function RouteRecovery() {
  useEffect(() => {
    if (!localStorage.getItem(CACHE_CLEAN_FLAG)) {
      localStorage.setItem(CACHE_CLEAN_FLAG, "1");
      navigator.serviceWorker?.getRegistrations?.()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {});
      if ("caches" in window) {
        caches.keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => {});
      }
    }

    const recover = (message: string) => {
      if (!isChunkLoadFailure(message)) return;
      if (sessionStorage.getItem(RECOVERY_FLAG)) return;
      sessionStorage.setItem(RECOVERY_FLAG, "1");
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      recover(`${event.message || ""} ${event.error?.message || ""}`);
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      recover(typeof reason === "string" ? reason : `${reason?.message || ""} ${reason?.name || ""}`);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
