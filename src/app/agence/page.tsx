import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import LogoutButton from "../dashboard/LogoutButton";
import InviteForm from "./InviteForm";
import AgenceDashboardClient from "./AgenceDashboardClient";
import type { ArtisanRow, DevisRow } from "./AgenceDashboardClient";

export default async function AgencePage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (profile?.account_type !== "agence") redirect("/dashboard");

  const admin = createSupabaseAdmin();

  // Fetch linked artisans with all profile fields
  const { data: artisans } = await admin
    .from("profiles")
    .select("id, full_name, company_name, email, phone, siret")
    .eq("agence_id", user.id)
    .order("full_name");

  const artisanList = (artisans ?? []) as Pick<
    Profile,
    "id" | "full_name" | "company_name" | "email" | "phone" | "siret"
  >[];
  const artisanIds = artisanList.map((a) => a.id);

  // Fetch devis from all linked artisans (extra rows for stats, sliced to 20 for feed)
  const { data: allDevis } =
    artisanIds.length > 0
      ? await admin
          .from("devis")
          .select(
            "id, created_at, devis_number, artisan_name, client_name, total_ttc, profession, user_id"
          )
          .in("user_id", artisanIds)
          .order("created_at", { ascending: false })
          .limit(200)
      : { data: [] };

  const devisList = (allDevis ?? []) as DevisRow[];

  // ── Stats ────────────────────────────────────────────────────────────────
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const activeThisMonth = new Set(
    devisList
      .filter((d) => d.created_at >= monthStart && d.user_id)
      .map((d) => d.user_id)
  ).size;

  const totalTTC = devisList.reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  // ── Per-artisan computed stats ────────────────────────────────────────────
  const artisanRows: ArtisanRow[] = artisanList.map((a) => {
    const ownDevis = devisList.filter((d) => d.user_id === a.id);
    return {
      id: a.id,
      full_name: a.full_name,
      company_name: a.company_name,
      email: a.email,
      phone: a.phone,
      siret: a.siret,
      devisCount: ownDevis.length,
      lastActivity: ownDevis.length > 0 ? ownDevis[0].created_at : null,
      isActive: ownDevis.some((d) => d.created_at >= thirtyDaysAgo),
    };
  });

  // Recent devis feed: last 20
  const recentDevis = devisList.slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block">
              {profile?.full_name ?? user.email}
            </span>
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ backgroundColor: "rgba(249,115,22,0.2)", color: "var(--orange)" }}
            >
              Agence
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* ── Title + Invite button ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>
              Tableau de bord agence
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {profile?.full_name ?? user.email}
            </p>
          </div>
          <InviteForm agenceId={user.id} agenceName={profile?.full_name ?? ""} />
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Artisans liés", value: artisanList.length },
            { label: "Actifs ce mois", value: activeThisMonth },
            { label: "Devis générés", value: devisList.length },
            {
              label: "Volume total TTC",
              value:
                totalTTC > 0
                  ? `${totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`
                  : "0,00 €",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Artisans table + Devis feed (client-side interactive) ── */}
        <AgenceDashboardClient artisans={artisanRows} devis={recentDevis} />
      </main>
    </div>
  );
}
