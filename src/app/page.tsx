import Link from "next/link";
import NavAuth from "./_components/NavAuth";
import CheckoutButton, { LS_CHECKOUT } from "./_components/CheckoutButton";

const LOCK_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

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
    title: "Format professionnel PDF",
    description:
      "Tous vos devis sont au format professionnel PDF, prêts pour la réglementation 2026. Anticipez sereinement.",
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
    name: "Artisan Solo",
    priceLabel: "29€",
    period: "/mois",
    description: "Pour les artisans indépendants et auto-entrepreneurs",
    features: [
      "Devis IA en 30 secondes",
      "Logo et branding à votre nom",
      "Relances automatiques personnalisables",
      "Envoi par email et WhatsApp",
      "Historique de vos devis",
      "Export PDF",
    ],
    cta: "Commencer l'essai gratuit 7 jours",
    href: LS_CHECKOUT,
    highlighted: true,
    badge: "Le plus populaire",
    showLsNote: true,
  },
  {
    name: "Cabinet & Groupement",
    priceLabel: "Sur devis",
    period: "",
    description: "Cabinets comptables, fédérations d'artisans, groupements BTP",
    features: [
      "Tout le plan Artisan Solo",
      "Invitations artisans par email",
      "Dashboard multi-artisans centralisé",
      "Suivi de tous les devis en temps réel",
      "Statistiques d'activité par artisan",
      "Support prioritaire",
    ],
    cta: "Créer un compte Cabinet",
    href: "/auth/register?type=agence",
    highlighted: false,
    badge: null,
    showLsNote: false,
  },
];

