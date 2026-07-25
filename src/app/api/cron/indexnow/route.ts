import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";
const INDEXNOW_KEY = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4";

// Vercel Cron — submits every sitemap URL to IndexNow (Bing/Yandex/Naver)
// so they're notified of changes instead of waiting for a recrawl.
// The key file at public/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4.txt already
// existed but nothing was submitting to the API — this closes that gap.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`, { cache: "no-store" });
  const sitemapXml = await sitemapRes.text();
  const urlList = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  if (urlList.length === 0) {
    return NextResponse.json({ ok: false, error: "No URLs found in sitemap.xml" }, { status: 500 });
  }

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  return NextResponse.json({
    ok: res.ok,
    status: res.status,
    submittedUrls: urlList.length,
    submittedAt: new Date().toISOString(),
  });
}
