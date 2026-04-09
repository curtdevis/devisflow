"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/agence", label: "Vue d'ensemble", icon: "▦" },
  { href: "/agence/artisans", label: "Mes artisans", icon: "👷" },
  { href: "/agence/devis", label: "Tous les devis", icon: "📋" },
  { href: "/agence/facturation", label: "Facturation", icon: "💳" },
  { href: "/agence/rapports", label: "Rapports", icon: "📊" },
  { href: "/agence/invitations", label: "Invitations", icon: "✉️" },
  { href: "/agence/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function AgenceSidebar({
  agenceName,
}: {
  agenceName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/agence") return pathname === "/agence";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link href="/agence" className="text-xl font-extrabold text-white" onClick={() => setOpen(false)}>
          Devis<span style={{ color: "#f97316" }}>Flow</span>
          <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-blue-200">
            Agence
          </span>
        </Link>
      </div>

      {/* Agency name */}
      <div className="px-6 py-4 border-b border-white/10">
        <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-1">Espace agence</p>
        <p className="text-sm font-semibold text-white truncate">{agenceName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-white/15 text-white border-l-4 pl-2"
                : "text-blue-100 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
            }`}
            style={isActive(item.href) ? { borderLeftColor: "#f97316" } : {}}
          >
            <span className="text-base leading-none w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-blue-300">Cabinet &amp; Groupement</p>
        <p className="text-xs text-blue-400 mt-0.5">299 €/mois</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 z-30"
        style={{ backgroundColor: "#1e3a5f" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl text-white shadow-lg"
        style={{ backgroundColor: "#1e3a5f" }}
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside
            className="relative flex flex-col w-64 h-full shadow-2xl z-50"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
