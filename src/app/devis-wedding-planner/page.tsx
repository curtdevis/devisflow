import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/app/_components/CheckoutButton";

export const metadata: Metadata = {
  title: "Devis Wedding Planner — Modèle IA professionnel | DevisFlow",
  description:
    "Créez un devis wedding planner professionnel en 30 secondes. Organisation complète ou partielle, coordination de jour J — conforme au droit français, signature électronique incluse.",
  alternates: { canonical: "https://devis-flow.fr/devis-wedding-planner" },
};

const faqs = [
  {
    q: "Que doit contenir un devis de wedding planner ?",
    a: "Un devis de wedding planner doit préciser : le type de formule (organisation complète, partielle, ou coordination jour J), les prestations incluses (recherche prestataires, suivi budget, coordination jour J, rétroplanning), le nombre de réunions, les honoraires HT, la TVA et le total TTC. Indiquez aussi les conditions d'acompte.",
  },
  {
    q: "Quelle TVA pour un wedding planner ?",
    a: "Les honoraires d'un wedding planner sont soumis à la TVA au taux de 20% (prestations intellectuelles et de coordination). Si vous êtes en franchise en base (CA < 36 800 €), vous facturez sans TVA avec la mention légale correspondante.",
  },
  {
    q: "Comment protéger juridiquement mon devis de wedding planner ?",
    a: "Indiquez clairement ce qui est inclus et exclu, les conditions de résiliation, le calendrier de paiement et les responsabilités de chaque partie. La signature électronique intégrée à DevisFlow crée une preuve légale d'acceptation.",
  },
  {
    q: "Puis-je proposer plusieurs formules dans un même devis ?",
    a: "Oui. Vous pouvez présenter trois formules (Essentielle, Complète, Prestige) dans un seul document. Le client choisit et signe la formule retenue. Pratique pour adapter votre offre aux différents budgets.",
  },
];

export default function DevisWeddingPlannerPage() {
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
            💒 Wedding Planner
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            Devis wedding planner<br />
            <span style={{ color: "var(--orange)" }}>professionnel en 30 secondes</span>
          </h1>
          <p style={{ fontSize: 17, color: "#93c5fd", lineHeight: 1.7, marginBottom: 36 }}>
            Organisation complète, partielle ou coordination jour J — décrivez votre formule et obtenez un devis structuré, prêt à faire signer électroniquement par vos futurs mariés.
          </p>
          <CheckoutButton style={{ backgroundColor: "var(--orange)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 32px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            Créer mon devis wedding planner →
          </CheckoutButton>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>Sans carte bancaire · 7 jours gratuits</p>
        </section>

        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 64px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Questions fréquentes</h2>
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
