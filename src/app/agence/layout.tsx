import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import AgenceSidebar from "./_components/AgenceSidebar";
import AgenceHeader from "./_components/AgenceHeader";
import { Toaster } from "sonner";

export default async function AgenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const agenceName =
    profile?.company_name ?? profile?.full_name ?? "Mon Agence";

  return (
    <div className="min-h-screen bg-gray-50">
      <AgenceSidebar agenceName={agenceName} />
      <div className="lg:ml-60">
        <AgenceHeader
          agenceName={agenceName}
          userEmail={user.email ?? ""}
          userId={user.id}
        />
        <main className="pt-16 min-h-screen">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
