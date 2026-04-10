import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import LogoutButton from "../LogoutButton";

interface ClientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  devis_count?: number;
}

export default async function ClientsPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const admin = createSupabaseAdmin();
  const { data: clients } = await admin
    .from("clients")
    .select("id, name, email, phone, address, created_at")
    .eq("user_id", user.id)
    .order("name");

  // Get devis count per client (by client name match)
  const { data: devisCounts } = await admin
    .from("devis")
    .select("client_name")
    .eq("user_id", user.id);

  const countByName: Record<string, number> = {};
  (devisCounts ?? []).forEach(d => {
    const k = d.client_name.toLowerCase();
    countByName[k] = (countByName[k] ?? 0) + 1;
  });

  const list: ClientRow[] = (clients ?? []).map(c => ({
    ...c,
    devis_count: countByName[c.name.toLowerCase()] ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block">{profile?.full_name ?? user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { href: "/dashboard", label: "Devis" },
            { href: "/dashboard/factures", label: "Factures" },
            { href: "/dashboard/clients", label: "Clients", active: true },
          ].map(n => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${n.active ? "text-white" : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"}`}
              style={n.active ? { backgroundColor: "var(--navy)" } : {}}>
              {n.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>Ma base clients</h1>
            <p className="text-gray-500 text-sm mt-1">{list.length} client{list.length !== 1 ? "s" : ""} enregistré{list.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/devis" className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl shadow transition-transform hover:scale-105" style={{ backgroundColor: "var(--orange)" }}>
            + Nouveau devis
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-lg" style={{ color: "var(--navy)" }}>Clients</h2>
            <p className="text-xs text-gray-400">Alimenté automatiquement à chaque devis créé</p>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-semibold">Aucun client encore</p>
              <p className="text-sm mt-1">Vos clients sont automatiquement enregistrés à la création de chaque devis.</p>
              <Link href="/devis" className="inline-block mt-4 text-sm font-bold px-5 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--orange)" }}>
                Créer un devis →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3">Nom</th>
                    <th className="text-left px-3 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left px-3 py-3 hidden md:table-cell">Téléphone</th>
                    <th className="text-left px-3 py-3 hidden lg:table-cell">Adresse</th>
                    <th className="text-center px-3 py-3">Devis</th>
                    <th className="text-right px-6 py-3">Depuis</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c, i) => (
                    <tr key={c.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "hover:bg-gray-50" : "bg-gray-50/40 hover:bg-gray-50"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "var(--navy)" }}>
                            {c.name[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold" style={{ color: "var(--navy)" }}>{c.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-gray-500 hidden sm:table-cell">{c.email ?? "—"}</td>
                      <td className="px-3 py-4 text-gray-500 hidden md:table-cell">{c.phone ?? "—"}</td>
                      <td className="px-3 py-4 text-gray-400 text-xs hidden lg:table-cell max-w-[200px] truncate">{c.address ?? "—"}</td>
                      <td className="px-3 py-4 text-center">
                        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(30,58,95,0.08)", color: "var(--navy)" }}>
                          {c.devis_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString("fr-FR")}
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
