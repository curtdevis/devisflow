import Link from "next/link";
import type { Metadata } from "next";
import CheckoutButton from "@/app/_components/CheckoutButton";

export const metadata: Metadata = {
  title: "DevisFlow vs Obat vs Henrri — Comparatif logiciels devis artisans 2026",
  description: "Comparatif complet DevisFlow, Obat et Henrri. Quel logiciel de devis choisir pour votre artisan en 2026 ? Fonctionnalités, prix, IA, signature électronique.",
  keywords: ["logiciel devis artisan", "alternative obat", "alternative henrri", "devis plombier electricien", "comparatif devis btp"],
  alternates: { canonical: "/comparatif" },
};

const FEATURES = [
  { label: "Génération IA en 30 secondes", df: true, obat: false, henrri: false, detail: "DevisFlow utilise l'IA Claude pour générer un devis complet en moins de 30 secondes." },
  { label: "IA spécialisée BTP (8 métiers)", df: true, obat: false, henrri: false, detail: "Plomberie, électricité, peinture, maçonnerie, menuiserie, chauffage, carrelage, autre." },
  { label: "Essai gratuit sans carte bancaire", df: true, obat: false, henrri: true, detail: "7 jours d'accès complet, aucune CB requise." },
  { label: "Signature électronique client", df: true, obat: "partial", henrri: "partial", detail: "Le client signe directement depuis son téléphone via un lien de signature unique." },
  { label: "Relances automatiques configurables", df: true, obat: "partial", henrri: false, detail: "Ton (professionnel, amical, urgent), fréquence et nombre de relances configurables." },
  { label: "WhatsApp share en 1 tap", df: true, obat: false, henrri: false, detail: "Envoi du lien de devis directement via WhatsApp depuis le chantier." },
  { label: "Autocomplétion adresses françaises", df: true, obat: false, henrri: false, detail: "Intégration de l'API adresse.data.gouv.fr pour saisie rapide." },
  { label: "Lookup SIRET automatique", df: true, obat: false, henrri: false, detail: "Saisir le SIRET remplit automatiquement nom et adresse de l'entreprise." },
  { label: "Conversion devis → facture", df: true, obat: true, henrri: true, detail: "En un clic, transformez un devis signé en facture numérotée." },
  { label: "Conformité e-facture 2026", df: true, obat: true, henrri: true, detail: "Format PDF professionnel conforme aux nouvelles obligations fiscales." },
  { label: "Dashboard multi-artisans (agences)", df: true, obat: false, henrri: false, detail: "Les cabinets comptables et groupements BTP gèrent tous leurs artisans depuis un seul espace." },
  { label: "Prix mensuel", df: "29 €", obat: "49-89 €", henrri: "40-75 €", detail: "Tarifs indicatifs — vérifiez les sites officiels pour les prix à jour." },
];

function Icon({ value }: { value: boolean | "partial" | string }) {
  if (value === true) return <span className="text-emerald-500 text-lg font-bold">✓</span>;
  if (value === false) return <span className="text-red-400 text-lg">✗</span>;
  if (value === "partial") return <span className="text-amber-400 text-lg">~</span>;
  return <span className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{value}</span>;
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quelle est la meilleure alternative à Obat pour un artisan indépendant ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DevisFlow est la meilleure alternative à Obat pour les artisans indépendants : deux fois moins cher (29 €/mois vs 49-89 €), génération de devis par IA en 30 secondes, et mobile-first. Obat est plus adapté aux grandes entreprises de BTP.",
      },
    },
    {
      "@type": "Question",
      name: "DevisFlow est-il conforme à la réforme de la facturation électronique 2026 ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Tous les devis et factures générés par DevisFlow sont en format PDF structuré, conformes aux nouvelles obligations de facturation électronique 2026.",
      },
    },
    {
      "@type": "Question",
      name: "Henrri ou DevisFlow pour un électricien auto-entrepreneur ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DevisFlow. Henrri est une solution généraliste sans spécialisation BTP. DevisFlow connaît les prestations électricité (tableau électrique, VMC, borne EV…) et génère des devis adaptés en 30 secondes.",
      },
    },
  ],
};

