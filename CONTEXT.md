# DevisFlow — Contexte Projet Complet

## Vue d'ensemble

**DevisFlow** est un SaaS de génération de devis professionnels par IA pour artisans et TPE françaises. L'application permet de créer des devis PDF en moins de 30 secondes à partir d'une description des travaux.

- **Cible** : Artisans (plombiers, électriciens, peintres) et agences comptables
- **Deadline stratégique** : Septembre 2026 (réglementation e-facture Factur-X)
- **Landing page** : https://devis-flow.fr

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 16.2.2 (React 19.2.4) |
| Langage | TypeScript 5 |
| Styling | Tailwind CSS 4 + Geist font |
| AI | Anthropic Claude API (SDK 0.82.0) |
| Auth & DB | Supabase (PostgreSQL) |
| Email | Resend API |
| Paiements | Lemon Squeezy |
| Hosting | Vercel |

---

## Architecture des Fichiers

```
C:\Users\Natha\Desktop\devisflow\
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── _components/
│   │   │   └── NavAuth.tsx           # Navigation auth component
│   │   ├── admin/
│   │   │   └── page.tsx              # Admin dashboard
│   │   ├── agence/
│   │   │   ├── page.tsx              # Dashboard agences
│   │   │   └── InviteForm.tsx        # Formulaire invitation artisans
│   │   ├── api/
│   │   │   ├── auth/signup/
│   │   │   │   └── route.ts          # POST /api/auth/signup
│   │   │   ├── contact/
│   │   │   │   └── route.ts          # POST /api/contact
│   │   │   ├── generate-devis/
│   │   │   │   └── route.ts          # POST /api/generate-devis (Claude IA)
│   │   │   ├── invite-artisan/
│   │   │   │   └── route.ts          # POST /api/invite-artisan
│   │   │   └── send-devis/
│   │   │       └── route.ts          # POST /api/send-devis (email)
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts          # OAuth callback
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Page login
│   │   │   └── register/
│   │   │       └── page.tsx          # Page inscription
│   │   ├── contact/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Page contact/démo
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard artisan
│   │   │   ├── DevisTable.tsx        # Tableau des devis
│   │   │   └── LogoutButton.tsx
│   │   ├── devis/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Formulaire création devis + preview
│   │   ├── globals.css               # Styles globaux + variables CSS
│   │   ├── layout.tsx                # Root layout (SEO, metadata)
│   │   └── page.tsx                  # Landing page
│   ├── lib/
│   │   ├── supabase-browser.ts       # Client Supabase (use client)
│   │   ├── supabase-server.ts        # Client Supabase server (async cookies)
│   │   ├── supabase.ts               # Exports principaux
│   │   └── prospecting-email-template.html  # Template email prospection
│   └── proxy.ts                      # (fichier legacy)
├── public/
│   └── logo.svg                      # Logo DevisFlow
├── .env.local                        # Variables d'environnement
├── next.config.ts
├── package.json
├── tailwind.config (via PostCSS)
├── tsconfig.json
├── CLAUDE.md                         # Contexte projet
└── AGENTS.md                         # Notes Next.js
```

---

## Schéma Base de Données (Supabase)

### Tables principales

**profiles**
```sql
id: uuid (PK, ref auth.users)
email: text
full_name: text
account_type: text ('artisan' | 'agence')
agence_id: uuid (nullable, ref profiles)
company_name: text
siret: text
phone: text
address: text
created_at: timestamp
```

**devis**
```sql
id: uuid (PK)
user_id: uuid (ref profiles, nullable pour visiteurs)
devis_number: text
artisan_name: text
artisan_email: text
artisan_phone: text
artisan_siret: text
client_name: text
client_email: text
total_ttc: numeric
profession: text
result_json: jsonb (full devis object)
created_at: timestamp
```

---

## Variables d'Environnement

```env
ANTHROPIC_API_KEY=sk-ant-api03-...        # Clé API Claude
RESEND_API_KEY=re_...                      # Clé API email
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...    # Pour RLS bypass
NEXT_PUBLIC_SITE_URL=https://devis-flow.fr
```

---

## Design System

### Couleurs (CSS Variables dans globals.css)
- `--navy: #1e3a5f` — Couleur principale (header, titres)
- `--navy-dark: #152d4a` — Footer
- `--orange: #f97316` — Accent/CTA
- `--orange-dark: #ea580c` — Hover states

### Typography
- Font: Geist (via next/font/google), fallback Arial/sans-serif

### Composants clés
- Boutons: `rounded-xl`, font-bold, couleur orange
- Cards: `rounded-2xl`, border-gray-100, shadow-sm
- Inputs: `rounded-xl`, focus ring navy

---

## Flow Utilisateur

