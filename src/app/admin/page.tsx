import { cookies } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import AdminClient from "./AdminClient";
import AdminLogin from "./AdminLogin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminPassword = process.env.ADMIN_PASSWORD;

  const isAuthed = !!adminPassword && session?.value === adminPassword;

  if (!isAuthed) {
    return <AdminLogin />;
  }

  const admin = createSupabaseAdmin();
  const [{ data: devis }, { count: userCount }, { data: agences }, { data: statsReset }, { data: accounts }, { data: allClients }] = await Promise.all([
    admin
      .from("devis")
      .select(
        "id, created_at, devis_number, artisan_name, artisan_email, artisan_phone, artisan_siret, client_name, client_email, total_ttc, profession, result_json, signed_at, status, refusal_reason"
      )
      .order("created_at", { ascending: false }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id, email, full_name, company_name, plan, tier, created_at")
      .eq("account_type", "agence")
      .order("created_at", { ascending: false }),
    admin.from("admin_stats_reset").select("reset_at").eq("id", 1).maybeSingle(),
    admin
      .from("profiles")
      .select("id, email, full_name, company_name, account_type, plan, tier, profession, created_at, suspended, trial_days")
      .order("created_at", { ascending: false }),
    admin
      .from("clients")
      .select("id, user_id, name, email, phone, address, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AdminClient
      devis={devis ?? []}
      userCount={userCount ?? 0}
      agences={agences ?? []}
      statsResetAt={statsReset?.reset_at ?? null}
      accounts={accounts ?? []}
      allClients={allClients ?? []}
    />
  );
}
