import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";
import DevisTable, { type DevisRow } from "./DevisTable";

export default async function DashboardPage() {
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

  // Use admin client to bypass RLS — server-side only, user already verified above
  const { data: devis, error: devisError } = await createSupabaseAdmin()
    .from("devis")
    .select(
      "id, created_at, devis_number, artisan_name, artisan_email, artisan_siret, client_name, client_email, total_ttc, profession"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (devisError) console.error("[dashboard] devis query error:", devisError.message);

  const devisList = (devis ?? []) as DevisRow[];
  const totalTTC = devisList.reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block">
              {profile?.full_name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>
              Mon espace artisan
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Bonjour{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
            </p>
          </div>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl shadow transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--orange)" }}
          >
            + Nouveau devis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Devis générés", value: devisList.length },
            {
              label: "Volume total TTC",
              value: `${totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`,
            },
            {
              label: "Dernier devis",
              value: devisList[0]
                ? new Date(devisList[0].created_at).toLocaleDateString("fr-FR")
                : "—",
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

        {/* Devis table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-lg" style={{ color: "var(--navy)" }}>
              Mes devis
            </h2>
          </div>
          <DevisTable devis={devisList} />
        </div>
      </main>
    </div>
  );
}
