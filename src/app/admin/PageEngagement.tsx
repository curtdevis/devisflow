"use client";

import { useEffect, useState } from "react";

interface Page {
  path: string;
  visits: number;
  avgDurationMs: number;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds}s` : `${seconds}s`;
}

export default function PageEngagement() {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/page-engagement");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setPages(data.pages ?? []);
      } catch {
        // Silent — table just keeps its last known data.
      }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const maxDuration = Math.max(1, ...pages.map((p) => p.avgDurationMs));

  return (
    <div>
      <h2 className="font-bold text-[#1e3a5f] mb-1">Où les visiteurs s&apos;attardent</h2>
      <p className="text-xs text-gray-400 mb-4">Temps moyen passé par page — 7 derniers jours</p>
      {pages.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Pas encore assez de données</p>
      ) : (
        <div className="space-y-2.5">
          {pages.map((p) => (
            <div key={p.path} className="text-sm">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-medium text-[#1e3a5f] truncate">{p.path}</span>
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {formatDuration(p.avgDurationMs)} · {p.visits} visite{p.visits > 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${(p.avgDurationMs / maxDuration) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
