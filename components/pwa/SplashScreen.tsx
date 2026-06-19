"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SPLASH_FLAG = "splash-shown-v1";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!isStandalone()) return;
      if (sessionStorage.getItem(SPLASH_FLAG)) return;
      sessionStorage.setItem(SPLASH_FLAG, "1");
      setShow(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center animate-fade-out"
      style={{ background: "#040820" }}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl animate-bounce-logo" style={{ background: "#0B1E3D" }}>
        <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-2xl" />
      </div>
      <p className="mt-5 font-display text-sm font-semibold tracking-widest text-white/70 uppercase">
        Authentic Gadget
      </p>
    </div>
  );
}
