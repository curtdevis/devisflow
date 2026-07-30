import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logiciel Devis Carreleur — Devis IA en 30s | DevisFlow",
  description:
    "Le logiciel de devis pensé pour les carreleurs : génération par IA en 30 secondes, pose carrelage, faïence, parquet, TVA 10%, Factur-X 2026. Essai gratuit 7 jours sans carte.",
  alternates: { canonical: "/devis-carreleur" },
};

const SPECIALITES = [
  {
    accent: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    icon: "📐",
    title: "Calcul automatique en m²",
    desc: "Renseignez simplement la surface à poser. DevisFlow calcule automatiquement les quantités, intègre les chutes estimées (5 à 15 % selon le format et la pièce) et génère les lignes de devis correspondantes.",
  },
  {
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    icon: "🔲",
    title: "Formats et références carrelage",
    desc: "Précisez le format (20×20, 30×60, 60×60, 80×80, grand format) et la référence fournisseur directement dans le devis. Vos clients ont toutes les informations pour valider leur choix.",
  },
  {
    accent: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    icon: "🏷️",
    title: "TVA 10 % rénovation",
    desc: "Pour les travaux de rénovation sur logement de plus de 2 ans, la TVA est automatiquement appliquée à 10 %. DevisFlow sélectionne le bon taux selon la nature des travaux.",
  },
  {
    accent: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    icon: "📋",
    title: "Postes types carreleur intégrés",
    desc: "Dépose ancien carrelage, ragréage sol, fourniture carrelage (€/m²), pose, joints et plinthes — tous les postes sont pré-remplis. Ajustez les prix et les quantités en quelques secondes.",
  },
];

const FAQS_CARRELEUR = [
  {
    q: "Prix moyen pose carrelage au m² ?",
    a: "Le prix de pose de carrelage varie entre 25 € et 60 € par m² selon la complexité (format, pattern, sols chauffants). À cela s'ajoutent la fourniture du carrelage (5 à 80 €/m² selon gamme), le ragréage (8-15 €/m²) et la dépose de l'ancien carrelage (10-20 €/m²). Avec DevisFlow, vous générez un devis détaillé et adapté à votre région en moins de 30 secondes.",
  },
  {
    q: "TVA carrelage : 10 % ou 20 % ?",
    a: "La TVA à taux réduit de 10 % s'applique aux travaux de rénovation d'un logement achevé depuis plus de 2 ans et affecté à l'usage d'habitation. La TVA à 20 % s'applique dans les constructions neuves, les locaux commerciaux ou si la fourniture de matériaux dépasse le seuil réglementaire (part matériaux > 2 fois la main d'œuvre dans certains cas). DevisFlow sélectionne automatiquement le bon taux.",
  },
  {
    q: "Devis carrelage gratuit : comment en obtenir un ?",
    a: "Avec DevisFlow, créez votre compte gratuitement en 30 secondes et générez votre premier devis carreleur immédiatement. L'IA pré-remplit les postes types (dépose, ragréage, fourniture, pose, joints, plinthes), calcule la TVA au bon taux et produit un PDF professionnel à votre en-tête. Essai gratuit 7 jours, sans carte bancaire.",
  },
];

const JSONLD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS_CARRELEUR.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://devis-flow.fr/" },
    { "@type": "ListItem", position: 2, name: "Devis Carreleur", item: "https://devis-flow.fr/devis-carreleur" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Génération de devis pour carreleurs",
  provider: { "@id": "https://devis-flow.fr/#organization" },
  areaServed: { "@type": "Country", name: "France" },
  audience: { "@type": "Audience", audienceType: "Carreleurs, artisans revêtement sol" },
  url: "https://devis-flow.fr/devis-carreleur",
};

