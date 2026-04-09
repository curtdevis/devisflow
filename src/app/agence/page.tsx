import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import OverviewClient from "./_components/OverviewClient";

export type ArtisanStat = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  profession: string | null;
  devisThisMonth: number;
  volumeThisMonth: number;
  devisTotal: number;
  volumeTotal: number;
  lastActivity: string | null;
  isActive: boolean;
};

export type DevisRow = {
  id: string;
  created_at: string;
  devis_number: string | null;
  artisan_name: string | null;
  client_name: string | null;
  total_ttc: number | null;
  profession: string | null;
  user_id: string;
};

export default async function AgenceOverviewPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createSupabaseAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Artisans linked to this agency
  const { data: artisans } = await admin
    .from("profiles")
    .select("id, full_name, company_name, email, phone, siret, profession")
    .eq("agence_id", user.id);

  const artisanList = (artisans ?? []) as (Pick<
    Profile,
    "id" | "full_name" | "company_name" | "email" | "phone" | "siret"
  > & { profession: string | null })[];
  const artisanIds = artisanList.map((a) => a.id);

  // All devis (up to 500 for stats)
  const { data: allDevis } =
    artisanIds.length > 0
      ? await admin
          .from("devis")
          .select("id, created_at, devis_number, artisan_name, client_name, total_ttc, profession, user_id")
          .in("user_id", artisanIds)
          .order("created_at", { ascending: false })
          .limit(500)
      : { data: [] };

  const devisList = (allDevis ?? []) as DevisRow[];

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const devisThisMonth = devisList.filter((d) => d.created_at >= monthStart);
  const devisPrevMonth = devisList.filter(
    (d) => d.created_at >= prevMonthStart && d.created_at < monthStart
  );

  const kpiDevisCount = devisThisMonth.length;
  const kpiDevisPrev = devisPrevMonth.length;
  const kpiVolume = devisThisMonth.reduce((s, d) => s + (d.total_ttc ?? 0), 0);
  const kpiVolumePrev = devisPrevMonth.reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  const activeArtisansThisMonth = new Set(devisThisMonth.map((d) => d.user_id)).size;
  const activeArtisansPrevMonth = new Set(devisPrevMonth.map((d) => d.user_id)).size;

  // ── Chart: devis per day last 30 days ─────────────────────────────────────
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const count = devisList.filter(
      (dv) => dv.created_at.slice(0, 10) === dayStr
    ).length;
    return {
      date: dayStr,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      count,
    };
  });

  // ── Top artisans this month ────────────────────────────────────────────────
  const artisanStats: ArtisanStat[] = artisanList.map((a) => {
    const own = devisList.filter((d) => d.user_id === a.id);
    const ownThisMonth = own.filter((d) => d.created_at >= monthStart);
    return {
      id: a.id,
      full_name: a.full_name,
      company_name: a.company_name,
      email: a.email,
      profession: a.profession,
      devisThisMonth: ownThisMonth.length,
      volumeThisMonth: ownThisMonth.reduce((s, d) => s + (d.total_ttc ?? 0), 0),
      devisTotal: own.length,
      volumeTotal: own.reduce((s, d) => s + (d.total_ttc ?? 0), 0),
      lastActivity: own.length > 0 ? own[0].created_at : null,
      isActive: own.some((d) => d.created_at >= thirtyDaysAgo),
    };
  });

  const topArtisans = [...artisanStats]
    .sort((a, b) => b.devisThisMonth - a.devisThisMonth)
    .slice(0, 5);

  // ── Recent activity (last 10 devis) ──────────────────────────────────────
  const recentDevis = devisList.slice(0, 10);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Vue d&apos;ensemble</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Artisans actifs"
          value={activeArtisansThisMonth}
          prev={activeArtisansPrevMonth}
          total={artisanList.length}
          suffix={`/ ${artisanList.length}`}
          icon="👷"
          color="#1e3a5f"
        />
        <KPICard
          label="Devis ce mois"
          value={kpiDevisCount}
          prev={kpiDevisPrev}
          icon="📋"
          color="#f97316"
        />
        <KPICard
          label="Volume TTC"
          value={kpiVolume}
          prev={kpiVolumePrev}
          isCurrency
          icon="💰"
          color="#10b981"
        />
        <KPICard
          label="Taux d'acceptation"
          value={0}
          prev={0}
          isPercent
          icon="✅"
          color="#6366f1"
          comingSoon
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/agence/invitations"
          className="inline-flex items-center gap-2 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#f97316" }}
        >
          + Inviter un artisan
        </Link>
        <Link
          href="/agence/devis"
          className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ color: "#1e3a5f" }}
        >
          📋 Tous les devis
        </Link>
        <Link
          href="/agence/rapports"
          className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ color: "#1e3a5f" }}
        >
          📊 Exporter rapport
        </Link>
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Chart (takes 2 cols) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Activité — 30 derniers jours</h2>
              <p className="text-xs text-gray-400 mt-0.5">Devis générés par jour</p>
            </div>
            <span className="text-sm font-semibold text-gray-500">
              {devisList.filter((d) => d.created_at >= thirtyDaysAgo).length} devis
            </span>
          </div>
          <OverviewClient chartData={chartData} />
        </div>

        {/* Top 5 artisans */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Top artisans</h2>
            <Link href="/agence/artisans" className="text-xs font-semibold hover:underline" style={{ color: "#f97316" }}>
              Voir tous →
            </Link>
          </div>
          {topArtisans.length === 0 ? (
            <EmptyState
              icon="👷"
              text="Aucun artisan actif ce mois-ci"
              action={{ href: "/agence/invitations", label: "Inviter un artisan" }}
            />
          ) : (
            <ol className="space-y-3">
              {topArtisans.map((a, idx) => (
                <li key={a.id} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                    style={{
                      backgroundColor: idx === 0 ? "#f97316" : idx === 1 ? "#1e3a5f" : "#e5e7eb",
                      color: idx < 2 ? "#fff" : "#6b7280",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {a.full_name ?? a.email ?? "Artisan"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.devisThisMonth} devis · {a.volumeThisMonth.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €
                    </p>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${a.isActive ? "bg-green-400" : "bg-gray-200"}`}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Activité récente</h2>
          <Link href="/agence/devis" className="text-xs font-semibold hover:underline" style={{ color: "#f97316" }}>
            Tous les devis →
          </Link>
        </div>
        {recentDevis.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-gray-500 text-sm">Aucun devis généré pour l&apos;instant</p>
            <Link
              href="/agence/invitations"
              className="mt-4 inline-flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 rounded-xl"
              style={{ backgroundColor: "#f97316" }}
            >
              Inviter des artisans →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentDevis.map((d) => {
              const artisan = artisanList.find((a) => a.id === d.user_id);
              return (
                <div key={d.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    {(artisan?.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      Devis pour {d.client_name ?? "Client inconnu"}
                    </p>
                    <p className="text-xs text-gray-400">
                      par {artisan?.full_name ?? d.artisan_name ?? "Artisan"} · {d.profession ?? ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#1e3a5f" }}>
                      {d.total_ttc?.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) ?? "—"} €
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(d.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  prev,
  suffix,
  icon,
  color,
  isCurrency,
  isPercent,
  comingSoon,
  total,
}: {
  label: string;
  value: number;
  prev: number;
  suffix?: string;
  icon: string;
  color: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  comingSoon?: boolean;
  total?: number;
}) {
  const diff = prev > 0 ? ((value - prev) / prev) * 100 : value > 0 ? 100 : 0;
  const isUp = diff >= 0;

  const display = isCurrency
    ? value.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €"
    : isPercent
    ? `${value}%`
    : value.toString() + (suffix ? ` ${suffix}` : "");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: color + "15" }}
        >
          {icon}
        </div>
        {!comingSoon && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {isUp ? "↑" : "↓"} {Math.abs(diff).toFixed(0)}%
          </span>
        )}
        {comingSoon && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
            Bientôt
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 mb-1">{display}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function EmptyState({
  icon,
  text,
  action,
}: {
  icon: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="py-8 text-center">
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-sm text-gray-500 mb-3">{text}</p>
      {action && (
        <Link
          href={action.href}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
          style={{ backgroundColor: "#f97316" }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
