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
