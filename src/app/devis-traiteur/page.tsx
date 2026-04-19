import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/app/_components/CheckoutButton";

export const metadata: Metadata = {
  title: "Devis Traiteur en ligne — Modèle gratuit IA | DevisFlow",
  description:
    "Créez un devis traiteur professionnel en 30 secondes grâce à l'IA. Menu, cocktail, vin d'honneur, repas assis — conforme au droit français. Essai gratuit 7 jours.",
  alternates: { canonical: "https://devis-flow.fr/devis-traiteur" },
};

const exempleLines = [
  { description: "Cocktail d'accueil (80 personnes) — 12 pièces/personne", quantity: 80, unitPrice: 22, total: 1760 },
  { description: "Repas assis 5 services avec accord mets-vins", quantity: 80, unitPrice: 85, total: 6800 },
  { description: "Location vaisselle et verrerie premium", quantity: 1, unitPrice: 640, total: 640 },
  { description: "Personnel de service (4 serveurs × 8h)", quantity: 32, unitPrice: 28, total: 896 },
  { description: "Frais de déplacement et logistique", quantity: 1, unitPrice: 320, total: 320 },
];
const subtotalHT = exempleLines.reduce((s, l) => s + l.total, 0);
const tvaAmount = subtotalHT * 0.1;
const totalTTC = subtotalHT + tvaAmount;

const faqs = [
  {
    q: "Quels éléments doit comporter un devis traiteur légalement ?",
    a: "Un devis traiteur doit inclure : date d'émission, durée de validité, coordonnées du prestataire (SIRET, adresse), détail des prestations (menu, nombre de convives, personnel), prix HT, taux de TVA applicable et total TTC. DevisFlow génère tout automatiquement.",
  },
  {
    q: "Quel taux de TVA s'applique à la restauration événementielle ?",
    a: "Le taux standard est de 10% pour la restauration (plats cuisinés, service en salle). La vente à emporter de produits froids est à 5,5%. DevisFlow calcule automatiquement le bon taux selon votre prestation.",
  },
  {
    q: "Comment faire signer un devis traiteur à distance ?",
    a: "DevisFlow génère un lien de signature électronique que vous envoyez par email ou WhatsApp. Le client signe depuis son smartphone en quelques secondes. Vous recevez une notification immédiate.",
  },
  {
    q: "Puis-je créer un devis traiteur mariage personnalisé ?",
    a: "Oui. Décrivez votre prestation en langage naturel (menu, nombre de personnes, prestations spéciales) et l'IA génère un devis structuré. Vous pouvez ajuster chaque ligne manuellement.",
  },
];

export default function DevisTraiteurPage() {
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
            Devis<span style={{ color: "var(--orange)" }}>Flow</span> <span style={{ fontSize: 12, fontWeight: 400, color: "#93c5fd" }}>Entrepreneur</span>
          </Link>
          <Link href="/auth/register" style={{ background: "var(--orange)", color: "white", fontWeight: 700, fontSize: 14, padding: "10px 20px", borderRadius: 10, textDecoration: "none" }}>
            Essai gratuit →
          </Link>
        </nav>

        <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 48px" }}>
          <div style={{ display: "inline-block", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.4)", borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "var(--orange)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 20 }}>
            🍽️ Traiteur
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            Devis traiteur professionnel<br />
            <span style={{ color: "var(--orange)" }}>généré par IA en 30 secondes</span>
          </h1>
          <p style={{ fontSize: 17, color: "#93c5fd", lineHeight: 1.7, marginBottom: 36 }}>
            Cocktail, repas assis, vin d'honneur, brunch — décrivez votre prestation et DevisFlow génère un devis conforme, prêt à envoyer et à faire signer en ligne.
          </p>
          <CheckoutButton
            style={{ backgroundColor: "var(--orange)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 32px", borderRadius: 12, border: "none", cursor: "pointer" }}
          >
            Créer mon devis traiteur →
          </CheckoutButton>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>Sans carte bancaire · 7 jours gratuits</p>
        </section>

        {/* Exemple devis */}
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 64px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Exemple de devis traiteur généré par IA</h2>
          <div style={{ background: "white", borderRadius: 16, overflow: "hidden", color: "#111827" }}>
            <div style={{ background: "#1e3a5f", padding: "20px 28px" }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "white" }}>Devis<span style={{ color: "#f97316" }}>Flow</span></p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#93c5fd" }}>Prestation traiteur — Mariage 80 personnes</p>
            </div>
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, fontSize: 13 }}>
                <div><p style={{ margin: "0 0 4px", color: "#6b7280" }}>Prestataire</p><p style={{ margin: 0, fontWeight: 700 }}>Les Saveurs de Julie<br /><span style={{ fontWeight: 400 }}>SIRET 85234567890123</span></p></div>
                <div><p style={{ margin: "0 0 4px", color: "#6b7280" }}>Client</p><p style={{ margin: 0, fontWeight: 700 }}>M. & Mme Dubois<br /><span style={{ fontWeight: 400 }}>Mariage 15 juin 2026</span></p></div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: "#1e3a5f" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "white", fontSize: 11 }}>Prestation</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: "white", fontSize: 11, width: 50 }}>Qté</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: "white", fontSize: 11, width: 80 }}>PU HT</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: "white", fontSize: 11, width: 90 }}>Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {exempleLines.map((l, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "white" }}>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>{l.description}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "#6b7280" }}>{l.quantity}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "#6b7280" }}>{l.unitPrice.toFixed(2)} €</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: "#111827" }}>{l.total.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "right", fontSize: 13 }}>
                <p style={{ margin: "4px 0", color: "#6b7280" }}>Sous-total HT : <strong>{subtotalHT.toFixed(2)} €</strong></p>
                <p style={{ margin: "4px 0", color: "#6b7280" }}>TVA 10% : <strong>{tvaAmount.toFixed(2)} €</strong></p>
                <p style={{ margin: "12px 0 0", fontSize: 18, fontWeight: 800, color: "#1e3a5f" }}>Total TTC : {totalTTC.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 64px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Questions sur le devis traiteur</h2>
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
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Créez votre devis traiteur maintenant</h2>
          <CheckoutButton style={{ backgroundColor: "var(--orange)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 36px", borderRadius: 12, border: "none", cursor: "pointer" }}>
            Commencer gratuitement →
          </CheckoutButton>
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>Sans carte bancaire · 7 jours gratuits · Annulation libre</p>
        </section>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px", textAlign: "center", fontSize: 13, color: "#475569" }}>
          <p style={{ margin: 0 }}>
            © 2026 DevisFlow · <Link href="/entrepreneur" style={{ color: "#475569" }}>Section Entrepreneur</Link> · <Link href="/" style={{ color: "#475569" }}>Artisans BTP</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
