import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Générateur Devis Peintre Gratuit — DevisFlow IA",
  description:
    "Créez un devis peintre professionnel en 30 secondes avec l'IA. Devis peinture intérieure/extérieure, TVA 10%, Factur-X 2026. Essai gratuit 7 jours sans carte.",
  alternates: { canonical: "/devis-peintre" },
};

const FAQS = [
  {
    q: "Comment calculer le prix d'un devis peinture ?",
    a: "Le prix d'un devis peinture se calcule en multipliant la surface à peindre (en m²) par le tarif de pose, puis en ajoutant le coût des matériaux (peinture, apprêt, enduit). Comptez en moyenne 15 à 30 €/m² pour une peinture intérieure deux couches, fournitures incluses. Il faut également intégrer la préparation du support (rebouchage, ponçage) et les finitions (plinthes, baguettes). Avec DevisFlow, l'IA calcule automatiquement le total et applique la bonne TVA selon le type de travaux.",
  },
  {
    q: "TVA sur travaux de peinture : quel taux ?",
    a: "Le taux de TVA applicable aux travaux de peinture dépend du contexte : 10 % pour les travaux de rénovation dans des logements achevés depuis plus de 2 ans (résidence principale ou secondaire), et 20 % pour les locaux neufs ou professionnels. Pour bénéficier du taux réduit, le client doit vous remettre une attestation de TVA à taux réduit (formulaire fiscal). DevisFlow applique automatiquement le bon taux selon les informations saisies et génère les mentions obligatoires.",
  },
  {
    q: "Que doit contenir un devis peintre ?",
    a: "Un devis peintre professionnel doit obligatoirement mentionner : vos coordonnées complètes (nom, adresse, SIRET, numéro d'assurance), les coordonnées du client, la date et la durée de validité du devis, le détail des prestations (surface en m², nombre de couches, référence des peintures), les prix unitaires HT et TTC, le taux de TVA appliqué, les délais d'exécution, les modalités de paiement, et la mention de la garantie de 2 ans. DevisFlow génère tous ces éléments automatiquement, conformément à la réglementation.",
  },
];

const SCHEMA_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const SPECS = [
  {
    accent: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    icon: "📋",
    title: "TVA 10 % rénovation",
    desc: "Applicable aux travaux de peinture sur logements achevés depuis plus de 2 ans. DevisFlow applique automatiquement le bon taux et génère l'attestation client.",
  },
  {
    accent: "#1e3a5f",
    bg: "rgba(30,58,95,0.07)",
    icon: "📐",
    title: "Chiffrage au m²",
    desc: "Unité standard du métier : surface peinte en m², nombre de couches précisé, tarif pose intérieure / extérieure différencié selon nature du support.",
  },
  {
    accent: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    icon: "🎨",
    title: "Postes types intégrés",
    desc: "Préparation support (enduit, rebouchage), fourniture peinture (marque, référence couleur), pose, finitions plinthes et baguettes — tout est pré-rempli.",
  },
  {
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    icon: "✅",
    title: "Mentions légales automatiques",
    desc: "Garantie 2 ans peinture, délai d'exécution, peintures certifiées A+, numéro SIRET — toutes les mentions obligatoires insérées sans effort.",
  },
];

