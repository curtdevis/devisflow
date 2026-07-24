import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Logiciel Devis Multi-Clients — Cabinets Comptables & Groupements | DevisFlow",
  description:
    "Gérez les devis de tous vos artisans depuis un seul espace : portefeuille multi-clients, génération IA, rapports consolidés, export comptable. Pour cabinets d'experts-comptables et groupements d'artisans.",
  alternates: { canonical: "/cabinets-experts-comptables" },
  openGraph: {
    title: "Logiciel Devis Multi-Clients — Cabinets Comptables & Groupements",
    description:
      "Un espace agence pour gérer les devis de tous vos artisans clients : invitations, suivi consolidé, rapports exportables.",
    url: "https://devis-flow.fr/cabinets-experts-comptables",
  },
};

const fonctionnalites = [
  {
    icon: "👷",
    title: "Portefeuille d'artisans",
    desc: "Invitez vos artisans clients par email en un clic. Chacun garde son propre espace, vous gardez la vue d'ensemble.",
  },
  {
    icon: "📋",
    title: "Tous les devis, un seul endroit",
    desc: "Consultez, filtrez et suivez les devis de tous vos artisans depuis un tableau de bord consolidé.",
  },
  {
    icon: "📊",
    title: "Rapports exportables",
    desc: "Rapports mensuels par artisan et par période, exportables en PDF pour vos clients ou votre reporting interne.",
  },
  {
    icon: "💳",
    title: "Facturation centralisée",
    desc: "Un seul abonnement, une seule facture pour l'ensemble de votre portefeuille d'artisans.",
  },
  {
    icon: "⚡",
    title: "Génération IA en 30 secondes",
    desc: "Vos artisans génèrent des devis professionnels conformes en 30 secondes, depuis leur téléphone, sur le chantier.",
  },
  {
    icon: "🧾",
    title: "Conforme facturation électronique 2026",
    desc: "Devis au format structuré, prêts pour la bascule Factur-X — un point de moins à gérer pour vos clients avant la deadline.",
  },
];

const faqs = [
  {
    q: "C'est pour qui, exactement ?",
    a: "Les cabinets d'experts-comptables qui accompagnent des artisans, et les groupements ou fédérations d'artisans qui veulent professionnaliser et centraliser la gestion des devis de leurs membres.",
  },
  {
    q: "Combien d'artisans puis-je gérer ?",
    a: "Le plan Cabinet & Groupement s'adapte à la taille de votre portefeuille, de quelques artisans à plusieurs dizaines. Contactez-nous pour un tarif adapté à votre volume.",
  },
  {
    q: "Est-ce que chaque artisan a son propre espace ?",
    a: "Oui. Chaque artisan invité dispose de son propre compte pour générer ses devis ; vous conservez une vue consolidée en tant qu'administrateur du portefeuille.",
  },
  {
    q: "Combien ça coûte ?",
    a: "À partir de 299€/mois. Le tarif exact dépend du nombre d'artisans gérés — contactez-nous pour un devis personnalisé.",
  },
  {
    q: "Comment démarrer ?",
    a: "Créez votre espace agence, puis invitez vos premiers artisans par email depuis l'onglet Invitations. Ils reçoivent un lien pour rejoindre votre portefeuille en quelques secondes.",
  },
];

export default function CabinetsExpertsComptablesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DevisFlow Cabinet & Groupement",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "299",
      priceCurrency: "EUR",
      priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
    },
    description:
      "Logiciel de gestion de devis multi-clients pour cabinets d'experts-comptables et groupements d'artisans.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div style={{ backgroundColor: "var(--navy)", color: "white", minHeight: "100vh" }}>
        {/* Nav */}
        <nav
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <Link href="/" style={{ fontWeight: 800, fontSize: 20, color: "white", textDecoration: "none" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/" style={{ color: "#93c5fd", fontSize: 14, textDecoration: "none" }}>
              Pour un artisan seul →
            </Link>
            <Link
              href="/auth/login"
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "8px 18px",
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              Connexion
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px 48px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.4)",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--orange)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            Cabinets & Groupements
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 20 }}>
            Le devis IA multi-clients pour{" "}
            <span style={{ color: "var(--orange)" }}>cabinets comptables et groupements d&apos;artisans</span>
          </h1>

          <p style={{ fontSize: 18, color: "#93c5fd", lineHeight: 1.7, marginBottom: 40, maxWidth: 620, margin: "0 auto 40px" }}>
            Gérez les devis de tous vos artisans clients depuis un seul espace : invitations, suivi
            consolidé, rapports exportables et facturation centralisée.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/auth/register?type=agence"
              style={{
                backgroundColor: "var(--orange)",
                color: "white",
                fontWeight: 700,
                fontSize: 16,
                padding: "16px 36px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Créer mon espace agence →
            </Link>
            <Link
              href="/contact"
              style={{
                color: "white",
                fontWeight: 600,
                fontSize: 16,
                padding: "16px 28px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.25)",
                textDecoration: "none",
              }}
            >
              Demander un devis
            </Link>
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: "#64748b" }}>
            À partir de 299€/mois · Tarif adapté au nombre d&apos;artisans gérés
          </p>
        </section>

        {/* Fonctionnalités */}
        <section style={{ background: "rgba(255,255,255,0.03)", padding: "64px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
              Un espace pensé pour la gestion multi-artisans
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
              {fonctionnalites.map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    padding: 28,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#93c5fd", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 40 }}>
            Comment ça marche
          </h2>
          <div style={{ display: "grid", gap: 20 }}>
            {[
              { n: "1", t: "Créez votre espace agence", d: "Inscription en tant que cabinet ou groupement, en 30 secondes." },
              { n: "2", t: "Invitez vos artisans", d: "Envoyez une invitation par email depuis l'onglet Invitations — ils rejoignent votre portefeuille en un clic." },
              { n: "3", t: "Suivez et exportez", d: "Consultez tous les devis générés par vos artisans, exportez vos rapports mensuels en PDF." },
            ].map((s) => (
              <div key={s.n} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "var(--orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{s.t}</p>
                  <p style={{ color: "#93c5fd", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: "rgba(255,255,255,0.03)", padding: "64px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 40 }}>
              Questions fréquentes
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              {faqs.map((f) => (
                <details
                  key={f.q}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                >
                  <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 15 }}>{f.q}</summary>
                  <p style={{ marginTop: 10, color: "#93c5fd", fontSize: 14, lineHeight: 1.6 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section style={{ maxWidth: 700, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>
            Centralisez la gestion des devis de vos artisans
          </h2>
          <p style={{ color: "#93c5fd", marginBottom: 32 }}>
            Créez votre espace agence gratuitement, invitez vos premiers artisans en quelques minutes.
          </p>
          <Link
            href="/auth/register?type=agence"
            style={{
              backgroundColor: "var(--orange)",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              padding: "16px 36px",
              borderRadius: 12,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Créer mon espace agence →
          </Link>
        </section>
      </div>
    </>
  );
}