### 1. Landing Page (`/`)
- Hero avec CTA "Essai gratuit 7 jours"
- Section avantages (3 cartes)
- Comment ça marche (3 étapes)
- Témoignages
- Pricing (Artisan 29€/mois vs Agence 299€/mois)
- FAQ (accordéon)
- CTA final

### 2. Création Devis (`/devis`)
Formulaire multi-sections :
1. **Vos informations** — Nom/SIRET/téléphone/adresse/email/logo upload
2. **Informations client** — Nom/adresse/téléphone/email
3. **Description des travaux** — Textarea libre
4. **Matériaux** — Liste dynamique (description/qté/prix HT)
5. **Main d'œuvre** — Heures, taux horaire, TVA (10%/20%), validité
6. **Notes personnalisées** — Optionnel (remplace notes IA)

→ Submit → API `/api/generate-devis` → Claude IA génère JSON → Preview du devis

### 3. Preview Devis
Affichage professionnel avec :
- Header print/email/WhatsApp
- Document devis (printable)
- Actions : Imprimer, Email, WhatsApp
- Sauvegarde auto en base

### 4. Dashboard (`/dashboard`)
- Stats (nb devis, volume TTC, dernier devis)
- Tableau historique des devis
- Bouton "Nouveau devis"

---

## API Endpoints

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/signup` | POST | Création compte avec profil |
| `/api/generate-devis` | POST | Génère devis via Claude IA |
| `/api/send-devis` | POST | Envoie devis par email (Resend) |
| `/api/invite-artisan` | POST | Agence invite un artisan |
| `/api/contact` | POST | Formulaire contact/démo |
| `/auth/callback` | GET | OAuth callback Supabase |

---

## Logique de Génération de Devis

Fichier: `src/app/api/generate-devis/route.ts`

1. **Validation** des champs obligatoires
2. **Prompt engineering** vers Claude (sonnet-4-6)
3. **Claude génère JSON** avec:
   - Lignes de devis détaillées
   - Notes professionnelles
   - Mentions légales françaises
4. **Fallback** si Claude échoue → calcul manuel
5. **Calcul** totaux HT/TVA/TTC
6. **Sauvegarde** dans Supabase (table `devis`)
7. **Retourne** objet `DevisResult` complet

### Format DevisResult
```typescript
{
  devisNumber: string;     // DEV-YYYYMM-XXXX
  date: string;
  validUntil: string;
  artisan: { name, siret, address?, phone?, email?, logoBase64? };
  client: { name, address, phone, email };
  lines: [{ description, quantity, unitPrice, total }];
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  notes: string;
  legalMentions: string;
}
```

---

## Authentification

- **Provider**: Supabase Auth
- **Méthodes**: Email/password + OAuth (Google, etc.)
- **Session**: Cookie-based avec SSR
- **Types de compte**: 
  - `artisan` — Accès dashboard + création devis
  - `agence` — Dashboard multi-artisans + invitations

### Clients Supabase
```typescript
// Browser (use client)
createSupabaseBrowser()

// Server (async cookies)
createSupabaseServer()

// Admin (bypass RLS)
createSupabaseAdmin()
```

---

## Emails

### Template de prospection
Fichier: `src/lib/prospecting-email-template.html`
- Design HTML professionnel
- Couleurs brand (navy/orange)
- CTA orange: "Essayer gratuitement 7 jours →"
- Signature avec logo base64 inline
- Unsubscribe: "Se désinscrire : répondez STOP"

### Envoi de devis
API: `/api/send-devis`
- Service: Resend
- Format: HTML professionnel du devis
- Pièce jointe: Non (lien vers preview)

---

## Monétisation

| Plan | Prix | Cible |
|------|------|-------|
| Artisan | 29€/mois | Indépendants (plombiers, électriciens...) |
| Agences | 299€+/mois | Cabinets comptables, fédérations, groupements BTP |

- Essai gratuit: **7 jours**
- Paiement: Lemon Squeezy
- Pas de CB requise pour l'essai

---

## Contraintes Techniques Importantes

1. **Next.js 16 Breaking Changes** — Lire `AGENTS.md` avant dev
2. **Cookies async** — `cookies()` est async dans Next.js 16
   ```typescript
   const store = await cookies();
   ```
3. **RLS Supabase** — Utiliser `createSupabaseAdmin()` pour opérations serveur
4. **Tailwind 4** — Nouvelle syntaxe `@import "tailwindcss"`

---

## Scripts utiles

```bash
# Dev server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Roadmap/Fonctionnalités Futures

- [ ] Relances automatiques J+3 et J+7
- [ ] Conformité e-facture Factur-X
- [ ] Signature électronique
- [ ] API publique pour agences
- [ ] Marque blanche
- [ ] Intégration logiciels comptables

---

## Contact / Support

- **Email**: noreply@devis-flow.fr
- **Fondateur**: Nathan Makambo
- **Site**: https://devis-flow.fr

---

*Document créé le 2026-04-08 — À jour avec la codebase actuelle*
