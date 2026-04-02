@AGENTS.md

# DevisFlow — Générateur de devis IA pour artisans français

## Projet
Application SaaS de génération de devis professionnels par IA, ciblant les artisans et TPE/PME françaises avant la deadline réglementation e-facture septembre 2026.

## Segments cibles
- Low ticket : artisans indépendants (plombiers, électriciens, peintres) — 29€/mois
- High ticket : agences comptables, fédérations artisans, groupements BTP — 300-1000€/mois

## Stack technique
- Next.js 15 + TypeScript + Tailwind CSS
- Claude API (Anthropic) pour génération des devis
- Lemon Squeezy pour les paiements
- Vercel pour le déploiement

## Fonctionnalités MVP
1. Formulaire simple : client, description travaux, matériaux, main d'oeuvre
2. Génération du devis PDF par Claude IA en moins de 30 secondes
3. Lien de partage du devis par email ou WhatsApp
4. Relance automatique J+3 et J+7 si pas de réponse
5. Conformité e-facture Factur-X

## Style
- Design épuré, professionnel, rassurant
- Couleurs : bleu marine + blanc + orange accent
- Mobile first — les artisans travaillent sur téléphone

## Monétisation
- Essai gratuit 14 jours
- Paiement via Lemon Squeezy
- Pas de CB requise pour l'essai
