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
    a: "L'offre Cabinet & Groupement de DevisFlow s'adresse à deux profils : les cabinets d'experts-comptables qui accompagnent des artisans clients et veulent professionnaliser leurs devis sans reprendre chaque dossier un par un, et les groupements ou fédérations d'artisans qui veulent centraliser et suivre l'activité de leurs membres depuis un seul espace. Contrairement au plan Artisan Solo à 29 €/mois pensé pour un seul utilisateur, ce plan ajoute une couche d'administration : invitation des artisans par email, tableau de bord consolidé, rapports exportables et facturation centralisée sur un seul abonnement. Chaque artisan invité continue de générer ses propres devis en 30 secondes depuis son téléphone, avec la même IA spécialisée BTP et la même conformité Factur-X 2026 que le plan individuel — le cabinet ou le groupement gagne simplement une vue d'ensemble sur l'activité de tout son portefeuille.",
  },
  {
    q: "Combien d'artisans puis-je gérer ?",
    a: "Le plan Cabinet & Groupement s'adapte à la taille de votre portefeuille, de quelques artisans à plusieurs dizaines, sans limite technique imposée par défaut. Chaque artisan invité conserve son propre compte pour créer ses devis, pendant que l'administrateur du cabinet ou du groupement garde une vue consolidée sur l'ensemble du portefeuille depuis un tableau de bord unique. Le tarif exact dépend du nombre d'artisans réellement gérés : DevisFlow propose un devis personnalisé à partir de 299 €/mois plutôt qu'un prix fixe, pour rester adapté aussi bien à un petit cabinet de 5 artisans qu'à une fédération régionale qui en compte plusieurs dizaines, avec une facturation regroupée sur un seul abonnement mensuel. Contactez l'équipe DevisFlow via le formulaire de contact pour obtenir un tarif adapté à votre volume exact d'artisans et à votre fréquence de facturation.",
  },
  {
    q: "Est-ce que chaque artisan a son propre espace ?",
    a: "Oui. Chaque artisan invité dans le portefeuille dispose de son propre compte DevisFlow, avec ses propres clients, ses propres devis et sa propre signature électronique — exactement comme s'il utilisait le plan Artisan Solo à titre individuel. L'invitation se fait simplement par email depuis l'onglet Invitations du tableau de bord agence. L'administrateur du cabinet ou du groupement, lui, conserve une vue consolidée en tant que gestionnaire du portefeuille : il peut consulter, filtrer et suivre les devis générés par tous les artisans invités depuis un tableau de bord unique, sans avoir accès aux identifiants de connexion de chacun. Cette séparation permet à chaque artisan de garder son autonomie au quotidien — génération de devis en 30 secondes depuis son téléphone, sur le chantier — tout en donnant au cabinet ou au groupement la visibilité nécessaire pour son reporting mensuel et sa facturation centralisée.",
  },
  {
    q: "Combien ça coûte ?",
    a: "Le plan Cabinet & Groupement démarre à partir de 299 €/mois. Le tarif exact dépend du nombre d'artisans gérés dans le portefeuille : contactez l'équipe DevisFlow pour obtenir un devis personnalisé adapté à votre volume. Ce tarif inclut une facturation centralisée — un seul abonnement et une seule facture pour l'ensemble du portefeuille d'artisans, plutôt que 29 €/mois multiplié par chaque artisan individuellement souscrivant au plan Solo. Il donne également accès aux fonctionnalités réservées aux cabinets et groupements : invitations par email, tableau de bord multi-artisans, rapports mensuels exportables en PDF et suivi consolidé de l'activité, en plus de toutes les fonctionnalités du plan Artisan Solo (génération IA en 30 secondes, signature électronique, conformité facturation électronique 2026). Pour un cabinet accompagnant plusieurs artisans, ce modèle centralisé revient souvent moins cher que des abonnements individuels multipliés.",
  },
  {
    q: "Comment démarrer ?",
    a: "Créez d'abord votre espace agence en tant que cabinet ou groupement — l'inscription prend environ 30 secondes, comme pour un compte artisan classique. Depuis l'onglet Invitations de votre tableau de bord, invitez ensuite vos premiers artisans par email : chacun reçoit un lien pour rejoindre votre portefeuille et créer son propre compte en quelques secondes, sans configuration technique de votre côté. Une fois vos artisans rattachés, vous pouvez consulter, filtrer et suivre tous les devis qu'ils génèrent depuis un tableau de bord consolidé, et exporter des rapports mensuels en PDF par artisan ou par période, utiles pour votre reporting interne ou pour celui que vous transmettez à vos propres clients. La facturation reste centralisée sur un seul abonnement mensuel à partir de 299 €/mois, quel que soit le nombre d'artisans que vous ajoutez ensuite à votre portefeuille.",
  },
];

export default function CabinetsExpertsComptablesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://devis-flow.fr/" },
      { "@type": "ListItem", position: 2, name: "Cabinets & Experts-comptables", item: "https://devis-flow.fr/cabinets-experts-comptables" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

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

        <nav aria-label="fil d'ariane" style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 24px 0", fontSize: 13, color: "#64748b" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Accueil</Link>
          {" / "}Cabinets &amp; Experts-comptables
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
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.t}</h3>
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

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "32px 24px", fontSize: 13, color: "#64748b" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <Link href="/comparatif" style={{ color: "#64748b", textDecoration: "none" }}>Comparatif logiciels devis artisans</Link>
            <span>·</span>
            <Link href="/devis-plombier" style={{ color: "#64748b", textDecoration: "none" }}>Devis plombier</Link>
            <span>·</span>
            <Link href="/devis-electricien" style={{ color: "#64748b", textDecoration: "none" }}>Devis électricien</Link>
            <span>·</span>
            <Link href="/facture-electronique-artisan-2026" style={{ color: "#64748b", textDecoration: "none" }}>Facture électronique 2026</Link>
            <span>·</span>
            <Link href="/mentions-legales" style={{ color: "#64748b", textDecoration: "none" }}>Mentions légales</Link>
            <span>·</span>
            <Link href="/confidentialite" style={{ color: "#64748b", textDecoration: "none" }}>Confidentialité</Link>
            <span>·</span>
            <Link href="/contact" style={{ color: "#64748b", textDecoration: "none" }}>Contact</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
