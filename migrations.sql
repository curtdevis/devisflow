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
