"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export const LS_CHECKOUT =
  "https://devisflow.lemonsqueezy.com/checkout/buy/c410da6a-48e2-4e35-aeb0-dea0ebb29cb5";

interface Props {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function CheckoutButton({ className, style, children }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    createSupabaseBrowser()
      .auth.getUser()
      .then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  function handleClick() {
    if (userId) {
      // Logged-in user: go to Lemon Squeezy to upgrade/pay
      const url = `${LS_CHECKOUT}?checkout[custom][user_id]=${userId}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // Not logged in: free registration — no card required for trial
      router.push("/auth/register");
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  );
}
