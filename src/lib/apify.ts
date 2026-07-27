// Apify Google Maps Scraper (compass/crawler-google-places) via the REST API's
// run-sync-get-dataset-items endpoint — runs the actor and returns the scraped
// items in a single blocking HTTP call, no polling needed.
//
// Field names and the "scrapeContacts" input option (the real name of the
// email-enrichment add-on, confirmed against the actor's input schema and a
// live run's raw dataset output on 2026-07-28) — a prior "scrapeContactDetails"
// param name was silently ignored by the actor, so no place ever got an
// `emails` array and every prospect was filtered out downstream.

const ACTOR_ID = "compass~crawler-google-places";
const APIFY_API_BASE = "https://api.apify.com/v2";

export interface ApifyPlace {
  companyName: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  googleRating: number | null;
  reviewCount: number | null;
  description: string | null;
}

interface RawApifyPlace {
  title?: string;
  website?: string | null;
  phone?: string | null;
  phoneUnformatted?: string | null;
  address?: string | null;
  totalScore?: number | null;
  reviewsCount?: number | null;
  description?: string | null;
  // Present when the actor's "scrapeContacts" input option is enabled — it
  // visits the linked website and extracts contact info.
  emails?: string[];
}

export async function scrapeGoogleMapsCategory(
  category: string,
  maxResults: number
): Promise<ApifyPlace[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN manquant");

  const res = await fetch(
    `${APIFY_API_BASE}/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchStringsArray: [`${category} Île-de-France`],
        locationQuery: "Île-de-France, France",
        maxCrawledPlacesPerSearch: maxResults,
        language: "fr",
        scrapeContacts: true,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Apify run failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const items = (await res.json()) as RawApifyPlace[];

  return items
    .filter((item) => item.title)
    .slice(0, maxResults)
    .map((item) => ({
      companyName: item.title!,
      website: item.website ?? null,
      email: item.emails?.[0] ?? null,
      phone: item.phone ?? item.phoneUnformatted ?? null,
      address: item.address ?? null,
      googleRating: item.totalScore ?? null,
      reviewCount: item.reviewsCount ?? null,
      description: item.description ?? null,
    }));
}
