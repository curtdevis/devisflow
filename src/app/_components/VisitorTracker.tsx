"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires a pageview beacon for the "visiteurs en ligne" admin widget.
 * The session id is generated in memory on each page load and never
 * persisted (no cookie/localStorage) — this is a live-visitor count, not
 * cross-visit tracking, so it needs no cookie-consent gate.
 */
export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const payload = JSON.stringify({
      sessionId: crypto.randomUUID(),
      path: pathname,
      referrer: document.referrer || null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