export default function ComparatifPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold" style={{ color: "var(--navy)" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Accueil</Link>
            <CheckoutButton
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Essai gratuit →
            </CheckoutButton>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Comparatif 2026</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight" style={{ color: "var(--navy)" }}>
            DevisFlow vs Obat vs Henrri
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-6">
            Vous cherchez le meilleur logiciel de devis pour artisans en 2026 ?
            Comparaison objective des fonctionnalités, des prix et de l&apos;expérience utilisateur.
          </p>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-orange-200 text-orange-700 bg-orange-50">
            ⚡ Dernière mise à jour : avril 2026
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            {
              name: "DevisFlow",
              badge: "Recommandé",
              badgeColor: "#f97316",
              price: "29 €/mois",
              highlight: "var(--orange)",
              desc: "L'unique solution avec IA spécialisée BTP. Génération en 30 secondes, depuis le chantier, sur téléphone.",
              pros: ["IA génère le devis en 30 s", "Lookup SIRET automatique", "Autocomplétion adresses", "WhatsApp share natif", "Essai 7 jours sans CB"],
              href: "checkout",
            },
            {
              name: "Obat",
              badge: null,
              badgeColor: "",
              price: "49-89 €/mois",
              highlight: "#6b7280",
              desc: "Logiciel de gestion BTP complet. Plus orienté gestion de chantier que rapidité de devis.",
              pros: ["Gestion chantier complète", "Facturation avancée", "Conformité e-facture", "Interface desktop solide"],
              href: null,
            },
            {
              name: "Henrri",
              badge: null,
              badgeColor: "",
              price: "40-75 €/mois",
              highlight: "#6b7280",
              desc: "Solution de facturation généraliste. Pas de spécialisation BTP ni d'IA intégrée.",
              pros: ["Facturation simple", "Essai gratuit disponible", "Interface épurée", "Export comptable"],
              href: null,
            },
          ].map(tool => (
            <div
              key={tool.name}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm relative ${tool.badge ? "border-orange-300" : "border-gray-100"}`}
            >
              {tool.badge && (
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tool.badgeColor }}>
                  {tool.badge}
                </div>
              )}
              <h2 className="text-xl font-extrabold mb-1" style={{ color: "var(--navy)" }}>{tool.name}</h2>
              <p className="text-sm font-bold mb-3" style={{ color: tool.highlight }}>{tool.price}</p>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{tool.desc}</p>
              <ul className="space-y-1.5 mb-5">
                {tool.pros.map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {p}
                  </li>
                ))}
              </ul>
              {tool.href === "checkout" ? (
                <CheckoutButton
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--orange)" }}
                >
                  Essayer DevisFlow gratuitement →
                </CheckoutButton>
              ) : (
                <div className="w-full py-3 rounded-xl text-center text-sm font-semibold text-gray-400 border border-gray-100 bg-gray-50">
                  Voir le site officiel
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold mb-8 text-center" style={{ color: "var(--navy)" }}>
            Comparaison fonctionnalité par fonctionnalité
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-gray-500 font-medium w-1/2">Fonctionnalité</th>
                  <th className="px-4 py-4 text-center font-extrabold" style={{ color: "white", backgroundColor: "var(--navy)" }}>DevisFlow</th>
                  <th className="px-4 py-4 text-center text-gray-500 font-medium bg-gray-50">Obat</th>
                  <th className="px-4 py-4 text-center text-gray-500 font-medium">Henrri</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.label} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      <span>{f.label}</span>
                      <span className="block sm:hidden text-xs text-gray-400 mt-0.5">{f.detail}</span>
                      <span className="hidden sm:group-hover:block text-xs text-gray-400 mt-0.5">{f.detail}</span>
                    </td>
                    <td className="px-4 py-4 text-center" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
                      <Icon value={f.df} />
                    </td>
                    <td className="px-4 py-4 text-center bg-gray-50/50"><Icon value={f.obat} /></td>
                    <td className="px-4 py-4 text-center"><Icon value={f.henrri} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400 text-center">~ = fonctionnalité partielle ou en option payante · ✗ = non disponible</p>
        </div>

        {/* Why DevisFlow wins */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold mb-8 text-center" style={{ color: "var(--navy)" }}>
            Pourquoi DevisFlow gagne sur le terrain
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: "⚡",
                title: "30 secondes vs 20 minutes",
                desc: "Obat et Henrri demandent de remplir un formulaire ligne par ligne. Avec DevisFlow, vous décrivez le chantier en langage naturel et l'IA génère tout : lignes, calculs TVA, mentions légales.",
              },
              {
                icon: "📱",
                title: "Conçu pour le téléphone",
                desc: "73% des artisans créent leurs devis depuis leur téléphone sur le chantier. DevisFlow est mobile-first. Obat et Henrri sont pensés pour le bureau.",
              },
              {
                icon: "🧠",
                title: "IA qui connaît votre métier",
                desc: "L'IA de DevisFlow est entraînée sur les métiers du BTP : prix du marché, unités de mesure, prestations types. Pas une IA générique.",
              },
              {
                icon: "💶",
                title: "Deux fois moins cher",
                desc: "DevisFlow à 29 €/mois vs Obat entre 49 et 89 €/mois. Pour un artisan indépendant, la différence représente 240 à 720 € d'économies par an.",
              },
            ].map(p => (
              <div key={p.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-extrabold text-base mb-2" style={{ color: "var(--navy)" }}>{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ SEO */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold mb-8 text-center" style={{ color: "var(--navy)" }}>Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Quelle est la meilleure alternative à Obat pour un artisan indépendant ?",
                a: "DevisFlow est la meilleure alternative à Obat pour les artisans indépendants : deux fois moins cher (29 €/mois vs 49-89 €), génération de devis par IA en 30 secondes, et mobile-first. Obat est plus adapté aux grandes entreprises de BTP qui ont besoin d'une gestion de chantier complète.",
              },
              {
                q: "DevisFlow est-il conforme à la réforme de la facturation électronique 2026 ?",
                a: "Oui. Tous les devis et factures générés par DevisFlow sont en format PDF structuré, conformes aux nouvelles obligations de facturation électronique entrées en vigueur progressivement à partir de 2026.",
              },
              {
                q: "Puis-je migrer mes données depuis Obat ou Henrri vers DevisFlow ?",
                a: "L'import automatique n'est pas encore disponible, mais la migration est simple : vos informations d'entreprise (SIRET, adresse) se remplissent automatiquement grâce au lookup SIRET de DevisFlow. Vos clients peuvent être réimportés manuellement en quelques minutes.",
              },
              {
                q: "Henrri ou DevisFlow pour un électricien auto-entrepreneur ?",
                a: "DevisFlow. Henrri est une solution de facturation généraliste sans spécialisation BTP. DevisFlow connaît les prestations spécifiques à l'électricité (tableau électrique, VMC, borne EV…) et génère des devis complets adaptés à votre métier en 30 secondes.",
              },
            ].map(faq => (
              <details key={faq.q} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                <summary className="px-6 py-4 font-semibold text-sm cursor-pointer list-none flex items-center justify-between" style={{ color: "var(--navy)" }}>
                  {faq.q}
                  <span className="text-gray-400 ml-4 shrink-0 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="rounded-2xl p-10 text-center text-white" style={{ backgroundColor: "var(--navy)" }}>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Prêt à passer à DevisFlow ?</h2>
          <p className="text-blue-200 mb-7 max-w-md mx-auto">7 jours gratuits, sans carte bancaire. Votre premier devis IA en 30 secondes.</p>
          <CheckoutButton
            className="inline-flex items-center gap-2 font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--orange)", color: "white" }}
          >
            Essayer gratuitement — 7 jours →
          </CheckoutButton>
          <p className="mt-4 text-xs text-blue-300">Sans engagement · Annulation en 1 clic</p>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© 2026 DevisFlow — Nathan Makambo · SIRET 920 513 330 00018</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-gray-700 transition-colors">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-gray-700 transition-colors">CGU</Link>
            <Link href="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
