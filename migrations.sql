-- DevisFlow — SQL Migrations
-- Run these in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Add columns to devis table
ALTER TABLE devis ADD COLUMN IF NOT EXISTS signature_data TEXT;
ALTER TABLE devis ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
ALTER TABLE devis ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE devis ADD COLUMN IF NOT EXISTS result_json JSONB;

-- 2. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id       UUID REFERENCES devis(id) ON DELETE SET NULL,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  status         TEXT DEFAULT 'pending',  -- pending | paid | overdue
  paid_at        TIMESTAMPTZ,
  result_json    JSONB
);

-- RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- 3. Clients table
CREATE TABLE IF NOT EXISTS clients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- 4. Index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_devis_id ON invoices(devis_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(user_id, name);

-- Partial index for reminder cron — only scans rows where reminders are due
CREATE INDEX IF NOT EXISTS idx_devis_reminder_next_date
  ON devis(reminder_next_date)
  WHERE reminder_enabled = true;

-- 5. Prospecting — weekly outreach automation (scripts/weekly-prospecting.ts)
-- Internal system tables: no end-user owns these rows, so RLS is enabled with
-- no policies — only the Supabase admin client (service role) can read/write.
CREATE TABLE IF NOT EXISTS prospecting_sent (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  category     TEXT NOT NULL,
  company_name TEXT,
  sent_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE prospecting_sent ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS prospecting_blacklist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE prospecting_blacklist ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_prospecting_sent_email ON prospecting_sent(email);
CREATE INDEX IF NOT EXISTS idx_prospecting_blacklist_email ON prospecting_blacklist(email);

-- 6. Suivi des visites du site (compteur "visiteurs en ligne" du dashboard admin).
-- Aucun identifiant persistant cote client (pas de cookie) : session_id est
-- genere en memoire a chaque chargement de page, donc pas de suivi entre
-- visites — uniquement un decompte des pages vues actives sur une fenetre glissante.
CREATE TABLE IF NOT EXISTS site_visits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  path       TEXT NOT NULL,
  referrer   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);

-- 7. Geolocalisation + appareil, pour la carte monde et le detail des visiteurs
-- du dashboard admin. Valeurs derivees des en-tetes geo Vercel (gratuit, deja
-- fourni par la plateforme) et du User-Agent — aucun service tiers de geo-IP.
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS os TEXT;

-- 8. Temps passe sur la page (pour voir sur quelles pages les visiteurs
-- s'attardent). Rempli via un beacon envoye au changement de page ou a la
-- fermeture de l'onglet — reste NULL si la visite n'a pas ete "fermee"
-- proprement (rare, sendBeacon est fiable sur pagehide).
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- 9. Reinitialisation des compteurs du dashboard admin (Devis generes,
-- Artisans uniques, Volume TTC total) SANS toucher aux devis reels : le
-- dashboard ne compte que les devis crees apres reset_at pour ces 3 cartes.
-- Le tableau "Tous les devis" plus bas reste, lui, toujours complet.
-- admin_stats_snapshots garde un historique des valeurs juste avant chaque
-- reset, pour ne rien perdre.
CREATE TABLE IF NOT EXISTS admin_stats_reset (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  reset_at   TIMESTAMPTZ NOT NULL,
  CONSTRAINT admin_stats_reset_single_row CHECK (id = 1)
);
ALTER TABLE admin_stats_reset ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS admin_stats_snapshots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_count    INTEGER NOT NULL,
  artisans_count INTEGER NOT NULL,
  volume_ttc     NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_stats_snapshots ENABLE ROW LEVEL SECURITY;

-- 10. Intermédiaire "multi-utilisateurs" (self-service, max 2 membres,
-- distinct du systeme Cabinet & Groupement/agence_id qui reste inchange).
-- member_of, si rempli, rattache ce profil au compte proprietaire dont il
-- herite l'acces (plan/tier) — voir coveredByMember dans generate-devis et
-- reminders. team_invites n'a aucune policy RLS (comme prospecting_sent
-- etc. plus haut) : accessible uniquement via le client Supabase admin
-- server-side (src/app/api/team/*).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS member_of UUID REFERENCES profiles(id);

CREATE TABLE IF NOT EXISTS team_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at  TIMESTAMPTZ
);
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_profiles_member_of ON profiles(member_of);
CREATE INDEX IF NOT EXISTS idx_team_invites_owner_id ON team_invites(owner_id);

-- 11. member_of (section 10 above) was added with the implicit default FK
-- action (NO ACTION), which behaves like RESTRICT: an Intermédiaire owner
-- who still has linked team members would get a foreign key violation on
-- DELETE FROM profiles, and /api/account/delete does not check that error
-- before proceeding to delete the auth user — silently corrupting account
-- deletion for exactly the owners this feature is meant to serve. Detach
-- members instead of blocking the delete.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_member_of_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_member_of_fkey
  FOREIGN KEY (member_of) REFERENCES profiles(id) ON DELETE SET NULL;

-- 12. Delivery outcome tracking for prospecting emails. Until now
-- prospecting_sent.status was implicitly "the Resend API call did not
-- error", which is NOT the same as "actually delivered" — Resend accepts
-- the message and only reports bounces/complaints asynchronously via
-- webhook (see src/app/api/prospecting/delivery-events/route.ts). resend_id
-- lets that webhook find the right row; delivery_status starts at 'sent'
-- (API accepted) and moves to 'delivered' | 'bounced' | 'complained' as
-- events arrive — rows that never move past 'sent' are the ones Resend
-- accepted but never confirmed, worth investigating separately from hard
-- bounces.
ALTER TABLE prospecting_sent ADD COLUMN IF NOT EXISTS resend_id TEXT;
ALTER TABLE prospecting_sent ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent';
ALTER TABLE prospecting_sent ADD COLUMN IF NOT EXISTS delivery_updated_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_prospecting_sent_resend_id ON prospecting_sent(resend_id);

-- 13. Per-recipient click attribution for prospecting emails. Every
-- recipient's CTA/footer links previously carried the exact same
-- utm_source=prospecting URL, so a click only ever proved *someone* clicked
-- — never *which* prospect, since nothing distinguished one recipient's link
-- from another's. tracking_ref is a random token generated per send
-- (scripts/daily-prospecting.ts sendEmailStep), embedded in that email's
-- links (src/lib/prospecting-personalize.ts buildEmailHtml), and echoed
-- back on site_visits.ref when that link is opened (src/lib/attribution.ts,
-- src/app/api/track/route.ts) — joining the two tables on this token
-- identifies exactly which company/email clicked.
ALTER TABLE prospecting_sent ADD COLUMN IF NOT EXISTS tracking_ref TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospecting_sent_tracking_ref ON prospecting_sent(tracking_ref) WHERE tracking_ref IS NOT NULL;
ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS ref TEXT;
CREATE INDEX IF NOT EXISTS idx_site_visits_ref ON site_visits(ref) WHERE ref IS NOT NULL;

-- 14. Retargeting: prospects who clicked a cold email but never signed up
-- get one automatic follow-up with a genuine 14-day trial (vs the standard
-- 7), instead of just a repeat of the same message. retargeted_at marks a
-- prospecting_sent row as already retargeted (dedup — never send it twice).
-- profiles.trial_days is per-account so 8+ call sites across the app (see
-- src/lib/trial.ts) can honor an extended trial instead of the hardcoded 7
-- every one of them had independently. It is ONLY ever set to 14 by
-- src/app/auth/callback/route.ts, and only after re-validating server-side
-- that the signup's `ref` matches a prospecting_sent row with
-- retargeted_at IS NOT NULL — never trusted from client input directly.
ALTER TABLE prospecting_sent ADD COLUMN IF NOT EXISTS retargeted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_days INTEGER NOT NULL DEFAULT 7;
