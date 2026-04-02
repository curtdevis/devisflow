import Link from "next/link";

const BENEFITS = [
  {
    icon: "⚡",
    title: "Devis en 30 secondes",
    description:
      "Décrivez vos travaux, notre IA génère un devis professionnel instantanément. Fini les tableurs et les modèles Word.",
  },
  {
    icon: "📱",
    title: "Depuis votre téléphone",
    description:
      "Créez et envoyez vos devis depuis le chantier, en quelques taps. Vos clients reçoivent un lien de validation immédiatement.",
  },
  {
    icon: "✅",
    title: "Conforme e-facture 2026",
    description:
      "Tous vos devis sont conformes à la réglementation Factur-X qui entre en vigueur en septembre 2026. Anticipez sereinement.",
  },
];

const TESTIMONIALS = [
  {
    name: "Mohamed B.",
    job: "Plombier indépendant, Lyon",
    quote:
      "Je perdais 2h par devis avant. Maintenant c'est 2 minutes. J'ai signé 3 nouveaux chantiers ce mois-ci.",
  },
  {
    name: "Sophie L.",
    job: "Électricienne, Bordeaux",
    quote:
      "Mes clients sont impressionnés par le rendu pro. Et les relances automatiques, c'est une vraie révolution.",
  },
  {
    name: "Jean-Pierre M.",
    job: "Peintre en bâtiment, Marseille",
    quote:
      "Simple, rapide, et pas cher. Exactement ce qu'il me fallait. Je recommande à tous mes collègues.",
  },
];

const PLANS = [
  {
    name: "Artisan",
    price: "29",
    period: "/mois",
    description: "Pour les artisans indépendants et auto-entrepreneurs",
    features: [
      "Devis illimités",
      "Génération IA en 30 secondes",
      "Envoi par email et WhatsApp",
      "Relances automatiques J+3 et J+7",
      "Conformité Factur-X",
      "Support par chat",
    ],
    cta: "Démarrer l'essai gratuit",
    href: "/devis",
    highlighted: false,
  },
  {
    name: "Agences & Groupements",
    price: "299",
    pricePrefix: "À partir de ",
    period: "/mois",
    description: "Cabinets comptables, fédérations d'artisans, groupements BTP",
    features: [
      "Jusqu'à 500 artisans gérés",
      "Multi-utilisateurs illimités",
      "Tableau de bord centralisé",
      "Marque blanche disponible",
      "Intégration logiciels comptables",
      "Support dédié prioritaire",
    ],
    cta: "Demander une démo",
    href: "/contact",
    highlighted: true,
  },
];

