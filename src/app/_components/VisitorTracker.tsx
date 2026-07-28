"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MIN_TRACKED_DURATION_MS = 500; // ignore instant bounces/navigation blips

function sendDurationBeacon(id: string, startTime: number) {
  const durationMs = Date.now() - startTime;
  if (durationMs < MIN_TRACKED_DURATION_MS) return;
  const payload = JSON.stringify({ id, durationMs });
  navigator.sendBeacon("/api/track/duration", new Blob([payload], { type: "application/json" }));
}

/**
 * Fires a pageview beacon (for the "visiteurs en ligne" widget) and reports
 * time-on-page when the visitor leaves — either by navigating to another
 * page within the app (pathname change) or by closing/refreshing the tab
 * ("pagehide", the reliable modern replacement for "beforeunload"/"unload").
 *
 * The session id is generated in memory on each page load and never
 * persisted (no cookie/localStorage) — this is a live-visitor count, not
 * cross-visit tracking, so it needs no cookie-consent gate. /admin itself
 * is excluded so admin usage never inflates visitor stats.
 */
export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const startTime = Date.now();
    let visitId: string | null = null;
    let reported = false;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: crypto.randomUUID(),
        path: pathname,
        referrer: document.referrer || null,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) visitId = data.id;
      })
      .catch(() => {});

    function reportDuration() {
      if (reported || !visitId) return;
      reported = true;
      sendDurationBeacon(visitId, startTime);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") reportDuration();
    }

    window.addEventListener("pagehide", reportDuration);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      reportDuration();
      window.removeEventListener("pagehide", reportDuration);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);

  return null;
}
