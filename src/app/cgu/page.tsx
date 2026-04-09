import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — DevisFlow",
  description: "Conditions Générales d'Utilisation du logiciel DevisFlow.",
};

export default function CguPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <Link href="/" className="text-sm text-blue-200 hover:text-white transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : avril 2026</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
              l&apos;utilisation du service DevisFlow, logiciel SaaS de génération de devis par
              intelligence artificielle accessible à l&apos;adresse <strong>devis-flow.fr</strong>.
            </p>
            <p className="mt-2">
              En créant un compte, l&apos;utilisateur accepte pleinement et sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>2. Description du service</h2>
            <p>DevisFlow est une application permettant aux artisans et professionnels du bâtiment de :</p>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li>Générer des devis professionnels en format PDF en moins de 30 secondes via l&apos;IA</li>
              <li>Envoyer ces devis à leurs clients par email ou lien de partage</li>
              <li>Suivre l&apos;historique de leurs devis</li>
              <li>Configurer des relances automatiques pour les devis en attente</li>
              <li>Pour les agences : gérer un portefeuille d&apos;artisans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>3. Accès au service et essai gratuit</h2>
            <p>
              DevisFlow propose une période d&apos;essai gratuite de <strong>7 jours</strong> sans
              carte bancaire requise. À l&apos;issue de la période d&apos;essai, l&apos;accès aux
              fonctionnalités premium nécessite la souscription à un abonnement payant.
            </p>
            <p className="mt-2">
              L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de l&apos;inscription
              et à maintenir la confidentialité de ses identifiants de connexion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>4. Tarification et abonnements</h2>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900 mb-1">Plan Artisan Solo — 29€ HT/mois</p>
                <p className="text-gray-500">Pour les artisans indépendants. Génération illimitée de devis, export PDF, relances automatiques.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900 mb-1">Plan Cabinet & Groupement — Sur devis</p>
                <p className="text-gray-500">Pour les cabinets comptables et groupements d&apos;artisans. Tarification sur mesure selon le nombre d&apos;artisans gérés.</p>
              </div>
            </div>
            <p className="mt-3">
              Les prix sont indiqués hors taxes. La TVA applicable est la TVA française en vigueur.
              Les paiements sont traités par <strong>Lemon Squeezy</strong>, prestataire de paiement sécurisé.
              L&apos;abonnement est sans engagement et peut être résilié à tout moment depuis l&apos;espace client.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>5. Résiliation</h2>
            <p>
              L&apos;utilisateur peut résilier son abonnement à tout moment depuis son espace compte
              (rubrique &quot;Abonnement&quot; → &quot;Gérer mon abonnement&quot;). La résiliation prend effet
              à la fin de la période de facturation en cours. Aucun remboursement prorata n&apos;est accordé
              pour la période déjà facturée.
            </p>
            <p className="mt-2">
              DevisFlow se réserve le droit de suspendre ou résilier un compte en cas de non-respect
              des présentes CGU, notamment en cas d&apos;utilisation abusive du service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>6. Utilisation acceptable</h2>
            <p>L&apos;utilisateur s&apos;engage à utiliser DevisFlow uniquement pour des usages professionnels légaux. Il est notamment interdit de :</p>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li>Générer des devis frauduleux ou trompeurs</li>
              <li>Tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
              <li>Utiliser le service à des fins de spam ou de sollicitation non autorisée</li>
              <li>Contourner les limitations techniques ou fonctionnelles du service</li>
              <li>Reproduire ou redistribuer le service sans autorisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>7. Intelligence artificielle et responsabilité</h2>
            <p>
              Les devis générés par l&apos;IA (Claude d&apos;Anthropic) sont fournis à titre indicatif.
              DevisFlow ne garantit pas l&apos;exactitude absolue des montants, descriptions ou mentions légales
              générés automatiquement. <strong>L&apos;utilisateur est seul responsable de vérifier et valider
              chaque devis avant de l&apos;envoyer à ses clients.</strong>
            </p>
            <p className="mt-2">
              DevisFlow ne peut être tenu responsable des pertes financières résultant d&apos;un devis
              incorrect généré par le service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>8. Disponibilité du service</h2>
            <p>
              DevisFlow s&apos;efforce de maintenir une disponibilité du service 24h/24, 7j/7.
              Des interruptions ponctuelles peuvent survenir pour maintenance ou en cas de force majeure.
              DevisFlow ne saurait être tenu responsable des préjudices liés à une interruption de service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>9. Propriété des données</h2>
            <p>
              Les devis et données créés par l&apos;utilisateur lui appartiennent. DevisFlow ne revendique
              aucun droit de propriété sur le contenu généré. L&apos;utilisateur peut exporter et supprimer
              ses données à tout moment.
            </p>
            <p className="mt-2">
              En cas de fermeture de compte, les données sont conservées 30 jours puis supprimées
              définitivement, sauf obligation légale contraire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>10. Modifications des CGU</h2>
            <p>
              DevisFlow se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés par email de toute modification substantielle avec
              un préavis de 30 jours. La poursuite de l&apos;utilisation du service vaut acceptation
              des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>11. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont soumises au droit français. Tout litige sera porté devant
              les tribunaux compétents du ressort du siège social de DevisFlow.
            </p>
            <p className="mt-2">
              Pour toute réclamation ou question : <a href="mailto:contact@devis-flow.fr" className="underline" style={{ color: "var(--orange)" }}>contact@devis-flow.fr</a>
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4 text-sm text-gray-400">
          <Link href="/mentions-legales" className="hover:text-gray-600 underline">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-gray-600 underline">Politique de confidentialité</Link>
          <Link href="/contact" className="hover:text-gray-600 underline">Contact</Link>
        </div>
      </main>
    </div>
  );
}
