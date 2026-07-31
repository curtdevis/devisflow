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

interface SearchResponse {
  places?: RawPlace[];
  nextPageToken?: string;
}

async function searchTextPage(
  apiKey: string,
  textQuery: string,
  pageToken?: string
): Promise<SearchResponse> {
  const res = await fetch(PLACES_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK + ",nextPageToken",
    },
    // Google requires every field from the original request to stay
    // identical across pages — only maxResultCount/pageSize/pageToken may
    // change — so textQuery must be resent on page 2+, not just page 1.
    body: JSON.stringify(
      pageToken
        ? { textQuery, languageCode: "fr", maxResultCount: 20, pageToken }
        : { textQuery, languageCode: "fr", maxResultCount: 20 }
    ),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Places request failed (${res.status}): ${text.slice(0, 500)}`);
  }

  return (await res.json()) as SearchResponse;
}

/**
 * Searches one category in one location (e.g. "plombier Lyon"). Google
 * Places Text Search caps each request at 20 results and ranks results by
 * relevance to the query text — a bare "{category} France" query returns
 * near-identical top-20 listings run after run, which is why the daily
 * prospecting pool dried up after a few days on a single national query
 * (see scrapeCategoryStep in scripts/daily-prospecting.ts, which now calls
 * this once per city instead). Pagination (up to 3 pages / 60 results) via
 * `nextPageToken` — Google requires a short delay before a token is valid,
 * hence the sleep between pages.
 */
export async function searchBusinessesByCategory(
  category: string,
  location: string,
  maxResults: number
): Promise<BusinessPlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY manquant");

  const allRaw: RawPlace[] = [];
  let pageToken: string | undefined;
  const maxPages = Math.ceil(Math.min(maxResults, 60) / 20);

  for (let page = 0; page < maxPages; page++) {
    if (page > 0) {
      if (!pageToken) break;
      // Places API (New) returns the token immediately but it isn't valid
      // for a couple of seconds — a request before that returns an error.
      await new Promise((r) => setTimeout(r, 2500));
    }
    const data = await searchTextPage(apiKey, `${category} ${location}`, page > 0 ? pageToken : undefined);
    allRaw.push(...(data.places ?? []));
    pageToken = data.nextPageToken;
    if (allRaw.length >= maxResults || !pageToken) break;
  }

  // Skip permanently/temporarily closed listings — a site can still resolve
  // and have a mailto: link long after the business itself has shut down.
  const openPlaces = allRaw.filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY" && p.businessStatus !== "CLOSED_TEMPORARILY");

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