const FAQS = [
  {
    q: "Est-ce que j'ai besoin d'une carte bancaire pour l'essai ?",
    a: "Non. L'essai gratuit de 14 jours ne nécessite aucune carte bancaire. Vous renseignez vos informations de paiement uniquement si vous souhaitez continuer après l'essai.",
  },
  {
    q: "Mes devis sont-ils vraiment conformes à la réglementation e-facture ?",
    a: "Oui. Tous les devis générés par DevisFlow sont au format Factur-X, le standard européen qui deviendra obligatoire pour les artisans en septembre 2026.",
  },
  {
    q: "Comment fonctionne la relance automatique ?",
    a: "Si votre client n'a pas répondu à votre devis, DevisFlow lui envoie automatiquement un email de relance à J+3 puis à J+7. Vous pouvez personnaliser ou désactiver ces relances à tout moment.",
  },
  {
    q: "Puis-je personnaliser les devis avec mon logo ?",
    a: "Absolument. Vous uploadez votre logo et renseignez les informations de votre entreprise une seule fois. Ils apparaissent automatiquement sur tous vos devis.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <span className="text-xl font-bold" style={{ color: "var(--navy)" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </span>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#avantages" className="hover:text-gray-900 transition-colors">
              Avantages
            </a>
            <a href="#tarifs" className="hover:text-gray-900 transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">
              FAQ
            </a>
          </div>
          <Link
            href="/devis"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--orange)" }}
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden py-20 sm:py-32 px-4 text-center"
          style={{ backgroundColor: "var(--navy)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #f97316 0%, transparent 60%), radial-gradient(circle at 80% 20%, #60a5fa 0%, transparent 50%)",
            }}
          />
          <div className="relative max-w-3xl mx-auto">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{
                backgroundColor: "rgba(249,115,22,0.15)",
                color: "var(--orange)",
              }}
            >
              Nouveau — Conforme e-facture 2026
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Créez votre devis en{" "}
              <span style={{ color: "var(--orange)" }}>30 secondes</span>
              <br />
              avec l&apos;IA
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              DevisFlow génère des devis professionnels pour votre métier,
              directement depuis votre téléphone. Envoyez, relancez, signez —
              sans effort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/devis"
                className="inline-block text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--orange)" }}
              >
                Essai gratuit 14 jours →
              </Link>
              <a
                href="#avantages"
                className="inline-block text-white font-semibold text-lg px-8 py-4 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
              >
                Voir comment ça marche
              </a>
            </div>
            <p className="mt-4 text-sm text-blue-200">
              Sans carte bancaire · Sans engagement · Annulation en 1 clic
            </p>
          </div>
        </section>

        {/* ── Value bar ── */}
        <section className="bg-gray-50 py-8 px-4 border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12 text-center">
              <div>
                <p className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>30 s</p>
                <p className="text-sm text-gray-500">pour générer un devis</p>
              </div>
              <div className="hidden sm:block w-px bg-gray-200" />
              <div>
                <p className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>0 €</p>
                <p className="text-sm text-gray-500">pendant 14 jours</p>
              </div>
              <div className="hidden sm:block w-px bg-gray-200" />
              <div>
                <p className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>100%</p>
                <p className="text-sm text-gray-500">conforme Factur-X 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section id="avantages" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2
                className="text-3xl sm:text-4xl font-extrabold mb-4"
                style={{ color: "var(--navy)" }}
              >
                Tout ce dont vous avez besoin,
                <br />
                rien de superflu
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Conçu pour les artisans qui veulent passer moins de temps sur
                l&apos;administratif et plus sur leurs chantiers.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
                    style={{ backgroundColor: "rgba(30,58,95,0.08)" }}
                  >
                    {b.icon}
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "var(--navy)" }}
                  >
                    {b.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section
          className="py-20 px-4"
          style={{ backgroundColor: "rgba(30,58,95,0.03)" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-extrabold mb-14"
              style={{ color: "var(--navy)" }}
            >
              Comment ça marche ?
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 text-left">
              {[
                {
                  step: "1",
                  title: "Remplissez le formulaire",
                  desc: "Entrez les infos du client, décrivez les travaux, les matériaux et votre taux horaire.",
                },
                {
                  step: "2",
                  title: "L'IA génère votre devis",
                  desc: "Claude IA rédige un devis professionnel complet, avec tous les détails légaux requis.",
                },
                {
                  step: "3",
                  title: "Envoyez et signez",
                  desc: "Partagez le lien par email ou WhatsApp. Votre client signe en ligne en un clic.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white shrink-0 mt-1"
                    style={{ backgroundColor: "var(--orange)" }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <h3
                      className="font-bold text-lg mb-1"
                      style={{ color: "var(--navy)" }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link
                href="/devis"
                className="inline-block text-white font-bold px-8 py-4 rounded-xl transition-transform hover:scale-105"
                style={{ backgroundColor: "var(--navy)" }}
              >
                Essayer maintenant — c&apos;est gratuit
              </Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-center mb-14"
              style={{ color: "var(--navy)" }}
            >
              Ils ont adopté DevisFlow
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
                >
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: "var(--orange)" }}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-6 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-bold" style={{ color: "var(--navy)" }}>
                      {t.name}
                    </p>
                    <p className="text-sm text-gray-400">{t.job}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section
          id="tarifs"
          className="py-20 px-4"
          style={{ backgroundColor: "var(--navy)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Des tarifs simples et transparents
              </h2>
              <p className="text-blue-200 text-lg">
                14 jours d&apos;essai gratuit — sans carte bancaire
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 ${
                    plan.highlighted
                      ? "bg-white"
                      : "bg-white/10 border border-white/20"
                  }`}
                >
                  {plan.highlighted && (
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 text-white"
                      style={{ backgroundColor: "var(--orange)" }}
                    >
                      Populaire
                    </span>
                  )}
                  <h3
                    className={`text-xl font-bold mb-1 ${
                      plan.highlighted ? "" : "text-white"
                    }`}
                    style={plan.highlighted ? { color: "var(--navy)" } : {}}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mb-6 ${
                      plan.highlighted ? "text-gray-500" : "text-blue-200"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mb-8">
                    {"pricePrefix" in plan && (
                      <p className={`text-sm mb-1 ${plan.highlighted ? "text-gray-400" : "text-blue-200"}`}>
                        {plan.pricePrefix}
                      </p>
                    )}
                    <div className="flex items-end gap-1">
                      <span
                        className={`text-5xl font-extrabold ${
                          plan.highlighted ? "" : "text-white"
                        }`}
                        style={plan.highlighted ? { color: "var(--navy)" } : {}}
                      >
                        {plan.price}€
                      </span>
                      <span
                        className={`text-lg mb-1 ${
                          plan.highlighted ? "text-gray-400" : "text-blue-200"
                        }`}
                      >
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-center gap-3 text-sm ${
                          plan.highlighted ? "text-gray-600" : "text-blue-100"
                        }`}
                      >
                        <span style={{ color: "var(--orange)" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block w-full text-center font-bold py-3 rounded-xl transition-colors ${
                      plan.highlighted
                        ? "text-white hover:opacity-90"
                        : "text-white border border-white/30 hover:bg-white/10"
                    }`}
                    style={
                      plan.highlighted
                        ? { backgroundColor: "var(--orange)" }
                        : {}
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-center mb-14"
              style={{ color: "var(--navy)" }}
            >
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-white border border-gray-100 rounded-2xl shadow-sm"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 font-semibold text-gray-800 list-none">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform shrink-0 text-xl font-light">
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section
          className="py-20 px-4 text-center"
          style={{
            background: "linear-gradient(135deg, var(--navy) 0%, #2d5282 100%)",
          }}
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Prêt à gagner du temps sur vos devis ?
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Essayez DevisFlow gratuitement — sans carte bancaire requise.
            </p>
            <Link
              href="/devis"
              className="inline-block text-white font-bold text-lg px-10 py-4 rounded-xl shadow-xl transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Commencer mon essai gratuit →
            </Link>
            <p className="mt-4 text-sm text-blue-300">
              14 jours gratuits · Sans CB · Résiliable à tout moment
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-10 px-4 text-center text-sm text-blue-200"
        style={{ backgroundColor: "var(--navy-dark)" }}
      >
        <p className="font-bold text-white mb-1">
          Devis<span style={{ color: "var(--orange)" }}>Flow</span>
        </p>
        <p className="mb-4">Le générateur de devis IA pour les artisans français</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-blue-300">
          <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
          <a href="#" className="hover:text-white transition-colors">CGV</a>
          <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="mt-6 text-xs text-blue-400">
          © {new Date().getFullYear()} DevisFlow — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
