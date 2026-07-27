import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord — DevisFlow",
  description: "Gérez vos devis, factures et clients depuis votre tableau de bord DevisFlow.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
