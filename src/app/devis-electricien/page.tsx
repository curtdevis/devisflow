import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Générateur Devis Électricien Gratuit — DevisFlow IA",
  description:
    "Créez un devis électricien professionnel en 30 secondes avec l'IA. Qualifications Qualifelec/RGE, TVA 10%, Factur-X 2026. Essai gratuit 7 jours sans carte.",
  alternates: { canonical: "/devis-electricien" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Un devis électricien est-il obligatoire ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, dès 150 € TTC de travaux, l'électricien doit remettre un devis détaillé avant intervention. Le devis doit mentionner le numéro SIRET, les qualifications professionnelles (Qualifelec, RGE le cas échéant), le détail des prestations, le taux de TVA applicable et la durée de validité. Un devis signé par le client constitue un bon de commande légalement contraignant.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle TVA pour des travaux d'électricité ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le taux de TVA applicable aux travaux d'électricité dépend de la nature du logement : 10% pour la rénovation de logements d'habitation achevés depuis plus de 2 ans, 5,5% pour les travaux d'amélioration de la performance énergétique (pompe à chaleur, isolation, borne de recharge EV éligible CEE), 20% pour les constructions neuves et les locaux professionnels. DevisFlow applique le bon taux automatiquement.",
      },
    },
    {
      "@type": "Question",
      name: "Faut-il mentionner le Consuel sur un devis électricien ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Il est fortement recommandé de mentionner le Consuel (Comité National pour la Sécurité des Usagers de l'Électricité) sur le devis dès lors que les travaux nécessitent une attestation de conformité : nouvelle installation électrique, remise en conformité complète, raccordement au réseau. Le coût de l'attestation Consuel (environ 150-300 €) doit figurer en ligne séparée sur le devis. DevisFlow intègre ce poste automatiquement quand nécessaire.",
      },
    },
  ],
};

const DEVIS_LINES = [
  { desc: "Remplacement tableau électrique 13 modules", unit: "forfait", qty: 1, pu: 650, tva: 10 },
  { desc: "Fourniture tableau Schneider 13 modules avec disjoncteurs", unit: "u", qty: 1, pu: 280, tva: 20 },
  { desc: "Installation 4 prises électriques 16A (pose + câblage)", unit: "u", qty: 4, pu: 55, tva: 10 },
  { desc: "Attestation de conformité Consuel", unit: "forfait", qty: 1, pu: 180, tva: 20 },
  { desc: "Main d'œuvre (4h × 50 €/h)", unit: "h", qty: 4, pu: 50, tva: 10 },
];

