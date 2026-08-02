import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { fetchWebsiteData, personalizeEmail, buildEmailHtml } from "@/lib/prospecting-personalize";

const SEND_FROM = "DevisFlow <equipe@devis-flow.fr>";
const PREVIEW_TO = "nathan.makambo23@gmail.com";
const DEFAULT_SITE = "https://www.horizon-electrique.fr/";

/**
 * Manual-only debug endpoint (CRON_SECRET-protected, not wired to any cron)
 * — runs the real prospecting personalization pipeline (fetchWebsiteData +
 * personalizeEmail, same Gemini call as production sends) against a given
 * site and emails the result to the account owner, so copy changes can be
 * eyeballed in an actual inbox instead of just read as prompt text.
 * GEMINI_API_KEY is a Vercel "Sensitive" env var, unreadable locally — this
 * has to run on the deployed environment to use the real key.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = request.nextUrl.searchParams.get("site") ?? DEFAULT_SITE;

  const { text } = await fetchWebsiteData(site);
  if (!text) {
    return NextResponse.json({ error: `Could not fetch/extract text from ${site}` }, { status: 502 });
  }

  const email = await personalizeEmail(site, text);
  if (!email) {
    return NextResponse.json({ error: "personalizeEmail returned null" }, { status: 502 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: SEND_FROM,
    to: PREVIEW_TO,
    replyTo: "equipe@devis-flow.fr",
    subject: `[APERÇU] ${email.subject}`,
    text: email.body,
    html: buildEmailHtml(email.body, "preview"),
    headers: {
      "List-Unsubscribe": "<mailto:equipe@devis-flow.fr?subject=STOP>",
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true, resendId: data?.id, site, subject: email.subject, body: email.body });
}
