import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import AdminLogin from "../../AdminLogin";
import CompteClient from "./CompteClient";

export default async function ComptePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isAuthed = !!adminPassword && session?.value === adminPassword;

  if (!isAuthed) {
    return <AdminLogin />;
  }

  const admin = createSupabaseAdmin();

  const [{ data: profile }, { data: devis }] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, email, full_name, company_name, account_type, plan, siret, phone, address, profession, avatar_url, agence_id, created_at, suspended, lemon_squeezy_customer_id"
      )
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("devis")
      .select("id, created_at, devis_number, client_name, client_email, total_ttc, profession, signed_at, status")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) {
    notFound();
  }

  let agenceName: string | null = null;
  if (profile.agence_id) {
    const { data: parentAgence } = await admin
      .from("profiles")
      .select("company_name, full_name")
      .eq("id", profile.agence_id)
      .maybeSingle();
    agenceName = parentAgence?.company_name ?? parentAgence?.full_name ?? null;
  }

  return <CompteClient profile={profile} devis={devis ?? []} agenceName={agenceName} />;
}
