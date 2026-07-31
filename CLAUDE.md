@AGENTS.md

# DevisFlow — Générateur de devis IA pour artisans français

## Projet
SaaS de génération de devis professionnels par IA, ciblant les artisans et TPE/PME françaises avant la deadline e-facture septembre 2026.

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
- Essai gratuit 7 jours
- Paiement via Lemon Squeezy (agent centralisé : src/lib/lemon-squeezy.ts)
- Checkout en mode LIVE forcé via l'API LS (test_mode: false)
- Route checkout : POST /api/billing/checkout
- Route portail client : GET /api/billing/portal

<important if="writing or modifying API routes">
- Always validate inputs at the route boundary — never trust req.body blindly
- Use the server Supabase client (not browser client) for all DB writes
- Never expose SUPABASE_SERVICE_ROLE_KEY to the client side
- Add rate limiting on public routes (/api/generate-devis, /api/send-devis)
</important>

<important if="touching payments, checkout, or Lemon Squeezy">
- Checkout always uses LIVE mode (test_mode: false) — never flip this without explicit instruction
- Webhook signature must be verified before processing any event
- After a successful webhook, update the DB and return 200 immediately — never delay
</important>

<important if="touching auth, redirects, or protected pages">
- Free trial gate: if created_at > 7 days AND plan = free → redirect to upgrade wall, not login
- Auth gate on /devis and /dashboard — redirect to /auth/register?redirect=<page>
- Sign page (/sign/[id]) is PUBLIC — must work without a session
</important>

## Gotchas (known failure points in this project)
- **next/image with remote URLs** — must add domain to next.config.ts `images.remotePatterns` or it breaks in prod
- **Supabase RLS** — client-side queries silently return [] when RLS blocks — always test with admin client to distinguish "no data" from "blocked"
- **Lemon Squeezy webhook replay** — webhooks can fire twice; make DB updates idempotent
- **Vercel cron timezone** — crons run in UTC; D+3/D+7 reminders must account for French timezone offset
- **Tailwind v4** — JIT config syntax changed; don't copy v3 patterns from docs/training data
- **Claude API streaming** — never use streaming on Vercel Edge functions with a timeout < 30s; use Node.js runtime instead

## Standard de qualité
Ce projet est un business visé à plusieurs millions de revenus, pas un side-project. Chaque tâche — même une simple demande — exige un travail minutieux : explorer exhaustivement avant de coder (pas d'échantillonnage partiel sur une logique de plan/paiement/gating), vérifier réellement avant d'annoncer "fonctionnel" (typecheck, test live, lecture du code modifié), et ne jamais deviner un état de prod sans le confirmer. Tout agent lancé sur ce projet doit recevoir cette consigne explicitement dans son prompt.

## Initiative revenue-oriented
Au-delà de l'exécution littérale, chaque agent doit chercher activement des angles qui font du chiffre d'affaire (upsell, rétention, pricing, analytics) en s'inspirant des pratiques des grandes SaaS/multinationales — proposer ces angles plutôt que les taire, sans pour autant construire quoi que ce soit d'ambigu ou de large sans confirmation. Ne pas installer d'outils/dépendances de façon spéculative ; le faire quand un besoin concret et justifié apparaît, en expliquant pourquoi.

## Agents disponibles
- `senior-dev` — revue de code + validation avant déploiement
- `qa-coherence` — détecte les incohérences marketing/code
- `browser-tester` — E2E sur les flux critiques
- `competitor-analysis` — veille concurrentielle hebdomadaire
- `token-optimizer` — compression contexte pour longues sessions
- `master` — agent autonome 24/7 (scrute, corrige, déploie)
