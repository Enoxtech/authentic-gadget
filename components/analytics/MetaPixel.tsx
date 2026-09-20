"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { initMetaPixel, trackMetaEvent } from "@/lib/meta-pixel";

interface PublicSettings {
  metaPixelId?: string;
}

const META_BOOTSTRAP = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
`;

export default function MetaPixel() {
  const pathname = usePathname();
  const [pixelId, setPixelId] = useState("");
  const ready = useRef(false);
  const previousPath = useRef("");

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((settings: PublicSettings | null) => {
        const id = settings?.metaPixelId || "";
        if (/^\d{5,25}$/.test(id)) setPixelId(id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready.current || !pathname || previousPath.current === pathname) return;
    previousPath.current = pathname;
    trackMetaEvent("PageView");
  }, [pathname]);

  if (!pixelId) return null;

  const start = () => {
    initMetaPixel(pixelId);
    ready.current = true;
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      trackMetaEvent("PageView");
    }
  };

  return (
    <Script id="authentic-gadget-meta-pixel" strategy="afterInteractive" onReady={start}>
      {META_BOOTSTRAP}
    </Script>
  );
}
