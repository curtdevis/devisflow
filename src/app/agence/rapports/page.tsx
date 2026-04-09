import { redirect } from "next/navigation";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import RapportsClient from "../_components/RapportsClient";

export type MonthlyData = {
  month: string;
  label: string;
  devisCount: number;
  volume: number;
};

export type ArtisanRapport = {
  id: string;
  name: string;
  devisTotal: number;
  volumeTotal: number;
  profession: string | null;
};

export default async function RapportsPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createSupabaseAdmin();

  const { data: artisans } = await admin
    .from("profiles")
    .select("id, full_name, company_name, email, profession")
    .eq("agence_id", user.id);

  type RawArtisan = Pick<Profile, "id" | "full_name" | "company_name" | "email"> & { profession: string | null };
  const artisanList = (artisans ?? []) as RawArtisan[];
  const artisanIds = artisanList.map((a) => a.id);

  const { data: allDevis } =
    artisanIds.length > 0
      ? await admin
          .from("devis")
          .select("id, created_at, total_ttc, profession, user_id")
          .in("user_id", artisanIds)
          .order("created_at", { ascending: true })
          .limit(2000)
      : { data: [] };

  type RawDevis = { id: string; created_at: string; total_ttc: number | null; profession: string | null; user_id: string };
  const devisList = (allDevis ?? []) as RawDevis[];

  // ── Monthly data (last 12 months) ────────────────────────────────────────
  const monthlyData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (11 - i));
    const monthStr = d.toISOString().slice(0, 7); // "2024-01"
    const matching = devisList.filter((dv) => dv.created_at.slice(0, 7) === monthStr);
    return {
      month: monthStr,
      label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      devisCount: matching.length,
      volume: matching.reduce((s, dv) => s + (dv.total_ttc ?? 0), 0),
    };
  });

  // ── Per-artisan stats ─────────────────────────────────────────────────────
  const artisanRapports: ArtisanRapport[] = artisanList.map((a) => {
    const own = devisList.filter((d) => d.user_id === a.id);
    return {
      id: a.id,
      name: a.company_name ?? a.full_name ?? a.email ?? "Artisan",
      devisTotal: own.length,
      volumeTotal: own.reduce((s, d) => s + (d.total_ttc ?? 0), 0),
      profession: a.profession,
    };
  }).sort((a, b) => b.volumeTotal - a.volumeTotal);

  // ── Profession breakdown ──────────────────────────────────────────────────
  const professionMap: Record<string, { count: number; volume: number }> = {};
  devisList.forEach((d) => {
    const key = d.profession ?? "Autre";
    if (!professionMap[key]) professionMap[key] = { count: 0, volume: 0 };
    professionMap[key].count++;
    professionMap[key].volume += d.total_ttc ?? 0;
  });

  const professionData = Object.entries(professionMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Rapports</h1>
        <p className="text-gray-500 text-sm mt-1">Analyses de performance sur les 12 derniers mois</p>
      </div>
      <RapportsClient
        monthlyData={monthlyData}
        artisanRapports={artisanRapports}
        professionData={professionData}
      />
    </div>
  );
}
