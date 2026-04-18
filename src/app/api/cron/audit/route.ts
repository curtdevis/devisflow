import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";
const ALERT_EMAIL = process.env.CONTACT_EMAIL ?? "nathan.makambo23@gmail.com";

// Vercel Cron — audit quotidien 9h00 UTC (11h Paris)
// Vérifie que le site est up, contrôle les métriques clés, alerte par email si problème
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issues: string[] = [];
  const stats: Record<string, number | string> = {};

  // ── 1. Vérifier que la landing page répond ──────────────────────────────
  try {
    const res = await fetch(SITE_URL, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    if (!res.ok) issues.push(`Landing page retourne ${res.status}`);
    else stats.landing = res.status;
  } catch {
    issues.push("Landing page inaccessible (timeout ou erreur réseau)");
    stats.landing = "TIMEOUT";
  }

  // ── 2. Vérifier que l'API generate-devis valide correctement ───────────
  try {
    const res = await fetch(`${SITE_URL}/api/generate-devis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(8000),
    });
    // Doit retourner 400 sur corps vide — si 500, c'est un bug
    if (res.status === 500) issues.push("API generate-devis retourne 500 sur corps vide");
    stats.generateDevis = res.status;
  } catch {
    issues.push("API generate-devis inaccessible");
    stats.generateDevis = "TIMEOUT";
  }

  // ── 3. Métriques Supabase ───────────────────────────────────────────────
  try {
    const admin = createSupabaseAdmin();
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const [{ count: devisCount }, { count: userCount }] = await Promise.all([
      admin.from("devis").select("id", { count: "exact", head: true }).gte("created_at", monthStart)
        .then(r => ({ count: r.count ?? 0 })),
      admin.from("profiles").select("id", { count: "exact", head: true })
        .then(r => ({ count: r.count ?? 0 })),
    ]);

    stats.devisCeMois = devisCount;
    stats.utilisateursTotaux = userCount;
  } catch (e) {
    issues.push(`Erreur Supabase : ${e instanceof Error ? e.message : "inconnue"}`);
  }

  // ── 4. Envoyer un email d'alerte si problèmes ──────────────────────────
  const hasIssues = issues.length > 0;

  if (hasIssues) {
    await resend.emails.send({
      from: "cron@devis-flow.fr",
      to: ALERT_EMAIL,
      subject: `🚨 DevisFlow — ${issues.length} problème(s) détecté(s)`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fef2f2;border-radius:16px;border:2px solid #fca5a5;">
          <p style="font-size:22px;font-weight:900;color:#1e3a5f;margin:0 0 8px">
            Devis<span style="color:#f97316">Flow</span> — Alerte
          </p>
          <h2 style="color:#dc2626;font-size:18px;margin:16px 0 12px">${issues.length} problème(s) détecté(s)</h2>
          <ul style="color:#374151;font-size:14px;line-height:2">
            ${issues.map(i => `<li>${i}</li>`).join("")}
          </ul>
          <hr style="border:none;border-top:1px solid #fca5a5;margin:20px 0">
          <h3 style="color:#1e3a5f;font-size:14px;margin:0 0 8px">Métriques du jour</h3>
          <table style="width:100%;font-size:13px;color:#6b7280">
            ${Object.entries(stats).map(([k, v]) => `<tr><td>${k}</td><td style="text-align:right;font-weight:700;color:#1e3a5f">${v}</td></tr>`).join("")}
          </table>
          <p style="color:#9ca3af;font-size:11px;margin-top:20px">Audit automatique — ${new Date().toLocaleString("fr-FR")}</p>
        </div>
      `,
    }).catch(() => null);
  }

  return NextResponse.json({
    ok: !hasIssues,
    issues,
    stats,
    auditedAt: new Date().toISOString(),
  });
}
