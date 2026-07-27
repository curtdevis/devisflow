import { createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import type { ArtisanStat, DevisRow } from "@/types/agence";

export interface OverviewData {
  artisanList: (Pick<Profile, "id" | "full_name" | "company_name" | "email" | "phone" | "siret"> & { profession: string | null })[];
  kpiDevisCount: number;
  kpiDevisPrev: number;
  kpiVolume: number;
  kpiVolumePrev: number;
  activeArtisansThisMonth: number;
  activeArtisansPrevMonth: number;
  kpiAcceptance: number;
  kpiAcceptancePrev: number;
  chartData: { date: string; label: string; count: number }[];
  topArtisans: ArtisanStat[];
  recentDevis: DevisRow[];
  devisLast30Days: number;
}

export async function getOverviewData(agenceUserId: string): Promise<OverviewData> {
  const admin = createSupabaseAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Artisans linked to this agency
  const { data: artisans } = await admin
    .from("profiles")
    .select("id, full_name, company_name, email, phone, siret, profession")
    .eq("agence_id", agenceUserId);

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
          .select("id, created_at, devis_number, artisan_name, client_name, total_ttc, profession, user_id, signed_at")
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

  const kpiAcceptance = devisThisMonth.length > 0
    ? Math.round((devisThisMonth.filter((d) => d.signed_at).length / devisThisMonth.length) * 100)
    : 0;
  const kpiAcceptancePrev = devisPrevMonth.length > 0
    ? Math.round((devisPrevMonth.filter((d) => d.signed_at).length / devisPrevMonth.length) * 100)
    : 0;

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

  const devisLast30Days = devisList.filter((d) => d.created_at >= thirtyDaysAgo).length;

  return {
    artisanList,
    kpiDevisCount,
    kpiDevisPrev,
    kpiVolume,
    kpiVolumePrev,
    activeArtisansThisMonth,
    activeArtisansPrevMonth,
    kpiAcceptance,
    kpiAcceptancePrev,
    chartData,
    topArtisans,
    recentDevis,
    devisLast30Days,
  };
}
