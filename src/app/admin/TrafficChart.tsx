"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Range = "24h" | "30d";

interface Bucket {
  time: string;
  count: number;
}

function formatTick(iso: string, range: Range): string {
  const d = new Date(iso);
  return range === "24h"
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export default function TrafficChart() {
  const [range, setRange] = useState<Range>("24h");
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/visits-timeseries?range=${range}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setBuckets(data.buckets ?? []);
      } catch {
        // Silent — chart just keeps its last known data.
      }
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [range]);

  const chartData = buckets.map((b) => ({ ...b, label: formatTick(b.time, range) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[#1e3a5f]">Trafic du site</h2>
        <div className="flex gap-1 text-xs">
          {(["24h", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                range === r ? "bg-[#1e3a5f] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {r === "24h" ? "24h" : "30 jours"}
            </button>
          ))}
        </div>
      </div>
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={28} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
              labelStyle={{ color: "#1e3a5f", fontWeight: 600 }}
              formatter={(value) => [value, "Visites"]}
            />
            <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} fill="url(#trafficGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