export default function DevisCarreleurPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-extrabold tracking-tight" style={{ color: "var(--navy)" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <Link href="/#pourquoi" className="hover:text-gray-900 transition-colors">Pourquoi</Link>
            <Link href="/#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</Link>
            <Link href="/#faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
            <Link href="/comparatif" className="hover:text-gray-900 transition-colors">Comparatif</Link>
            <Link href="/cabinets-experts-comptables" className="hover:text-gray-900 transition-colors">Agences</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/register" className="text-sm font-bold text-white px-4 py-2 rounded-lg shadow-sm transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "var(--orange)" }}>
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      <nav aria-label="fil d'ariane" className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">Accueil</Link> / Devis Carreleur
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ backgroundColor: "var(--navy)" }}>
          <div className="absolute inset-0 hero-glow" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "var(--orange)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              IA spécialisée BTP · Carreleur · Conforme 2026
            </div>
            <h1 className="text-white mb-5" style={{ fontSize: "clamp(1.9rem, 5vw, 3.2rem)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Devis carreleur professionnel{" "}
              <span style={{ color: "var(--orange)" }}>en 30 secondes</span>
            </h1>
            <p className="text-blue-200 leading-relaxed mb-8 max-w-2xl mx-auto" style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}>
              Créez un devis carrelage complet — pose, ragréage, fourniture, joints, plinthes — avec calcul automatique en m², TVA 10 % et PDF professionnel à votre en-tête. Depuis votre téléphone, sur le chantier.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register" className="inline-flex items-center justify-center font-bold text-white px-8 py-4 rounded-xl shadow-lg transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "var(--orange)", fontSize: "1rem" }}>
                Créer mon devis carreleur gratuit →
              </Link>
              <Link href="/#demo" className="inline-flex items-center justify-center font-semibold text-white px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm">
                Voir la démo
              </Link>
            </div>
            <p className="mt-4 text-sm text-blue-300/80">Sans carte bancaire · Essai 7 jours · Annulation à tout moment</p>
          </div>
        </section>

        {/* ── 4 spécificités métier ── */}
        <section className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Conçu pour les carreleurs</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: "var(--navy)" }}>
                Tout ce qu&apos;un devis carrelage doit contenir
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
                L&apos;IA DevisFlow connaît votre métier : unités, postes types, taux de TVA et chutes estimées.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SPECIALITES.map((s) => (
                <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ transition: "box-shadow 0.2s" }}>
                  <div className="h-[3px]" style={{ backgroundColor: s.accent }} />
                  <div className="p-5">
                    <div className="text-3xl mb-3">{s.icon}</div>
                    <h3 className="text-sm font-extrabold mb-2" style={{ color: "var(--navy)" }}>{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Exemple devis ── */}
        <section className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.04)" }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Exemple concret</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>
                Un devis carrelage généré par l&apos;IA
              </h2>
              <p className="text-gray-500 text-sm">Rénovation salle de bain 20 m² — carrelage 60×60 cm</p>
            </div>

            {/* Devis card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: "var(--navy)" }}>Carrelages Dupont</p>
                  <p className="text-sm text-gray-500">DEVIS N° 2024-087 · Rénovation salle de bain</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: "var(--orange)" }}>Exemple IA</span>
              </div>

              {/* Lines */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs">Désignation</th>
                      <th className="text-center px-3 py-3 font-semibold text-gray-500 text-xs">Qté</th>
                      <th className="text-center px-3 py-3 font-semibold text-gray-500 text-xs">Unité</th>
                      <th className="text-right px-3 py-3 font-semibold text-gray-500 text-xs">P.U. HT</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { desc: "Dépose ancien carrelage (y compris évacuation)", qty: 20, unit: "m²", pu: "15,00 €", total: "300,00 €" },
                      { desc: "Ragréage sol — mise à niveau avant pose", qty: 20, unit: "m²", pu: "12,00 €", total: "240,00 €" },
                      { desc: "Fourniture carrelage 60×60 cm (réf. Gres Blanc Mat F60 — chute 8% incluse)", qty: 21.6, unit: "m²", pu: "28,00 €", total: "604,80 €" },
                      { desc: "Pose carrelage au sol — bain de mortier colle", qty: 20, unit: "m²", pu: "35,00 €", total: "700,00 €" },
                      { desc: "Joints carrelage (couleur au choix client)", qty: 20, unit: "m²", pu: "4,50 €", total: "90,00 €" },
                      { desc: "Plinthes assorties (périmètre pièce)", qty: 18, unit: "ml", pu: "8,00 €", total: "144,00 €" },
                    ].map((row) => (
                      <tr key={row.desc} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-gray-700 font-medium max-w-[240px]">{row.desc}</td>
                        <td className="px-3 py-3.5 text-center text-gray-600">{row.qty}</td>
                        <td className="px-3 py-3.5 text-center text-gray-400">{row.unit}</td>
                        <td className="px-3 py-3.5 text-right text-gray-600">{row.pu}</td>
                        <td className="px-5 py-3.5 text-right font-semibold" style={{ color: "var(--navy)" }}>{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="px-5 py-5 border-t border-gray-100 bg-gray-50/40">
                <div className="max-w-xs ml-auto space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Total HT</span>
                    <span className="font-semibold">2 078,80 €</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>TVA 10 % (rénovation logement)</span>
                    <span>207,88 €</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-200" style={{ color: "var(--navy)" }}>
                    <span>Total TTC</span>
                    <span>2 286,68 €</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">* Chute estimée à 8 % pour format 60×60 — incluse dans la fourniture. TVA à taux réduit 10 % applicable aux travaux de rénovation d&apos;habitation (Art. 279-0 bis CGI).</p>
              </div>

              {/* CTA inline */}
              <div className="px-5 py-4 border-t border-gray-100 text-center">
                <Link href="/auth/register" className="inline-flex items-center gap-2 font-bold text-white px-6 py-3 rounded-xl transition-all hover:opacity-90 text-sm" style={{ backgroundColor: "var(--orange)" }}>
                  Générer mon devis carreleur →
                </Link>
                <p className="text-xs text-gray-400 mt-2">Ce devis a été généré en 28 secondes par DevisFlow IA</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Témoignage ── */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-700 text-base leading-relaxed mb-6">
                &ldquo;Avant DevisFlow, je passais 1h30 sur chaque devis carrelage — calculer les m², estimer les chutes, trouver le bon taux de TVA... Maintenant je renseigne la surface et la référence du carrelage, l&apos;IA fait tout. Je repars du chantier avec le devis signé sur mon téléphone. J&apos;ai gagné 2 chantiers cette semaine parce que j&apos;ai répondu le premier.&rdquo;
              </blockquote>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ backgroundColor: "var(--navy)" }}>
                  R
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>Rachid M.</p>
                  <p className="text-xs text-gray-400">Carreleur indépendant, Toulouse — 12 ans d&apos;expérience</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--navy)" }}>Questions fréquentes — Devis carreleur</h2>
            </div>
            <div className="space-y-2">
              {FAQS_CARRELEUR.map((faq) => (
                <details key={faq.q} className="group border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors bg-white">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 font-semibold text-gray-800 list-none text-sm">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform shrink-0 text-xl font-light leading-none">+</span>
                  </summary>
                  <p className="px-5 pb-4 text-gray-500 leading-relaxed text-sm">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-20 px-4 text-center" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1e3a8a 100%)" }}>
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Votre prochain devis carreleur en 30 secondes
            </h2>
            <p className="text-blue-200 text-sm sm:text-base mb-8">
              Essai gratuit 7 jours — sans carte bancaire. Annulation en 1 clic.
            </p>
            <Link href="/auth/register" className="inline-flex items-center text-white font-bold text-base px-10 py-4 rounded-xl shadow-xl transition-all hover:opacity-90 hover:scale-105 active:scale-95" style={{ backgroundColor: "var(--orange)" }}>
              Commencer mon essai gratuit →
            </Link>
            <p className="mt-4 text-xs text-blue-400">Devis PDF professionnel · TVA automatique · Conforme e-facture 2026</p>
          </div>
        </section>
      </main>

      {/* ── JSON-LD FAQPage ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* ── Footer ── */}
      <footer className="py-10 px-4 text-center text-sm text-blue-200" style={{ backgroundColor: "var(--navy-dark)" }}>
        <p className="font-extrabold text-white text-lg mb-1">Devis<span style={{ color: "var(--orange)" }}>Flow</span></p>
        <p className="mb-5 text-blue-300 text-sm">Le générateur de devis IA pour les artisans français</p>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-blue-400 mb-5">
          <Link href="/devis-plombier" className="hover:text-white transition-colors">Devis plombier</Link>
          <Link href="/devis-electricien" className="hover:text-white transition-colors">Devis électricien</Link>
          <Link href="/devis-peintre" className="hover:text-white transition-colors">Devis peintre</Link>
          <Link href="/devis-macon" className="hover:text-white transition-colors">Devis maçon</Link>
          <Link href="/comparatif" className="hover:text-white transition-colors">Comparatif</Link>
          <Link href="/cabinets-experts-comptables" className="hover:text-white transition-colors">Cabinets &amp; Groupements</Link>
          <Link href="/facture-electronique-artisan-2026" className="hover:text-white transition-colors">Facture électronique 2026</Link>
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-xs text-blue-500">© {new Date().getFullYear()} DevisFlow — Tous droits réservés</p>
      </footer>
    </div>
  );
}
