// Google Places API (New) — Text Search, replaces the Apify Google Maps
// Scraper (src/lib/apify.ts, removed 2026-07-30). Apify billed per compute
// unit and the free $5/month quota was exhausted after a single day of
// prospecting; Places API Text Search gives 5,000 free calls/month, and this
// project uses ~10/day (one per category) — effectively free at this volume.
// Unlike Apify's "scrapeContacts" add-on, Places API never returns emails —
// see extractEmailFromCleanedHtml in prospecting-personalize.ts for how
// emails are found instead (scraped from the business's own site, never
// guessed).

const PLACES_API_BASE = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.displayName",
  "places.websiteUri",
  "places.internationalPhoneNumber",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.editorialSummary",
  "places.businessStatus",
].join(",");

export interface BusinessPlace {
  companyName: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  googleRating: number | null;
  reviewCount: number | null;
  description: string | null;
}

interface RawPlace {
  displayName?: { text?: string };
  websiteUri?: string;
  internationalPhoneNumber?: string;
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  editorialSummary?: { text?: string };
  businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
}

export async function searchBusinessesByCategory(
  category: string,
  maxResults: number
): Promise<BusinessPlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY manquant");

  const res = await fetch(PLACES_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${category} France`,
      languageCode: "fr",
      maxResultCount: Math.min(maxResults, 20),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Places request failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as { places?: RawPlace[] };

  // Skip permanently/temporarily closed listings — a site can still resolve
  // and have a mailto: link long after the business itself has shut down.
  const openPlaces = (data.places ?? []).filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY" && p.businessStatus !== "CLOSED_TEMPORARILY");

  return openPlaces.slice(0, maxResults).map((p) => ({
    companyName: p.displayName?.text ?? "Sans nom",
    website: p.websiteUri ?? null,
    phone: p.internationalPhoneNumber ?? null,
    address: p.formattedAddress ?? null,
    googleRating: p.rating ?? null,
    reviewCount: p.userRatingCount ?? null,
    description: p.editorialSummary?.text ?? null,
  }));
}
