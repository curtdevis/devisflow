import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable — DevisFlow",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f9fafb" }}>
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold mb-4" style={{ color: "#1e3a5f", opacity: 0.15 }}>404</p>
        <div className="text-5xl mb-6">🔍</div>
        <h1 className="text-2xl font-extrabold mb-3" style={{ color: "#1e3a5f" }}>
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Cette page n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil pour continuer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-xl shadow transition-transform hover:scale-105"
            style={{ backgroundColor: "#f97316" }}
          >
            ← Retour à l&apos;accueil
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Mon tableau de bord
          </Link>
        </div>
        <p className="mt-10 text-xs text-gray-400">
          <Link href="/" className="font-extrabold" style={{ color: "#1e3a5f" }}>
            Devis<span style={{ color: "#f97316" }}>Flow</span>
          </Link>{" "}
          — Générateur de devis IA pour artisans
        </p>
      </div>
    </div>
  );
}
