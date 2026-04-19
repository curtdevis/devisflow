import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/app/_components/CheckoutButton";

export const metadata: Metadata = {
  title: "Devis DJ & Animateur — Modèle IA professionnel | DevisFlow",
  description:
    "Créez un devis DJ ou animateur en 30 secondes. Mariage, soirée privée, événement d'entreprise — son, lumière, animation inclus. Signature électronique intégrée.",
  alternates: { canonical: "https://devis-flow.fr/devis-dj-animateur" },
};

const faqs = [
  {
    q: "Que doit contenir un devis DJ pour un mariage ?",
    a: "Un devis DJ mariage doit détailler : durée de la prestation (installation, concert/mix, démontage), matériel fourni (sono, éclairage, micro), nombre d'heures, déplacements, et toute option supplémentaire (karaoké, animation dansante, photobooth). DevisFlow structure tout automatiquement.",
  },
  {
    q: "Un DJ indépendant est-il soumis à la TVA ?",
    a: "Si vous êtes auto-entrepreneur sous le seuil de franchise (36 800 €/an), vous facturez sans TVA. Au-delà, la TVA s'applique à 20%. DevisFlow gère les deux régimes et ajoute la mention légale correcte.",
  },
  {
    q: "Comment protéger un acompte dans mon devis DJ ?",
    a: "Ajoutez une note dans votre devis précisant les conditions d'acompte (généralement 30% à la signature) et les conditions d'annulation. DevisFlow vous permet d'ajouter des clauses personnalisées à chaque devis.",
  },
  {
    q: "Puis-je créer plusieurs options de forfaits dans un seul devis ?",
    a: "Oui. Vous pouvez créer plusieurs lignes correspondant à différents forfaits (Essentiel, Prestige, Premium) et laisser votre client choisir. La signature électronique intégrée confirme la prestation retenue.",
  },
];

export default function DevisDjAnimateurPage() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div style={{ backgroundColor: "var(--navy)", color: "white", minHeight: "100vh" }}>
        <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <Link href="/entrepreneur" style={{ fontWeight: 800, fontSize: 20, color: "white", textDecoration: "none" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <Link href="/auth/register" style={{ background: "var(--orange)", color: "white", fontWeight: 700, fontSize: 14, padding: "10px 20px", borderRadius: 10, textDecoration: "none" }}>
            Essai gratuit →
          </Link>
        </nav>

        <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 48px" }}>
          <div style={{ display: "inline-block", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.4)", borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "var(--orange)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 20 }}>
            🎤 DJ & Animateur
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            Devis DJ & animateur<br />
            <span style={{ color: "var(--orange)" }}>généré par IA en 30 secondes</span>
          </h1>
          <p style={{ fontSize: 17, color: "#93c5fd", lineHeight: 1.7, marginBottom: 36 }}>
            Mariage, soirée privée, événement d'entreprise, anniversaire — décrivez votre prestation son & lumière et obtenez un devis professionnel à faire signer immédiatement.
          </p>
          <CheckoutButton style={{ backgroundColor: "var(--orange)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 32px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            Créer mon devis DJ →
          </CheckoutButton>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>Sans carte bancaire · 7 jours gratuits</p>
        </section>

        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 64px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Questions fréquentes — Devis DJ & animateur</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqs.map((f) => (
              <div key={f.q} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.q}</h3>
                <p style={{ fontSize: 14, color: "#93c5fd", lineHeight: 1.6, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: "center", padding: "0 24px 80px" }}>
          <CheckoutButton style={{ backgroundColor: "var(--orange)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 36px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            Commencer gratuitement →
          </CheckoutButton>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>Sans carte bancaire · 7 jours gratuits</p>
        </section>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px", textAlign: "center", fontSize: 13, color: "#475569" }}>
          <p style={{ margin: 0 }}>© 2026 DevisFlow · <Link href="/entrepreneur" style={{ color: "#475569" }}>Section Entrepreneur</Link></p>
        </footer>
      </div>
    </>
  );
}
