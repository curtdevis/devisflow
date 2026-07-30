// Campaign attribution shared between the pageview tracker (VisitorTracker)
// and the signup flow (register page + auth callback) — captures which
// campaign (utm_source/medium/campaign) first brought a visitor in, and
// keeps it available for the rest of the browser session so it's still
// there by the time they sign up, even after an OAuth redirect round trip.

const STORAGE_KEY = "df_attribution";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const EMPTY: Attribution = { utm_source: null, utm_medium: null, utm_campaign: null };

/**
 * Reads utm_* params from the current URL and, if present, persists them as
 * first-touch attribution for the rest of the session. If the URL has none,
 * returns whatever was already stored (or all-null if nothing ever was).
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY;

  // Already-stored attribution wins — true first-touch. Without this check, a
  // visitor who arrived via one campaign and later clicks a second tagged
  // link in the same session would have their attribution overwritten by
  // whichever link they clicked last, not first.
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    // ignore malformed/inaccessible storage, fall through to URL parsing
  }

  const params = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };

  if (fromUrl.utm_source) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      // sessionStorage unavailable (private browsing etc.) — just use this pageview's value
    }
    return fromUrl;
  }

  return EMPTY;
}