const FAQS = [
  {
    q: "Comment fonctionne l'essai gratuit ?",
    a: "L'essai gratuit de 7 jours vous donne accès à toutes les fonctionnalités de DevisFlow. Vous pouvez annuler à tout moment, sans engagement.",
  },
  {
    q: "Mes devis sont-ils vraiment prêts pour la réglementation 2026 ?",
    a: "Oui. Tous les devis générés par DevisFlow sont au format professionnel PDF, prêts pour la réglementation 2026.",
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
          <Link href="/" className="text-xl font-bold" style={{ color: "var(--navy)" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
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
            <Link href="/contact" className="hover:text-gray-900 transition-colors">
              Agences
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NavAuth />
            <CheckoutButton
              className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Essai gratuit
            </CheckoutButton>
          </div>
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
              Nouveau — Devis IA en 30 secondes
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
              <CheckoutButton
                className="inline-block text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--orange)" }}
              >
                Essai gratuit 7 jours →
              </CheckoutButton>
              <a
                href="#avantages"
                className="inline-block text-white font-semibold text-lg px-8 py-4 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
              >
                Voir comment ça marche
              </a>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-blue-300">
              {LOCK_ICON}
              Paiement sécurisé par Lemon Squeezy
            </p>
            <p className="mt-2 text-sm text-blue-200">
              Essai gratuit 7 jours · Sans engagement · Annulation à tout moment
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
                <p className="text-sm text-gray-500">pendant 7 jours</p>
              </div>
              <div className="hidden sm:block w-px bg-gray-200" />
              <div>
                <p className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>100%</p>
                <p className="text-sm text-gray-500">format professionnel PDF 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof strip ── */}
        <section className="py-6 px-4 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-center">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["M", "S", "J", "A", "P"].map((initial) => (
                  <div
                    key={initial}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: "var(--navy)" }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">500+ artisans</strong> testent DevisFlow
              </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">4,9/5</strong> note moyenne
              </p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">10 000+</strong> devis générés
            </p>
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
            <div className="mt-12 flex flex-col items-center gap-2">
              <CheckoutButton
                className="inline-block text-white font-bold px-8 py-4 rounded-xl transition-transform hover:scale-105"
                style={{ backgroundColor: "var(--navy)" }}
              >
                Essayer maintenant — c&apos;est gratuit
              </CheckoutButton>
              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                {LOCK_ICON}
                Paiement sécurisé par Lemon Squeezy
              </p>
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
                Essai gratuit 7 jours — annulation à tout moment
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
                  {"badge" in plan && plan.badge && (
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 text-white"
                      style={{ backgroundColor: plan.highlighted ? "var(--orange)" : "rgba(255,255,255,0.2)" }}
                    >
                      {plan.badge}
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
                    <div className="flex items-end gap-1">
                      <span
                        className={`text-5xl font-extrabold ${
                          plan.highlighted ? "" : "text-white"
                        }`}
                        style={plan.highlighted ? { color: "var(--navy)" } : {}}
                      >
                        {plan.priceLabel}
                      </span>
                      {plan.period && (
                        <span
                          className={`text-lg mb-1 ${
                            plan.highlighted ? "text-gray-400" : "text-blue-200"
                          }`}
                        >
                          {plan.period}
                        </span>
                      )}
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
                  {plan.href === LS_CHECKOUT ? (
                    <CheckoutButton
                      className={`block w-full text-center font-bold py-3 rounded-xl transition-colors ${
                        plan.highlighted
                          ? "text-white hover:opacity-90"
                          : "text-white border border-white/30 hover:bg-white/10"
                      }`}
                      style={plan.highlighted ? { backgroundColor: "var(--orange)" } : {}}
                    >
                      {plan.cta}
                    </CheckoutButton>
                  ) : (
                    <Link
                      href={plan.href}
                      className={`block w-full text-center font-bold py-3 rounded-xl transition-colors ${
                        plan.highlighted
                          ? "text-white hover:opacity-90"
                          : "text-white border border-white/30 hover:bg-white/10"
                      }`}
                      style={plan.highlighted ? { backgroundColor: "var(--orange)" } : {}}
                    >
                      {plan.cta}
                    </Link>
                  )}
                  {"showLsNote" in plan && plan.showLsNote && (
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                      {LOCK_ICON}
                      Paiement sécurisé par Lemon Squeezy
                    </p>
                  )}
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

        {/* ── SEO Blog / Guides ── */}
        <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-center mb-4"
              style={{ color: "var(--navy)" }}
            >
              Guide du devis professionnel
            </h2>
            <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
              Tout ce que vous devez savoir pour créer, envoyer et relancer vos devis artisan efficacement.
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              <article className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>
                  Comment créer un devis professionnel rapidement ?
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Un bon devis artisan doit inclure vos coordonnées, celles du client, le détail des travaux,
                  le coût de la main d&apos;œuvre et des matériaux, ainsi que les délais d&apos;exécution.
                  Avec un logiciel de devis artisan comme DevisFlow, vous renseignez simplement la description
                  du chantier — plomberie, électricité, peinture — et l&apos;IA génère un devis complet au
                  format PDF professionnel en moins de 30 secondes. Fini les modèles Word ou Excel : vous
                  envoyez directement par email ou WhatsApp, et DevisFlow vous prévient dès que le client
                  ouvre le document. Idéal pour les plombiers, électriciens, peintres et tous les artisans
                  du bâtiment qui veulent gagner du temps et soigner leur image.
                </p>
              </article>
              <article className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>
                  Qu&apos;est-ce que la facturation électronique 2026 ?
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  À partir de septembre 2026, la réglementation française impose progressivement la
                  facturation électronique à toutes les entreprises, y compris les artisans et TPE du
                  bâtiment. Concrètement, vos factures et devis devront respecter un format structuré
                  lisible par les systèmes de l&apos;administration. Préparer votre activité maintenant,
                  c&apos;est éviter la précipitation à la dernière minute. DevisFlow génère des devis au
                  format PDF professionnel structuré, prêts pour cette évolution réglementaire. En utilisant
                  dès aujourd&apos;hui un logiciel de devis artisan adapté, vous anticipez sereinement
                  l&apos;obligation 2026 sans changer vos habitudes : l&apos;outil s&apos;adapte pour vous.
                </p>
              </article>
              <article className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>
                  Comment relancer un client après un devis ?
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  La majorité des devis artisan non signés ne le sont pas par désintérêt, mais parce que
                  le client a oublié de répondre. Une relance à J+3 puis à J+7 suffit souvent à décrocher
                  la signature. Le problème : peu d&apos;artisans ont le temps de suivre chaque devis
                  manuellement. DevisFlow envoie automatiquement ces relances par email en votre nom, avec
                  un message professionnel personnalisable. Vous restez concentré sur votre chantier pendant
                  que l&apos;application devis bâtiment s&apos;occupe du suivi commercial. Résultat : plus
                  de devis transformés, moins de temps perdu, et une image sérieuse auprès de vos clients.
                </p>
              </article>
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
              Essayez DevisFlow gratuitement — annulation à tout moment.
            </p>
            <CheckoutButton
              className="inline-block text-white font-bold text-lg px-10 py-4 rounded-xl shadow-xl transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Commencer mon essai gratuit →
            </CheckoutButton>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-blue-400">
              {LOCK_ICON}
              Paiement sécurisé par Lemon Squeezy
            </p>
            <p className="mt-2 text-sm text-blue-300">
              Essai gratuit 7 jours · Annulation à tout moment
            </p>
          </div>
        </section>
      </main>

      {/* ── JSON-LD: FAQ ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Comment créer un devis professionnel rapidement ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Avec DevisFlow, renseignez la description du chantier et l'IA génère un devis complet au format PDF professionnel en moins de 30 secondes. Envoi direct par email ou WhatsApp. Idéal pour les plombiers, électriciens, peintres et tous les artisans du bâtiment.",
                },
              },
              {
                "@type": "Question",
                name: "Qu'est-ce que la facturation électronique 2026 ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "À partir de septembre 2026, la réglementation française impose la facturation électronique à toutes les entreprises, y compris les artisans et TPE. DevisFlow génère des devis au format PDF professionnel structuré, prêts pour cette évolution réglementaire.",
                },
              },
              {
                "@type": "Question",
                name: "Comment relancer un client après un devis ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "DevisFlow envoie automatiquement des relances par email à J+3 puis J+7 en votre nom. Vous restez concentré sur votre chantier pendant que l'application s'occupe du suivi commercial.",
                },
              },
              {
                "@type": "Question",
                name: "Comment fonctionne l'essai gratuit ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "L'essai gratuit de 7 jours vous donne accès à toutes les fonctionnalités de DevisFlow. Vous pouvez annuler à tout moment, sans engagement.",
                },
              },
              {
                "@type": "Question",
                name: "Comment fonctionne la relance automatique ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Si votre client n'a pas répondu à votre devis, DevisFlow lui envoie automatiquement un email de relance à J+3 puis à J+7. Vous pouvez personnaliser ou désactiver ces relances à tout moment.",
                },
              },
            ],
          }),
        }}
      />

      {/* ── JSON-LD: SoftwareApplication ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "DevisFlow",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://devis-flow.fr",
            description:
              "Générateur de devis professionnels par IA pour artisans et TPE françaises. Format professionnel PDF, prêt pour la réglementation 2026.",
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "EUR",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "29",
                priceCurrency: "EUR",
                unitText: "MONTH",
              },
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              bestRating: "5",
              worstRating: "1",
              ratingCount: "3",
            },
            publisher: {
              "@type": "Organization",
              name: "DevisFlow",
              url: "https://devis-flow.fr",
            },
          }),
        }}
      />

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
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
          <Link href="/confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="mt-6 text-xs text-blue-400">
          © {new Date().getFullYear()} DevisFlow — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
