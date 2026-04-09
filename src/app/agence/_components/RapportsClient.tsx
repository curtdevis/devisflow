"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from "recharts";
import type { MonthlyData, ArtisanRapport } from "../rapports/page";

type ProfessionData = { name: string; count: number; volume: number };

const COLORS = ["#1e3a5f", "#f97316", "#10b981", "#6366f1", "#ec4899", "#f59e0b", "#06b6d4", "#8b5cf6"];

export default function RapportsClient({
  monthlyData,
  artisanRapports,
  professionData,
}: {
  monthlyData: MonthlyData[];
  artisanRapports: ArtisanRapport[];
  professionData: ProfessionData[];
}) {
  const [activeChart, setActiveChart] = useState<"devis" | "volume">("devis");

  function exportPDF() {
    toast.info("Export PDF en préparation... Fonctionnalité bientôt disponible.");
  }

  const totalDevis = monthlyData.reduce((s, m) => s + m.devisCount, 0);
  const totalVolume = monthlyData.reduce((s, m) => s + m.volume, 0);
  const bestMonth = [...monthlyData].sort((a, b) => b.volume - a.volume)[0];

  return (
    <div className="space-y-6">
      {/* Summary + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm">
            <p className="text-xs text-gray-400">Total 12 mois</p>
            <p className="font-extrabold text-gray-900">{totalDevis} devis</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm">
            <p className="text-xs text-gray-400">Volume total</p>
            <p className="font-extrabold" style={{ color: "#f97316" }}>
              {totalVolume.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
            </p>
          </div>
          {bestMonth && bestMonth.volume > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 shadow-sm">
              <p className="text-xs text-gray-400">Meilleur mois</p>
              <p className="font-extrabold" style={{ color: "#10b981" }}>
                {bestMonth.label} · {bestMonth.volume.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
              </p>
            </div>
          )}
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
          </svg>
          Exporter rapport PDF
        </button>
      </div>

      {/* Monthly trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Tendance mensuelle</h2>
            <p className="text-xs text-gray-400 mt-0.5">12 derniers mois</p>
          </div>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
            <button
              onClick={() => setActiveChart("devis")}
              className={`px-3 py-2 font-medium transition-colors ${
                activeChart === "devis" ? "text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
              style={activeChart === "devis" ? { backgroundColor: "#1e3a5f" } : {}}
            >
              Devis
            </button>
            <button
              onClick={() => setActiveChart("volume")}
              className={`px-3 py-2 font-medium transition-colors ${
                activeChart === "volume" ? "text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
              style={activeChart === "volume" ? { backgroundColor: "#1e3a5f" } : {}}
            >
              Volume
            </button>
          </div>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="colorRapport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={activeChart === "volume" ? (v) => `${(v / 1000).toFixed(0)}k` : undefined}
              />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                formatter={(value) => {
                  const v = Number(value ?? 0);
                  return activeChart === "volume"
                    ? [`${v.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`, "Volume TTC"]
                    : [`${v} devis`, "Devis générés"];
                }}
              />
              <Area
                type="monotone"
                dataKey={activeChart === "volume" ? "volume" : "devisCount"}
                stroke="#1e3a5f"
                strokeWidth={2.5}
                fill="url(#colorRapport)"
                dot={false}
                activeDot={{ r: 5, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top artisans chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Performance par artisan</h2>
          {artisanRapports.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucune donnée disponible</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={artisanRapports.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: -10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + "…" : v}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                    formatter={(value) => [`${Number(value ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`, "Volume TTC"]}
                  />
                  <Bar dataKey="volumeTotal" radius={[0, 6, 6, 0]}>
                    {artisanRapports.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Profession breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Répartition par métier</h2>
          {professionData.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucune donnée disponible</div>
          ) : (
            <div className="space-y-3">
              {professionData.map((p, i) => {
                const maxVol = professionData[0]?.volume ?? 1;
                const pct = Math.round((p.volume / maxVol) * 100);
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-700 truncate max-w-[150px]">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="text-xs text-gray-400">{p.count} devis</span>
                        <span className="font-semibold text-gray-900 min-w-[70px]">
                          {p.volume.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Artisan table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Détail par artisan</h2>
        </div>
        {artisanRapports.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Aucun artisan lié</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Artisan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Métier</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Devis</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {artisanRapports.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-gray-900">{a.name}</td>
                  <td className="px-6 py-3.5 hidden sm:table-cell">
                    {a.profession ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{a.profession}</span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-3.5 text-right text-gray-700">{a.devisTotal}</td>
                  <td className="px-6 py-3.5 text-right font-bold" style={{ color: "#1e3a5f" }}>
                    {a.volumeTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