export default function DevisPeintrePage() {
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
            <Link href="/comparatif" className="hover:text-gray-900 transition-colors">Comparatif</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Agences</Link>
          </div>
          <Link
            href="/auth/register"
            className="text-sm font-bold text-white px-4 py-2 rounded-lg shadow-sm transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "var(--orange)" }}
          >
            Essai gratuit →
          </Link>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ backgroundColor: "var(--navy)" }}>
          <div className="absolute inset-0 hero-glow" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "var(--orange)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              IA spécialisée peinture · TVA 10 % · Conforme 2026
            </div>

            <h1 className="text-white mb-5" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Devis peintre professionnel{" "}
              <span style={{ color: "var(--orange)" }}>en 30 secondes</span>
            </h1>

            <p className="text-blue-200 leading-relaxed mb-8 max-w-xl" style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}>
              Générez un devis peinture complet — m², TVA 10 %, garantie 2 ans, peintures certifiées A+ — depuis votre chantier, en moins d&apos;une minute. Conforme Factur-X 2026.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center font-bold text-white px-7 py-3.5 rounded-xl shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-95"
                style={{ backgroundColor: "var(--orange)", fontSize: "1rem" }}
              >
                Créer mon devis peinture gratuit →
              </Link>
              <Link
                href="/comparatif"
                className="inline-flex items-center justify-center font-semibold text-white px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm"
              >
                Voir le comparatif
              </Link>
            </div>

            <p className="text-sm text-blue-300/80">Essai gratuit 7 jours · Sans carte bancaire · Annulation à tout moment</p>

            {/* Stats rapides */}
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {[
                { v: "30 s", l: "génération devis" },
                { v: "TVA 10%", l: "appliquée auto." },
                { v: "Garantie 2 ans", l: "mention incluse" },
                { v: "Factur-X", l: "conforme 2026" },
              ].map((s) => (
                <div key={s.l} className="text-center sm:text-left">
                  <p className="text-xl font-extrabold leading-none" style={{ color: "var(--orange)" }}>{s.v}</p>
                  <p className="text-xs text-blue-300/70 mt-0.5 uppercase tracking-wider">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Spécificités peintre ── */}
        <section className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>IA formée sur votre métier</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: "var(--navy)" }}>
                Tout ce qu&apos;un devis peintre doit contenir
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
                DevisFlow connaît les spécificités de la peinture en bâtiment : unités, TVA, garanties et mentions légales.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SPECS.map((s) => (
                <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-[3px]" style={{ backgroundColor: s.accent }} />
                  <div className="p-5">
                    <div className="text-2xl mb-3">{s.icon}</div>
                    <h3 className="text-sm font-extrabold mb-2" style={{ color: "var(--navy)" }}>{s.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Exemple de devis ── */}
        <section className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Exemple concret</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--navy)" }}>
                Un devis peinture généré par DevisFlow
              </h2>
              <p className="text-gray-500 text-sm mt-2">Rénovation salon 45 m² — peinture intérieure 2 couches</p>
            </div>

            {/* Devis mockup */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

              {/* Header devis */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4" style={{ backgroundColor: "var(--navy)" }}>
                <div>
                  <p className="text-white font-extrabold text-lg">DEVIS N° 2026-041</p>
                  <p className="text-blue-300 text-xs mt-0.5">Émis le 18 avril 2026 · Valable 30 jours</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: "var(--orange)" }}>
                  Peinture intérieure
                </span>
              </div>

              {/* Infos client / artisan */}
              <div className="px-6 py-4 border-b border-gray-50 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Artisan</p>
                  <p className="font-bold" style={{ color: "var(--navy)" }}>Dupont Peinture SARL</p>
                  <p className="text-gray-500 text-xs leading-relaxed">12 rue des Artisans, 69003 Lyon<br />SIRET : 123 456 789 00012<br />Assurance RCP : AXA n° 98765432</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Client</p>
                  <p className="font-bold" style={{ color: "var(--navy)" }}>M. et Mme Martin</p>
                  <p className="text-gray-500 text-xs leading-relaxed">8 allée des Roses, 69005 Lyon<br />martin@email.fr · 06 12 34 56 78</p>
                </div>
              </div>

              {/* Lignes devis */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Désignation</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qté</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Unité</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">PU HT</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "Préparation des murs — rebouchage, ponçage, impression",
                        sub: "Support plâtre existant, 2 couches d'impression",
                        qty: "45",
                        unit: "m²",
                        pu: "8,00 €",
                        total: "360,00 €",
                      },
                      {
                        label: "Fourniture peinture acrylique mat — Dulux Valentine Crème Référence DV-201",
                        sub: "Peinture certifiée A+, 2 couches, couleur : Blanc Coquille",
                        qty: "45",
                        unit: "m²",
                        pu: "12,00 €",
                        total: "540,00 €",
                      },
                      {
                        label: "Pose peinture 2 couches — peinture intérieure salon",
                        sub: "Main d'œuvre pose, y compris protection sols et mobilier",
                        qty: "45",
                        unit: "m²",
                        pu: "10,00 €",
                        total: "450,00 €",
                      },
                      {
                        label: "Laquage plinthes et baguettes — finition satinée blanche",
                        sub: "Ponçage + 2 couches laque, périmètre pièce",
                        qty: "28",
                        unit: "ml",
                        pu: "6,50 €",
                        total: "182,00 €",
                      },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-gray-800 text-sm">{row.label}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{row.sub}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center text-gray-700">{row.qty}</td>
                        <td className="px-4 py-3.5 text-center text-gray-500">{row.unit}</td>
                        <td className="px-4 py-3.5 text-right text-gray-700">{row.pu}</td>
                        <td className="px-4 py-3.5 text-right font-semibold" style={{ color: "var(--navy)" }}>{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Total HT</span>
                    <span className="font-medium text-gray-800">1 532,00 €</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>TVA 10 % (rénovation logement)</span>
                    <span className="font-medium text-gray-800">153,20 €</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-200" style={{ color: "var(--navy)" }}>
                    <span>Total TTC</span>
                    <span>1 685,20 €</span>
                  </div>
                </div>
              </div>

              {/* Mentions légales */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-500">Mentions :</strong> Garantie 2 ans sur les travaux de peinture (art. L. 217-3 Code de la consommation). Peintures certifiées A+ (faibles émissions COV). Délai d&apos;exécution : 3 jours ouvrés. TVA 10 % appliquée conformément à l&apos;art. 279-0 bis du CGI — attestation client fournie. Acompte 30 % à la commande.
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">Ce devis est généré automatiquement par l&apos;IA DevisFlow en moins de 30 secondes.</p>
          </div>
        </section>

        {/* ── CTA intermédiaire ── */}
        <div className="py-8 px-4 text-center bg-white border-y border-gray-100">
          <p className="text-gray-700 font-semibold mb-3 text-sm sm:text-base">
            Prêt à créer vos devis peinture en 30 secondes ?
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center text-white font-bold px-7 py-3 rounded-xl shadow transition-all hover:opacity-90 text-sm"
            style={{ backgroundColor: "var(--orange)" }}
          >
            Commencer l&apos;essai gratuit 7 jours →
          </Link>
          <p className="mt-2 text-xs text-gray-400">Sans carte bancaire · Accès immédiat</p>
        </div>

        {/* ── Témoignage ── */}
        <section className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "var(--orange)" }}>Témoignage</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex justify-center gap-0.5 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-600 text-base leading-relaxed mb-6 italic">
                &ldquo;Avant DevisFlow, je passais deux heures à monter chaque devis sur Excel, et mes clients attendaient le lendemain. Maintenant, je photograph le chantier, je dicte les infos, et le devis est parti en 2 minutes. J&apos;ai gagné deux nouveaux clients ce mois-ci juste parce que j&apos;ai répondu en premier. La TVA à 10 % est calculée automatiquement, c&apos;est un gain de temps énorme.&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold" style={{ backgroundColor: "var(--navy)" }}>
                  R
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>Rachid A.</p>
                  <p className="text-xs text-gray-400">Peintre en bâtiment, Toulouse · Auto-entrepreneur</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SEO ── */}
        <section className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--navy)" }}>
                Questions fréquentes sur le devis peinture
              </h2>
            </div>
            <div className="space-y-2">
              {FAQS.map((faq) => (
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
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-orange-400">Devis peintre professionnel</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Créez votre premier devis peinture en 30 secondes
            </h2>
            <p className="text-blue-200 text-sm sm:text-base mb-8">
              TVA 10 % automatique · Garantie 2 ans incluse · Conforme Factur-X 2026<br />
              Rejoignez 800+ artisans qui font confiance à DevisFlow.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center text-white font-bold text-base px-10 py-4 rounded-xl shadow-xl transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Commencer mon essai gratuit →
            </Link>
            <p className="mt-4 text-xs text-blue-400">
              Essai 7 jours · Sans carte bancaire · Annulation à tout moment
            </p>
            <div className="mt-6">
              <Link href="/comparatif" className="text-xs text-blue-300 hover:text-white underline underline-offset-2 transition-colors">
                Voir le comparatif DevisFlow vs Obat, Henrri, Excel →
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── JSON-LD FAQPage ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_FAQ) }}
      />

      {/* ── Footer ── */}
      <footer className="py-10 px-4 text-center text-sm text-blue-200" style={{ backgroundColor: "var(--navy-dark)" }}>
        <p className="font-extrabold text-white text-lg mb-1">
          Devis<span style={{ color: "var(--orange)" }}>Flow</span>
        </p>
        <p className="mb-5 text-blue-300 text-sm">Le générateur de devis IA pour les artisans français</p>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-blue-400 mb-5">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link href="/devis-macon" className="hover:text-white transition-colors">Devis Maçon</Link>
          <Link href="/comparatif" className="hover:text-white transition-colors">Comparatif</Link>
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
