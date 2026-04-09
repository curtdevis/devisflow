import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — DevisFlow",
  description: "Politique de confidentialité et protection des données personnelles (RGPD) de DevisFlow.",
};

export default function ConfidentialitePage() {
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
          Politique de confidentialité
        </h1>
        <p className="text-gray-400 text-sm mb-2">Dernière mise à jour : avril 2026</p>
        <p className="text-sm text-gray-500 mb-10">
          Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679)
          et à la loi Informatique et Libertés.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est <strong>DevisFlow</strong>,
              joignable à : <a href="mailto:privacy@devis-flow.fr" className="underline" style={{ color: "var(--orange)" }}>privacy@devis-flow.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>2. Données collectées</h2>
            <p className="mb-3">Nous collectons les données suivantes lors de votre utilisation de DevisFlow :</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Données de compte</p>
                <ul className="text-sm text-gray-500 space-y-1 ml-3 list-disc">
                  <li>Adresse email (identifiant)</li>
                  <li>Nom complet et nom d&apos;entreprise</li>
                  <li>Numéro SIRET</li>
                  <li>Téléphone et adresse professionnelle</li>
                  <li>Photo de profil (optionnelle)</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Données de devis</p>
                <ul className="text-sm text-gray-500 space-y-1 ml-3 list-disc">
                  <li>Contenu des devis générés (descriptions, montants, clients)</li>
                  <li>Historique des devis créés</li>
                  <li>Paramètres de relances automatiques</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Données techniques</p>
                <ul className="text-sm text-gray-500 space-y-1 ml-3 list-disc">
                  <li>Adresse IP et données de navigation (logs serveur)</li>
                  <li>Cookies de session (authentification)</li>
                  <li>Données d&apos;usage agrégées et anonymisées</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Données de paiement</p>
                <p className="text-sm text-gray-500">
                  Les données de paiement (carte bancaire) sont traitées directement par <strong>Lemon Squeezy</strong>
                  et ne transitent pas par nos serveurs. Nous conservons uniquement l&apos;identifiant client
                  Lemon Squeezy et le statut d&apos;abonnement.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li><strong>Fourniture du service :</strong> création et gestion de votre compte, génération de devis</li>
              <li><strong>Communication transactionnelle :</strong> emails de confirmation, devis envoyés, relances</li>
              <li><strong>Facturation :</strong> gestion des abonnements et paiements</li>
              <li><strong>Support client :</strong> réponse à vos demandes</li>
              <li><strong>Amélioration du service :</strong> analyse anonymisée des usages</li>
              <li><strong>Obligations légales :</strong> conservation des données de facturation</li>
            </ul>
            <p className="mt-3">
              Base légale : exécution du contrat (CGU), intérêt légitime (amélioration du service),
              obligation légale (comptabilité).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>4. Sous-traitants et transferts</h2>
            <p className="mb-3">Nous faisons appel aux sous-traitants suivants pour opérer le service :</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-2 pr-4">Sous-traitant</th>
                    <th className="pb-2 pr-4">Finalité</th>
                    <th className="pb-2">Localisation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: "Supabase", purpose: "Base de données et authentification", location: "EU (AWS)" },
                    { name: "Vercel", purpose: "Hébergement web", location: "EU / USA (SCCs)" },
                    { name: "Anthropic (Claude)", purpose: "Génération IA des devis", location: "USA (SCCs)" },
                    { name: "Resend", purpose: "Envoi d'emails transactionnels", location: "USA (SCCs)" },
                    { name: "Lemon Squeezy", purpose: "Paiement et abonnements", location: "USA (SCCs)" },
                  ].map((r) => (
                    <tr key={r.name} className="text-gray-600">
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 pr-4">{r.purpose}</td>
                      <td className="py-2 text-xs text-gray-400">{r.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              SCCs = Clauses Contractuelles Types de la Commission Européenne, garantissant
              un niveau de protection adéquat pour les transferts hors UE.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>5. Durée de conservation</h2>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li><strong>Données de compte actif :</strong> durée de l&apos;abonnement + 30 jours après résiliation</li>
              <li><strong>Données de facturation :</strong> 10 ans (obligation comptable légale)</li>
              <li><strong>Logs techniques :</strong> 12 mois</li>
              <li><strong>Emails envoyés :</strong> 6 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>6. Vos droits RGPD</h2>
            <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                { right: "Droit d'accès", desc: "Obtenir une copie de vos données" },
                { right: "Droit de rectification", desc: "Corriger vos données inexactes" },
                { right: "Droit à l'effacement", desc: "Supprimer votre compte et vos données" },
                { right: "Droit à la portabilité", desc: "Exporter vos données en format lisible" },
                { right: "Droit d'opposition", desc: "Vous opposer à certains traitements" },
                { right: "Droit de limitation", desc: "Limiter le traitement de vos données" },
              ].map((r) => (
                <div key={r.right} className="rounded-lg border border-gray-100 p-3">
                  <p className="font-semibold text-gray-900">{r.right}</p>
                  <p className="text-gray-500">{r.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Pour exercer vos droits, contactez notre DPO : <a href="mailto:privacy@devis-flow.fr" className="underline" style={{ color: "var(--orange)" }}>privacy@devis-flow.fr</a>.
              Nous nous engageons à répondre dans un délai de 30 jours.
            </p>
            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> :
              <a href="https://www.cnil.fr" className="underline ml-1" style={{ color: "var(--orange)" }}>cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>7. Cookies</h2>
            <p>
              Le site utilise uniquement des cookies strictement nécessaires au fonctionnement du service :
            </p>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
              <li><strong>Cookie de session Supabase :</strong> maintien de votre authentification (durée : session)</li>
              <li><strong>Vercel Analytics :</strong> statistiques d&apos;usage anonymisées sans cookie tiers</li>
            </ul>
            <p className="mt-2 text-sm">
              Aucun cookie publicitaire ou de tracking comportemental n&apos;est déposé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>8. Sécurité</h2>
            <p>
              DevisFlow met en œuvre des mesures techniques et organisationnelles appropriées pour
              protéger vos données : chiffrement TLS en transit, chiffrement au repos (Supabase),
              authentification sécurisée, accès aux données limité au personnel habilité,
              journalisation des accès.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>9. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. En cas de modification substantielle,
              nous vous en informerons par email avec un préavis de 30 jours.
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>10. Contact</h2>
            <p>
              Pour toute question relative à la protection de vos données :{" "}
              <a href="mailto:privacy@devis-flow.fr" className="underline" style={{ color: "var(--orange)" }}>
                privacy@devis-flow.fr
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4 text-sm text-gray-400">
          <Link href="/mentions-legales" className="hover:text-gray-600 underline">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-gray-600 underline">CGU</Link>
          <Link href="/contact" className="hover:text-gray-600 underline">Contact</Link>
        </div>
      </main>
    </div>
  );
}
