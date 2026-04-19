import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/app/_components/CheckoutButton";

export const metadata: Metadata = {
  title: "DevisFlow Entrepreneur — Devis IA pour l'événementiel et les prestations de service",
  description:
    "Créez des devis professionnels en 30 secondes pour traiteurs, décorateurs, animateurs, photographes et wedding planners. IA, conformité légale, signature électronique.",
  alternates: { canonical: "https://devis-flow.fr/entrepreneur" },
  openGraph: {
    title: "DevisFlow Entrepreneur — Devis IA pour l'événementiel",
    description:
      "Devis automatisés pour prestataires événementiels. Traiteur, DJ, décoration, photo, mariage. Essai 7 jours sans carte bancaire.",
    url: "https://devis-flow.fr/entrepreneur",
  },
};

const metiers = [
  { icon: "🍽️", label: "Traiteur", href: "/devis-traiteur" },
  { icon: "💐", label: "Décorateur événementiel", href: "/devis-decorateur-evenementiel" },
  { icon: "🎤", label: "Animateur / DJ", href: "/devis-dj-animateur" },
  { icon: "💒", label: "Wedding Planner", href: "/devis-wedding-planner" },
  { icon: "📸", label: "Photographe", href: "/devis-photographe" },
  { icon: "🎪", label: "Location de matériel", href: "/devis-location-evenementiel" },
];

const avantages = [
  {
    icon: "⚡",
    title: "Devis en 30 secondes",
    desc: "Décrivez votre prestation en langage naturel, l'IA génère un devis complet et professionnel instantanément.",
  },
  {
    icon: "✍️",
    title: "Signature électronique incluse",
    desc: "Vos clients signent directement depuis leur téléphone. Vous recevez une confirmation immédiate par email.",
  },
  {
    icon: "📊",
    title: "Suivi de vos devis",
    desc: "Tableau de bord clair : devis en attente, signés, expirés. Relances automatiques J+3 et J+7.",
  },
  {
    icon: "🧾",
    title: "Conformité légale garantie",
    desc: "TVA, mentions légales, numérotation automatique. Vos devis respectent le droit français.",
  },
];

const testimonials = [
  {
    name: "Isabelle R.",
    job: "Traiteur mariage, Lyon",
    text: "Avant, je passais 45 minutes par devis. Maintenant c'est 2 minutes. Mes clients adorent le rendu professionnel.",
    stars: 5,
  },
  {
    name: "Kevin M.",
    job: "DJ & animateur, Bordeaux",
    text: "Je travaille depuis mon téléphone entre deux événements. DevisFlow Entrepreneur est fait pour ça.",
    stars: 5,
  },
  {
    name: "Sophie L.",
    job: "Wedding planner, Paris",
    text: "La signature électronique a changé ma vie. Plus besoin d'imprimer, de scanner, de renvoyer. Tout se fait en ligne.",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Est-ce adapté aux prestations de service (pas au BTP) ?",
    a: "Oui. DevisFlow Entrepreneur est conçu pour les prestations événementielles : traiteur, DJ, décoration, photo, coordination. L'IA comprend vos types de prestations et génère des libellés adaptés.",
  },
  {
    q: "Puis-je personnaliser mon devis avec mon logo et mes couleurs ?",
    a: "Oui, vous pouvez ajouter votre logo, personnaliser l'en-tête et ajouter vos mentions légales spécifiques (numéro d'assurance, certifications, etc.).",
  },
  {
    q: "Combien coûte DevisFlow Entrepreneur ?",
    a: "29€/mois avec 7 jours d'essai gratuit, sans carte bancaire. Annulez à tout moment.",
  },
  {
    q: "Puis-je envoyer le devis directement par email ou WhatsApp ?",
    a: "Oui. Depuis l'application, envoyez le devis par email avec un lien de signature intégré, ou partagez le lien via WhatsApp.",
  },
  {
    q: "Est-ce que la signature électronique est légalement valable ?",
    a: "Oui. La signature électronique simple est reconnue légalement en France (article 1366 du Code civil) pour les devis commerciaux.",
  },
];

