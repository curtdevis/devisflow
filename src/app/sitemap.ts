import type { MetadataRoute } from "next";

const BASE = "https://devis-flow.fr";

// Real per-page last-modified dates instead of `new Date()` evaluated on
// every request — the latter made every page look like it changed at the
// exact moment it was crawled, which is a misleading freshness signal.
// Update a page's date here when its content actually changes.
const PAGE_DATES: Record<string, string> = {
  "/": "2026-07-25",
  "/cabinets-experts-comptables": "2026-07-25",
  "/comparatif": "2026-07-25",
  "/devis-plombier": "2026-07-25",
  "/devis-electricien": "2026-07-25",
  "/devis-peintre": "2026-07-25",
  "/devis-macon": "2026-07-25",
  "/devis-carreleur": "2026-07-25",
  "/facture-electronique-artisan-2026": "2026-07-25",
  "/cgu": "2026-04-18",
  "/confidentialite": "2026-04-18",
  "/mentions-legales": "2026-04-18",
  "/contact": "2026-07-24",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: PAGE_DATES["/"], changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/cabinets-experts-comptables`, lastModified: PAGE_DATES["/cabinets-experts-comptables"], changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/comparatif`, lastModified: PAGE_DATES["/comparatif"], changeFrequency: "monthly", priority: 0.7 },
    // Artisans BTP
    { url: `${BASE}/devis-plombier`, lastModified: PAGE_DATES["/devis-plombier"], changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-electricien`, lastModified: PAGE_DATES["/devis-electricien"], changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-peintre`, lastModified: PAGE_DATES["/devis-peintre"], changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-macon`, lastModified: PAGE_DATES["/devis-macon"], changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-carreleur`, lastModified: PAGE_DATES["/devis-carreleur"], changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/facture-electronique-artisan-2026`, lastModified: PAGE_DATES["/facture-electronique-artisan-2026"], changeFrequency: "monthly", priority: 0.75 },
    // Legal
    { url: `${BASE}/cgu`, lastModified: PAGE_DATES["/cgu"], changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/confidentialite`, lastModified: PAGE_DATES["/confidentialite"], changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/mentions-legales`, lastModified: PAGE_DATES["/mentions-legales"], changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: PAGE_DATES["/contact"], changeFrequency: "yearly", priority: 0.4 },
  ];
}
