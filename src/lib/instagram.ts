// Instagram Graph API for the DevisFlow business account (@devis.flow).
//
// The access token was issued via Instagram Login (App ID 1726768611869005,
// "DevisFlow CM"), not classic Facebook Login — it only works against
// graph.instagram.com, NOT graph.facebook.com. Mixing the two is the most
// common way this integration breaks; see .claude/agents/community-manager.md.

const IG_API_BASE = "https://graph.instagram.com/v19.0";

function getConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!accessToken) throw new Error("INSTAGRAM_ACCESS_TOKEN manquant");
  if (!businessAccountId) throw new Error("INSTAGRAM_BUSINESS_ACCOUNT_ID manquant");
  return { accessToken, businessAccountId };
}

async function graphPost(path: string, params: Record<string, string>): Promise<{ id: string }> {
  const { accessToken } = getConfig();
  const res = await fetch(`${IG_API_BASE}/${path}`, {
    method: "POST",
    body: new URLSearchParams({ ...params, access_token: accessToken }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Instagram API error on ${path}: ${data.error?.message ?? res.statusText}`);
  }
  return data;
}

/**
 * Creates a media container and publishes it. Instagram sometimes reports
 * "content isn't ready" on the very first publish attempt right after
 * container creation (real observed behavior, not documented) — retry a
 * few times with a short delay rather than failing the whole post.
 */
async function publishContainer(containerId: string): Promise<string> {
  const { businessAccountId } = getConfig();
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await graphPost(`${businessAccountId}/media_publish`, { creation_id: containerId });
      return res.id;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 8000));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Publication Instagram échouée après plusieurs tentatives");
}

export async function publishImagePost(imageUrl: string, caption: string): Promise<string> {
  const { businessAccountId } = getConfig();
  const container = await graphPost(`${businessAccountId}/media`, { image_url: imageUrl, caption });
  return publishContainer(container.id);
}

export async function publishStory(imageUrl: string): Promise<string> {
  const { businessAccountId } = getConfig();
  const container = await graphPost(`${businessAccountId}/media`, { image_url: imageUrl, media_type: "STORIES" });
  return publishContainer(container.id);
}

/**
 * Instagram Login access tokens are long-lived (~60 days) but not eternal.
 * Call this periodically (the daily workflow does it automatically) to
 * extend validity by another 60 days before it expires.
 */
export async function refreshAccessToken(): Promise<{ accessToken: string; expiresInSeconds: number }> {
  const { accessToken } = getConfig();
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?${new URLSearchParams({
      grant_type: "ig_refresh_token",
      access_token: accessToken,
    })}`
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Instagram token refresh failed: ${data.error?.message ?? res.statusText}`);
  }
  return { accessToken: data.access_token, expiresInSeconds: data.expires_in };
}
