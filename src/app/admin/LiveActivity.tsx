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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 bg-[#050d1a] rounded-2xl shadow p-4 sm:p-6">
        <h2 className="font-bold text-white mb-3">Visiteurs en direct dans le monde</h2>
        <Globe3D visits={visits} />
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden flex flex-col max-h-[420px]">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1e3a5f]">Activité récente</h2>
        </div>
        <div className="overflow-y-auto divide-y divide-gray-50">
          {visits.length === 0 ? (
            <p className="px-4 sm:px-6 py-8 text-center text-gray-400 text-sm">Aucune visite sur la dernière heure</p>
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
