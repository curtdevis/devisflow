"use client";

import { useEffect, useState } from "react";
import Globe3D from "./Globe3D";

interface Visit {
  session_id: string;
  path: string;
  country: string | null;
  country_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
}

function flagEmoji(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = [...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `il y a ${hours} h`;
}

interface LocationCount {
  label: string;
  flag: string;
  count: number;
}

function topLocations(visits: Visit[]): LocationCount[] {
  const counts = new Map<string, { flag: string; count: number }>();
  for (const v of visits) {
    const label = [v.city, v.country].filter(Boolean).join(", ") || "Localisation inconnue";
    const existing = counts.get(label);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(label, { flag: flagEmoji(v.country_code), count: 1 });
    }
  }
  return Array.from(counts.entries())
    .map(([label, { flag, count }]) => ({ label, flag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default function LiveActivity() {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/visits-recent");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setVisits(data.visits ?? []);
      } catch {
        // Silent — panel just keeps its last known data.
      }
    }
    load();
    const interval = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const locations = topLocations(visits);
  const maxCount = locations[0]?.count ?? 1;
  const liveCount = new Set(
    visits.filter((v) => Date.now() - new Date(v.created_at).getTime() < 5 * 60_000).map((v) => v.session_id)
  ).size;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 bg-white rounded-2xl shadow p-4 sm:p-6">
        <h2 className="font-bold text-[#1e3a5f] mb-3">Affichage en direct</h2>
        <Globe3D visits={visits} />
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden flex flex-col max-h-[420px]">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Visiteurs en ce moment</p>
          <p className="text-3xl font-bold text-[#1e3a5f]">{liveCount}</p>
        </div>
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1e3a5f] mb-3">Top localisations</h2>
          {locations.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune visite sur les dernières 24h</p>
          ) : (
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.label} className="flex items-center gap-2">
                  <span className="text-xs text-[#1e3a5f] truncate w-32 shrink-0">
                    {loc.flag} {loc.label}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f97316] rounded-full"
                      style={{ width: `${Math.max(8, (loc.count / maxCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right shrink-0">{loc.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100">
          <h2 className="font-bold text-[#1e3a5f] text-sm">Activité récente</h2>
        </div>
        <div className="overflow-y-auto divide-y divide-gray-50">
          {visits.length === 0 ? (
            <p className="px-4 sm:px-6 py-8 text-center text-gray-400 text-sm">Aucune visite sur les dernières 24h</p>
          ) : (
            visits.slice(0, 30).map((v, i) => (
              <div key={`${v.session_id}-${v.created_at}-${i}`} className="px-4 sm:px-6 py-3 text-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[#1e3a5f] truncate">
                    {flagEmoji(v.country_code)} {v.city ?? v.country ?? "Localisation inconnue"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {v.path} · {v.device_type ?? "?"} · {v.browser ?? "?"}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(v.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
