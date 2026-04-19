"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const TRIAL_DAYS = 7;

interface Props {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function CheckoutButton({ className, style, children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      // Not logged in → register
      if (!user) {
        router.push("/auth/register");
        return;
      }

      // Check plan + trial status from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, created_at")
        .eq("id", user.id)
        .single();

      const plan = profile?.plan ?? "free";

      // Already paid → go straight to the app
      if (plan === "paid") {
        router.push("/devis");
        return;
      }

      // Trial still active → go to the app
      const createdAt = profile?.created_at ?? user.created_at;
      const daysSince = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
      if (daysSince <= TRIAL_DAYS) {
        router.push("/devis");
        return;
      }

      // Trial expired → open checkout
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
