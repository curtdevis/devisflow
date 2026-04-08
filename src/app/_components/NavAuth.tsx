"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function NavAuth() {
  const [href, setHref] = useState<string | null>(null);
  const [label, setLabel] = useState("Mon espace");

  useEffect(() => {
    createSupabaseBrowser()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user) {
          const type = user.user_metadata?.account_type;
          setHref(type === "agence" ? "/agence" : "/dashboard");
          setLabel("Mon espace");
        } else {
          setHref("/auth/login");
          setLabel("Se connecter");
        }
      });
  }, []);

  if (!href) return null;

  return (
    <Link
      href={href}
      className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:opacity-80"
      style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
    >
      {label}
    </Link>
  );
}
