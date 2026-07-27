export type ArtisanStat = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  profession: string | null;
  devisThisMonth: number;
  volumeThisMonth: number;
  devisTotal: number;
  volumeTotal: number;
  lastActivity: string | null;
  isActive: boolean;
};

export type DevisRow = {
  id: string;
  created_at: string;
  devis_number: string | null;
  artisan_name: string | null;
  client_name: string | null;
  total_ttc: number | null;
  profession: string | null;
  user_id: string;
};

export type ArtisanFull = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  siret: string | null;
  profession: string | null;
  devisThisMonth: number;
  volumeThisMonth: number;
  devisTotal: number;
  volumeTotal: number;
  lastActivity: string | null;
  isActive: boolean;
};

export type AgenceDevisRow = {
  id: string;
  created_at: string;
  devis_number: string | null;
  artisan_name: string | null;
  artisan_id: string;
  artisan_display: string;
  client_name: string | null;
  client_email: string | null;
  total_ttc: number | null;
  profession: string | null;
};

export type ArtisanOption = { id: string; label: string };

export type MonthlyData = {
  month: string;
  label: string;
  devisCount: number;
  volume: number;
};

export type ArtisanRapport = {
  id: string;
  name: string;
  devisTotal: number;
  volumeTotal: number;
  profession: string | null;
};

export type Invitation = {
  id: string;
  token: string;
  email: string;
  agence_name: string;
  accepted_at: string | null;
  created_at: string;
};