export default function EntrepreneurPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DevisFlow Entrepreneur",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "29",
      priceCurrency: "EUR",
      priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
    },
    description:
      "Logiciel de devis IA pour prestataires événementiels : traiteurs, décorateurs, DJs, wedding planners et photographes.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
              Pour les artisans BTP →
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
            DevisFlow Entrepreneur
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            Le devis IA pour les{" "}
            <span style={{ color: "var(--orange)" }}>prestataires événementiels</span>
          </h1>

          <p style={{ fontSize: 18, color: "#93c5fd", lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Traiteur, DJ, décorateur, wedding planner, photographe — créez des devis professionnels en
            30 secondes, faites-les signer en ligne et encaissez plus vite.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <CheckoutButton
              style={{
                backgroundColor: "var(--orange)",
                color: "white",
                fontWeight: 700,
                fontSize: 16,
                padding: "16px 36px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
              Essayer gratuitement 7 jours →
            </CheckoutButton>
            <Link
              href="/auth/login"
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
              Déjà un compte
            </Link>
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: "#64748b" }}>
            Sans carte bancaire · Sans engagement · Annulation à tout moment
          </p>
        </section>

        {/* Métiers */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
          <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 24 }}>
            Fait pour votre métier
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {metiers.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "20px 12px",
                  textAlign: "center",
                  textDecoration: "none",
                  color: "white",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Avantages */}
        <section style={{ background: "rgba(255,255,255,0.03)", padding: "64px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
              Tout ce dont vous avez besoin
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
              {avantages.map((a) => (
                <div
                  key={a.title}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    padding: 28,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ fontSize: 14, color: "#93c5fd", lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
            Ils ont adopté DevisFlow Entrepreneur
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {testimonials.map((t) => (
              <div
                key={t.name}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 28,
                }}
              >
                <div style={{ color: "var(--orange)", fontSize: 18, marginBottom: 12 }}>
                  {"★".repeat(t.stars)}
                </div>
                <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.7, margin: "0 0 16px" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{t.job}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ background: "rgba(255,255,255,0.03)", padding: "64px 24px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Un prix simple</h2>
            <p style={{ color: "#93c5fd", fontSize: 16, marginBottom: 36 }}>
              Tout inclus. Sans surprise.
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "2px solid var(--orange)",
                borderRadius: 20,
                padding: "40px 36px",
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 4 }}>
                29€<span style={{ fontSize: 18, fontWeight: 400, color: "#93c5fd" }}>/mois</span>
              </div>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
                7 jours gratuits · Sans carte bancaire
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", textAlign: "left" }}>
                {[
                  "Devis illimités",
                  "Signature électronique incluse",
                  "Envoi par email & WhatsApp",
                  "Relances automatiques",
                  "Export PDF & Factur-X",
                  "Support prioritaire",
                ].map((item) => (
                  <li key={item} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, fontSize: 14 }}>
                    <span style={{ color: "var(--orange)", fontWeight: 700 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                style={{
                  width: "100%",
                  backgroundColor: "var(--orange)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "14px 0",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Commencer l&apos;essai gratuit →
              </CheckoutButton>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
            Questions fréquentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqs.map((f) => (
              <div
                key={f.q}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.q}</h3>
                <p style={{ fontSize: 14, color: "#93c5fd", lineHeight: 1.6, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section style={{ textAlign: "center", padding: "64px 24px 80px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
            Prêt à professionnaliser vos devis ?
          </h2>
          <p style={{ color: "#93c5fd", marginBottom: 32 }}>
            Rejoignez les prestataires événementiels qui gagnent du temps chaque semaine.
          </p>
          <CheckoutButton
            style={{
              backgroundColor: "var(--orange)",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              padding: "16px 40px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
            }}
          >
            Essayer gratuitement 7 jours →
          </CheckoutButton>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
            Sans carte bancaire · Annulation à tout moment
          </p>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "28px 24px",
            textAlign: "center",
            fontSize: 13,
            color: "#475569",
          }}
        >
          <p style={{ margin: 0 }}>
            © 2026 DevisFlow — <Link href="/cgu" style={{ color: "#475569" }}>CGU</Link> ·{" "}
            <Link href="/confidentialite" style={{ color: "#475569" }}>Confidentialité</Link> ·{" "}
            <Link href="/mentions-legales" style={{ color: "#475569" }}>Mentions légales</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
