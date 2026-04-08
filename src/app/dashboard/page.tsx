import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";
import LogoutButton from "./LogoutButton";

interface Devis {
  id: string;
  created_at: string;
  devis_number: string | null;
  client_name: string;
  client_email: string | null;
  total_ttc: number;
  profession: string | null;
}

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

  const { data: devis } = await supabase
    .from("devis")
    .select("id, created_at, devis_number, client_name, client_email, total_ttc, profession")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const devisList = (devis ?? []) as Devis[];
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
            <h1
              className="text-2xl font-extrabold"
              style={{ color: "var(--navy)" }}
            >
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
            <span>+ Nouveau devis</span>
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
              value:
                devisList[0]
                  ? new Date(devisList[0].created_at).toLocaleDateString("fr-FR")
                  : "—",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p
                className="text-2xl font-extrabold"
                style={{ color: "var(--navy)" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Devis list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2
              className="font-bold text-lg"
              style={{ color: "var(--navy)" }}
            >
              Mes devis
            </h2>
          </div>

          {devisList.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold">Aucun devis pour l&apos;instant</p>
              <p className="text-sm mt-1">
                Créez votre premier devis en moins de 30 secondes.
              </p>
              <Link
                href="/devis"
                className="inline-block mt-4 text-sm font-bold px-5 py-2 rounded-xl text-white"
                style={{ backgroundColor: "var(--orange)" }}
              >
                Créer un devis →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3">N°</th>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Client</th>
                    <th className="text-left px-6 py-3 hidden sm:table-cell">
                      Travaux
                    </th>
                    <th className="text-right px-6 py-3">Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {devisList.map((d, i) => (
                    <tr
                      key={d.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? "" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">
                        {d.devis_number ?? `#${String(i + 1).padStart(3, "0")}`}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(d.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className="font-semibold"
                          style={{ color: "var(--navy)" }}
                        >
                          {d.client_name}
                        </p>
                        {d.client_email && (
                          <p className="text-xs text-gray-400">
                            {d.client_email}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden sm:table-cell max-w-xs truncate">
                        {d.profession ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold" style={{ color: "var(--navy)" }}>
                        {d.total_ttc.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
