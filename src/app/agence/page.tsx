import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";
import LogoutButton from "../dashboard/LogoutButton";
import InviteForm from "./InviteForm";

interface Artisan {
  id: string;
  full_name: string | null;
  email: string;
  siret: string | null;
  phone: string | null;
}

interface Devis {
  id: string;
  created_at: string;
  devis_number: string | null;
  artisan_name: string;
  client_name: string;
  total_ttc: number;
  profession: string | null;
  user_id: string | null;
}

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

  // Fetch linked artisans
  const { data: artisans } = await supabase
    .from("profiles")
    .select("id, full_name, email, siret, phone")
    .eq("agence_id", user.id)
    .order("full_name");

  const artisanList = (artisans ?? []) as Artisan[];
  const artisanIds = artisanList.map((a) => a.id);

  // Fetch all devis from linked artisans
  const { data: devis } =
    artisanIds.length > 0
      ? await supabase
          .from("devis")
          .select(
            "id, created_at, devis_number, artisan_name, client_name, total_ttc, profession, user_id"
          )
          .in("user_id", artisanIds)
          .order("created_at", { ascending: false })
          .limit(100)
      : { data: [] };

  const devisList = (devis ?? []) as Devis[];
  const totalTTC = devisList.reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Artisans liés", value: artisanList.length },
            { label: "Devis générés", value: devisList.length },
            {
              label: "Volume total TTC",
              value: `${totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`,
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Artisans list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold" style={{ color: "var(--navy)" }}>
                Artisans ({artisanList.length})
              </h2>
            </div>
            {artisanList.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm px-6">
                <p className="text-3xl mb-2">👷</p>
                <p>Invitez des artisans pour commencer.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {artisanList.map((a) => (
                  <li key={a.id} className="px-6 py-4">
                    <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>
                      {a.full_name ?? a.email}
                    </p>
                    <p className="text-xs text-gray-400">{a.email}</p>
                    {a.siret && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        SIRET {a.siret}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">
                      {devisList.filter((d) => d.user_id === a.id).length} devis
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Devis list */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold" style={{ color: "var(--navy)" }}>
                Tous les devis ({devisList.length})
              </h2>
            </div>
            {devisList.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                <p className="text-4xl mb-2">📋</p>
                <p>Aucun devis pour l&apos;instant.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Artisan</th>
                      <th className="text-left px-4 py-3">Client</th>
                      <th className="text-right px-4 py-3">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devisList.map((d, i) => {
                      const art = artisanList.find((a) => a.id === d.user_id);
                      return (
                        <tr
                          key={d.id}
                          className={`border-b border-gray-50 hover:bg-gray-50 ${
                            i % 2 === 0 ? "" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {new Date(d.created_at).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: "var(--navy)" }}>
                            {art?.full_name ?? d.artisan_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{d.client_name}</td>
                          <td className="px-4 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>
                            {d.total_ttc.toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            €
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
