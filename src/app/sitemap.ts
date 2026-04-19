import type { MetadataRoute } from "next";

const BASE = "https://devis-flow.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/entrepreneur`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/comparatif`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Artisans BTP
    { url: `${BASE}/devis-plombier`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-electricien`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-peintre`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-macon`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-carreleur`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/facture-electronique-artisan-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    // Entrepreneur événementiel
    { url: `${BASE}/devis-traiteur`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-photographe`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-dj-animateur`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-decorateur-evenementiel`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/devis-wedding-planner`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Legal
    { url: `${BASE}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
