import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/app/_components/CheckoutButton";

export const metadata: Metadata = {
  title: "Devis Photographe en ligne — Modèle IA gratuit | DevisFlow",
  description:
    "Créez un devis photographe professionnel en 30 secondes. Mariage, portrait, reportage, shooting corporate — conforme au droit français, signature électronique incluse.",
  alternates: { canonical: "https://devis-flow.fr/devis-photographe" },
};

const faqs = [
  {
    q: "Quelles mentions obligatoires dans un devis photographe ?",
    a: "Un devis photographe doit mentionner : coordonnées du photographe (SIRET), description détaillée de la prestation (lieu, durée, nombre de photos livrées, délai de remise), droits cédés ou non, prix HT, TVA et total TTC. DevisFlow les intègre automatiquement.",
  },
  {
    q: "Un photographe doit-il facturer la TVA ?",
    a: "Si votre CA annuel dépasse le seuil de franchise en base (36 800 € pour les prestations de service en 2025), vous êtes assujetti à la TVA au taux de 20%. En dessous, vous facturez sans TVA avec la mention légale appropriée. DevisFlow gère les deux cas.",
  },
  {
    q: "Comment protéger mes droits d'auteur dans un devis ?",
    a: "Vous pouvez préciser dans le devis les droits cédés : usage, territoire, durée, support. DevisFlow vous permet d'ajouter des notes personnalisées pour détailler ces conditions. Une cession de droits non mentionnée reste limitée à l'usage convenu.",
  },
  {
    q: "Puis-je créer un devis pour un mariage avec plusieurs forfaits ?",
    a: "Oui. Décrivez votre prestation complète — reportage cérémonie, photos de couple, album, retouches — et l'IA structure automatiquement chaque ligne avec son prix. Vous ajustez ensuite librement.",
  },
];

export default function DevisPhotographePage() {
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
            📸 Photographe
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            Devis photographe professionnel<br />
            <span style={{ color: "var(--orange)" }}>en 30 secondes grâce à l'IA</span>
          </h1>
          <p style={{ fontSize: 17, color: "#93c5fd", lineHeight: 1.7, marginBottom: 36 }}>
            Mariage, portrait, reportage d'entreprise, shooting produit — décrivez votre prestation et obtenez un devis structuré, prêt à envoyer et à faire signer électroniquement.
          </p>
          <CheckoutButton style={{ backgroundColor: "var(--orange)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 32px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            Créer mon devis photographe →
          </CheckoutButton>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>Sans carte bancaire · 7 jours gratuits</p>
        </section>

        <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { icon: "💒", title: "Mariage", desc: "Cérémonie, cocktail, soirée, album — devis complet en une description." },
              { icon: "🏢", title: "Corporate", desc: "Reportage d'entreprise, portrait équipe, événements corporate." },
              { icon: "🛍️", title: "Produit", desc: "Shooting e-commerce, catalogue, packshot sur fond blanc." },
              { icon: "👶", title: "Portrait & famille", desc: "Nouveau-né, grossesse, famille — forfaits personnalisés." },
            ].map((c) => (
              <div key={c.title} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: "#93c5fd", lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 64px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Questions fréquentes — Devis photographe</h2>
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
