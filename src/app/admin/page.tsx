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
  const [{ data: devis }, { count: userCount }, { data: agences }] = await Promise.all([
    admin
      .from("devis")
      .select("id, created_at, artisan_name, artisan_email, artisan_phone, client_name, total_ttc, profession")
      .order("created_at", { ascending: false })
      .limit(500),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id, email, full_name, company_name, plan, created_at")
      .eq("account_type", "agence")
      .order("created_at", { ascending: false }),
  ]);

  return <AdminClient devis={devis ?? []} userCount={userCount ?? 0} agences={agences ?? []} />;
}
