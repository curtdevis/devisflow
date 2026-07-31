"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isTrialExpired } from "@/lib/trial";

// @supabase/supabase-js is ~54KB gzip — dynamic import keeps it out of the
// shared marketing-page bundle, fetched only when this button is clicked.
async function getSupabaseClient() {
  const { createSupabaseBrowser } = await import("@/lib/supabase-browser");
  return createSupabaseBrowser();
}

interface Props {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  tier?: "solo" | "intermediaire";
}

export default function CheckoutButton({ className, style, children, tier = "solo" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Not logged in → register
      if (!user) {
        router.push("/auth/register");
        return;
      }

      // Check effective plan + trial status — resolved server-side so a
      // team member (Intermédiaire "multi-utilisateurs") or an artisan
      // covered by a paid Cabinet & Groupement account is recognised as
      // already covered, instead of being sent to pay for a second, redundant
      // Solo subscription just because their own profile row is never
      // itself marked "paid" (see /api/account/effective-access).
      let plan = "free";
      let trialActive = false;
      const accessRes = await fetch("/api/account/effective-access");
      if (accessRes.ok) {
        const access: { plan: string; trialExpired: boolean } = await accessRes.json();
        plan = access.plan;
        trialActive = !access.trialExpired;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan, created_at, trial_days")
          .eq("id", user.id)
          .single();
        plan = profile?.plan ?? "free";
        const createdAt = profile?.created_at ?? user.created_at;
        trialActive = !isTrialExpired(createdAt, profile?.trial_days);
      }

      // Already paid (directly or via team/agence coverage) → go straight to the app
      if (plan === "paid") {
        router.push("/devis");
        return;
      }

      // Trial still active → go to the app
      if (trialActive) {
        router.push("/devis");
        return;
      }

      // Trial expired → open checkout
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erreur lors de l'ouverture du paiement. Réessayez.");
        return;
      }

      const { url } = await res.json();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={style}
    >
      {loading ? "Chargement…" : children}
    </button>
  );
}
