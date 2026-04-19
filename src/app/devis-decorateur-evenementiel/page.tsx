import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/app/_components/CheckoutButton";

export const metadata: Metadata = {
  title: "Devis Décorateur Événementiel — Modèle IA | DevisFlow",
  description:
    "Créez un devis décorateur événementiel en 30 secondes. Mariage, gala, inauguration, baptême — fleurs, mobilier, scénographie. Signature électronique intégrée.",
  alternates: { canonical: "https://devis-flow.fr/devis-decorateur-evenementiel" },
};

const faqs = [
  {
    q: "Que doit mentionner un devis de décoration événementielle ?",
    a: "Un devis décorateur doit inclure : description précise des éléments de décoration (quantités, matériaux, couleurs), prestations associées (installation, démontage, livraison), durée de location éventuelle, prix HT par poste, TVA et total TTC. La date et le lieu de l'événement sont également essentiels.",
  },
  {
    q: "Quelle TVA s'applique à la décoration événementielle ?",
    a: "Le taux de TVA est de 20% pour les prestations de décoration événementielle (considérées comme prestations de services). La location de mobilier ou matériel est également à 20%. DevisFlow calcule automatiquement.",
  },
  {
    q: "Puis-je inclure des options facultatives dans mon devis ?",
    a: "Oui. Vous pouvez présenter un devis avec une base fixe et des options supplémentaires. Par exemple : décoration florale de base + option arche de cérémonie + option chemin de table premium. Le client choisit et signe.",
  },
  {
    q: "Comment gérer les acomptes et annulations dans mon devis ?",
    a: "Ajoutez vos conditions dans les notes du devis : acompte à la signature (généralement 30-50%), solde à J-30 ou le jour J, conditions d'annulation progressives. Ces clauses s'affichent sur le devis et sont opposables au client signataire.",
  },
];

export default function DevisDecorateurPage() {
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
            💐 Décoration événementielle
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            Devis décorateur événementiel<br />
            <span style={{ color: "var(--orange)" }}>généré par IA en 30 secondes</span>
          </h1>
          <p style={{ fontSize: 17, color: "#93c5fd", lineHeight: 1.7, marginBottom: 36 }}>
            Mariage, gala, inauguration, baptême — décrivez votre scénographie et obtenez un devis professionnel structuré, prêt à envoyer et à faire signer électroniquement.
          </p>
          <CheckoutButton style={{ backgroundColor: "var(--orange)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 32px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            Créer mon devis décoration →
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
