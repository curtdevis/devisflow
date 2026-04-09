"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function AgenceHeader({
  agenceName,
  userEmail,
  userId,
}: {
  agenceName: string;
  userEmail: string;
  userId: string;
}) {
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const initial = (agenceName.charAt(0) || "A").toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await createSupabaseBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 z-20 h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4">
      {/* Spacer for mobile hamburger */}
      <div className="w-10 lg:hidden" />

      {/* Agency name breadcrumb */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate hidden sm:block">
          {agenceName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="font-semibold text-sm text-gray-900">Notifications</p>
              </div>
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-gray-500">Aucune nouvelle notification</p>
              </div>
            </div>
          )}
        </div>

        {/* Account menu */}
        <div className="relative" ref={accountRef}>
          <button
            onClick={() => setAccountOpen((v) => !v)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-none">{agenceName.slice(0, 20)}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">{userEmail}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {accountOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-50">
                <p className="text-xs font-semibold text-gray-900">{agenceName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
              <Link
                href="/agence/parametres"
                onClick={() => setAccountOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>⚙️</span> Paramètres
              </Link>
              <Link
                href="/agence/facturation"
                onClick={() => setAccountOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>💳</span> Facturation
              </Link>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <span>🚪</span> Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
