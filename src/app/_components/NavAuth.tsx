"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type State = "loading" | "loggedIn" | "loggedOut";

export default function NavAuth() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [displayName, setDisplayName] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createSupabaseBrowser()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user) {
          setDisplayName(
            user.user_metadata?.full_name ||
              user.user_metadata?.display_name ||
              user.email?.split("@")[0] ||
              ""
          );
          setState("loggedIn");
        } else {
          setState("loggedOut");
        }
      });
  }, []);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  async function handleLogout() {
    await createSupabaseBrowser().auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (state === "loading") return null;

  if (state === "loggedOut") {
    return (
      <Link
        href="/auth/login"
        className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:opacity-80"
        style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
      >
        Se connecter
      </Link>
    );
  }

  const initial = (displayName.charAt(0) || "?").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
        style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: "var(--navy)" }}
        >
          {initial}
        </span>
        <span className="hidden sm:block">Mon compte</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span aria-hidden>📊</span>
            Mon dashboard
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span aria-hidden>⚙️</span>
            Paramètres
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <span aria-hidden>🚪</span>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
