"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

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

      if (!user) {
        router.push("/auth/register");
        return;
      }

      // Create a live checkout session server-side (test_mode: false enforced)
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[checkout]", data.error ?? res.statusText);
        return;
      }

      const { url } = await res.json();
      window.open(url, "_blank", "noopener,noreferrer");
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
