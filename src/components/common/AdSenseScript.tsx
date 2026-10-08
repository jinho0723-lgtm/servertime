"use client";

import { useEffect } from "react";

interface AdSenseScriptProps {
  client: string;
}

/**
 * High-performance Non-Blocking Google AdSense Loader
 * Loads adsbygoogle.js only after main thread is idle (requestIdleCallback)
 * Prevents mobile CPU throttling and eliminates 3~4s delay in First Contentful Paint (FCP)
 */
export function AdSenseScript({ client }: AdSenseScriptProps) {
  useEffect(() => {
    if (!client) return;

    const loadScript = () => {
      if (document.getElementById("google-adsense-script")) return;
      const script = document.createElement("script");
      script.id = "google-adsense-script";
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    };

    // Defer until browser finishes painting first contentful frame
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(loadScript, { timeout: 2500 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const timer = setTimeout(loadScript, 2000);
      return () => clearTimeout(timer);
    }
  }, [client]);

  return null;
}