export default function DevisElectricienPage() {
  const totalHT = DEVIS_LINES.reduce((acc, l) => acc + l.qty * l.pu, 0);
  const totalTVA = DEVIS_LINES.reduce((acc, l) => acc + l.qty * l.pu * (l.tva / 100), 0);
  const totalTTC = totalHT + totalTVA;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight" style={{ color: "#1e3a5f" }}>
            Devis<span style={{ color: "#f97316" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:inline">
              ← Accueil
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#f97316" }}
            >
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ backgroundColor: "#1e3a5f" }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "#f97316" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Générateur devis électricien · IA spécialisée BTP
            </div>

            {/* H1 */}
            <h1
              className="text-white mb-5 font-extrabold"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.2rem)", lineHeight: 1.12, letterSpacing: "-0.02em" }}
            >
              Devis électricien professionnel{" "}
              <span style={{ color: "#f97316" }}>en 30 secondes</span>
            </h1>

            <p className="text-blue-200 leading-relaxed mb-8 max-w-xl" style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}>
              Générez votre devis électricité gratuitement avec l&apos;IA — TVA 10% ou 5,5% selon les travaux,
              qualifications Qualifelec et RGE intégrées, Consuel mentionné automatiquement. Conforme Factur-X 2026,
              envoi et signature depuis le chantier.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center font-bold text-white px-7 py-3.5 rounded-xl shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-95"
                style={{ backgroundColor: "#f97316", fontSize: "1rem" }}
              >
                Essayer gratuitement — 7 jours →
              </Link>
              <Link
                href="/comparatif"
                className="inline-flex items-center justify-center font-semibold text-white px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm"
              >
                Voir le comparatif
              </Link>
            </div>
            <p className="mt-4 text-sm text-blue-300/80">Sans carte bancaire · Annulation à tout moment</p>
          </div>
        </section>

        {/* ── Spécificités électricien ── */}
        <section className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
                Conçu pour les électriciens
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: "#1e3a5f" }}>
                DevisFlow connaît vos spécificités métier
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
                Qualifications, TVA réglementée, Consuel — tout est géré automatiquement.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  accent: "#f97316",
                  bg: "rgba(249,115,22,0.07)",
                  icon: "🏆",
                  title: "Qualifications Qualifelec & RGE",
                  desc: "DevisFlow intègre automatiquement vos mentions de qualification : Qualifelec pour les travaux courants forts et faibles, label RGE (Reconnu Garant de l'Environnement) pour les travaux d'efficacité énergétique éligibles aux aides CEE et MaPrimeRénov'. Ces mentions sont obligatoires pour que vos clients bénéficient des aides de l'État.",
                },
                {
                  accent: "#3b82f6",
                  bg: "rgba(59,130,246,0.07)",
                  icon: "📊",
                  title: "TVA 10% rénovation · 20% neuf",
                  desc: "La TVA sur les travaux d'électricité est de 10% pour la rénovation de logements de plus de 2 ans, 5,5% pour les travaux de performance énergétique (borne de recharge, isolation thermique), et 20% pour les constructions neuves et locaux commerciaux. DevisFlow applique le bon taux par ligne, conformément à l'article 279-0 bis CGI.",
                },
                {
                  accent: "#10b981",
                  bg: "rgba(16,185,129,0.07)",
                  icon: "⚡",
                  title: "Postes types électricité",
                  desc: "Tableau électrique (remplacement, mise aux normes), installation prises et interrupteurs, mise aux normes NFC 15-100, installation VMC, éclairage LED, borne de recharge véhicule électrique, domotique… Les postes courants sont suggérés avec unités et prix marché pour l'Île-de-France et la province.",
                },
                {
                  accent: "#8b5cf6",
                  bg: "rgba(139,92,246,0.07)",
                  icon: "📋",
                  title: "Attestation Consuel sur le devis",
                  desc: "Le Consuel (attestation de conformité obligatoire avant mise en service) doit figurer en ligne séparée sur votre devis dès que l'installation nécessite une déclaration de travaux. DevisFlow vous propose de l'ajouter automatiquement et le facture en ligne distincte (coût indicatif : 150–300 €) selon les normes en vigueur.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white"
                >
                  <div className="h-[3px]" style={{ backgroundColor: card.accent }} />
                  <div className="p-6">
                    <div className="text-2xl mb-3">{card.icon}</div>
                    <h3 className="text-base font-extrabold mb-2" style={{ color: "#1e3a5f" }}>
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
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
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
                Aperçu
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#1e3a5f" }}>
                À quoi ressemble un devis électricien DevisFlow ?
              </h2>
            </div>

            {/* Carte devis */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* En-tête */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                <div>
                  <p className="font-extrabold text-lg" style={{ color: "#1e3a5f" }}>
                    DEVIS N° 2026-117
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Émis le 18/04/2026 · Valable 3 mois</p>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: "#f97316" }}
                >
                  Devis électricité
                </span>
              </div>

              {/* Parties */}
              <div className="grid sm:grid-cols-2 gap-4 px-6 py-4 bg-gray-50 text-sm border-b border-gray-100">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Artisan</p>
                  <p className="font-semibold" style={{ color: "#1e3a5f" }}>Élec Pro Girard</p>
                  <p className="text-gray-500">SIRET 734 218 990 00041</p>
                  <p className="text-gray-500">Qualifelec E2 · Label RGE</p>
                  <p className="text-gray-500">RC Pro : Allianz n° E8765432</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Client</p>
                  <p className="font-semibold" style={{ color: "#1e3a5f" }}>M. Lefebvre Thomas</p>
                  <p className="text-gray-500">8 allée des Pins, 33000 Bordeaux</p>
                  <p className="text-gray-500">Appartement construit en 2005</p>
                </div>
              </div>

              {/* Lignes */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                      <th className="px-6 py-3 text-left font-medium">Désignation</th>
                      <th className="px-3 py-3 text-center font-medium">Qté</th>
                      <th className="px-3 py-3 text-right font-medium">P.U. HT</th>
                      <th className="px-3 py-3 text-center font-medium">TVA</th>
                      <th className="px-3 py-3 text-right font-medium pr-6">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEVIS_LINES.map((line, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5 text-gray-700 font-medium">{line.desc}</td>
                        <td className="px-3 py-3.5 text-center text-gray-500">{line.qty} {line.unit}</td>
                        <td className="px-3 py-3.5 text-right text-gray-600">{line.pu.toFixed(2)} €</td>
                        <td className="px-3 py-3.5 text-center">
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: line.tva === 10 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                              color: line.tva === 10 ? "#059669" : "#dc2626",
                            }}
                          >
                            {line.tva}%
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right font-semibold pr-6" style={{ color: "#1e3a5f" }}>
                          {(line.qty * line.pu).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="px-6 py-5 border-t border-gray-100 flex justify-end">
                <div className="space-y-1.5 text-sm min-w-[200px]">
                  <div className="flex justify-between gap-8 text-gray-500">
                    <span>Total HT</span>
                    <span className="font-semibold text-gray-700">{totalHT.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between gap-8 text-gray-500">
                    <span>TVA (10% + 20%)</span>
                    <span className="font-semibold text-gray-700">{totalTVA.toFixed(2)} €</span>
                  </div>
                  <div
                    className="flex justify-between gap-8 font-extrabold text-base pt-2 border-t border-gray-100"
                    style={{ color: "#1e3a5f" }}
                  >
                    <span>Total TTC</span>
                    <span style={{ color: "#f97316" }}>{totalTTC.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Footer devis */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                Devis généré par DevisFlow IA · Qualifelec E2 · Signature électronique valide (loi n°2000-230) · Conforme Factur-X 2026
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center font-bold text-white px-7 py-3.5 rounded-xl shadow-lg transition-all hover:opacity-90 text-sm"
                style={{ backgroundColor: "#f97316" }}
              >
                Créer mon devis électricien gratuitement →
              </Link>
              <p className="mt-2 text-xs text-gray-400">Généré par l&apos;IA en 30 secondes · Sans installation</p>
            </div>
          </div>
        </section>

        {/* ── Témoignage ── */}
        <section className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
                Témoignage
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#1e3a5f" }}>
                Une électricienne qui gagne des chantiers
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-600 text-base leading-relaxed mb-6 italic">
                &ldquo;Je suis électricienne RGE et mes devis devaient absolument mentionner mes qualifications pour
                que mes clients puissent obtenir les aides de l&apos;État. Avant, je copiais-collais tout à la main.
                Maintenant DevisFlow place automatiquement mon numéro Qualifelec et la mention RGE sur chaque devis.
                En plus, la TVA à 10% est calculée correctement selon le type de logement — mes clients ne me
                posent plus de questions. J&apos;ai gagné au moins 6 heures par mois.&rdquo;
              </blockquote>
              <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold shrink-0"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  A
                </div>
                <div>
                  <p className="font-bold" style={{ color: "#1e3a5f" }}>Amandine R.</p>
                  <p className="text-sm text-gray-400">Électricienne RGE indépendante · Toulouse, Haute-Garonne</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
                FAQ
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#1e3a5f" }}>
                Questions fréquentes — devis électricité
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Un devis électricien est-il obligatoire ?",
                  a: "Oui, dès 150 € TTC de travaux, l'électricien doit remettre un devis détaillé avant intervention. Le devis doit mentionner le numéro SIRET, les qualifications professionnelles (Qualifelec, RGE le cas échéant), le détail des prestations, le taux de TVA applicable et la durée de validité. Un devis signé par le client constitue un bon de commande légalement contraignant.",
                },
                {
                  q: "Quelle TVA pour des travaux d'électricité ?",
                  a: "Le taux de TVA applicable aux travaux d'électricité dépend de la nature du logement : 10% pour la rénovation de logements d'habitation achevés depuis plus de 2 ans, 5,5% pour les travaux d'amélioration de la performance énergétique (pompe à chaleur, isolation, borne de recharge EV éligible CEE), 20% pour les constructions neuves et les locaux professionnels. DevisFlow applique le bon taux automatiquement.",
                },
                {
                  q: "Faut-il mentionner le Consuel sur un devis électricien ?",
                  a: "Il est fortement recommandé de mentionner le Consuel (Comité National pour la Sécurité des Usagers de l'Électricité) sur le devis dès lors que les travaux nécessitent une attestation de conformité : nouvelle installation électrique, remise en conformité complète, raccordement au réseau. Le coût de l'attestation Consuel (environ 150-300 €) doit figurer en ligne séparée sur le devis. DevisFlow intègre ce poste automatiquement quand nécessaire.",
                },
              ].map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 font-semibold text-gray-800 list-none text-sm">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform shrink-0 text-xl font-light leading-none">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-4 text-gray-500 leading-relaxed text-sm">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section
          className="py-20 px-4 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e3a8a 100%)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(249,115,22,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>
              Générateur devis électricien gratuit
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Créez votre premier devis électricien en 30 secondes
            </h2>
            <p className="text-blue-200 text-sm sm:text-base mb-8">
              Qualifelec & RGE intégrés · TVA 10% automatique · Consuel inclus · Conforme Factur-X 2026
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center font-bold text-base text-white px-10 py-4 rounded-xl shadow-xl transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#f97316" }}
            >
              Essayer gratuitement — 7 jours →
            </Link>
            <p className="mt-4 text-xs text-blue-400">Sans carte bancaire · Annulation à tout moment</p>
            <p className="mt-3 text-xs text-blue-400/70">
              Voir aussi :{" "}
              <Link href="/comparatif" className="underline hover:text-blue-200 transition-colors">
                Comparatif logiciels devis artisans
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-10 px-4 text-center text-sm text-blue-200" style={{ backgroundColor: "#0f172a" }}>
        <p className="font-extrabold text-white text-lg mb-1">
          Devis<span style={{ color: "#f97316" }}>Flow</span>
        </p>
        <p className="mb-5 text-blue-300 text-sm">
          Le générateur de devis électricien IA pour artisans français
        </p>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-blue-400 mb-5">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link href="/comparatif" className="hover:text-white transition-colors">Comparatif</Link>
          <Link href="/devis-plombier" className="hover:text-white transition-colors">Devis plombier</Link>
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-xs text-blue-500">© {new Date().getFullYear()} DevisFlow — Tous droits réservés</p>
      </footer>
    </div>
  );
}
