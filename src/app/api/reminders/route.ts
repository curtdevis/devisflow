import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const anthropic = new Anthropic();
const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";

function esc(s: string | number | null | undefined): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Called by Vercel cron — daily at 9:00 AM Europe/Paris (07:00 UTC)
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const now = new Date().toISOString();

  // Fetch devis with reminders that are due
  const { data: dueDevis, error } = await admin
    .from("devis")
    .select(
      "id, devis_number, artisan_name, artisan_email, client_name, client_email, total_ttc, reminder_frequency_days, reminder_max_count, reminder_count, reminder_tone, result_json"
    )
    .eq("reminder_enabled", true)
    .lte("reminder_next_date", now)
    .not("client_email", "is", null);

  if (error) {
    console.error("[reminders] query error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter where reminder_count < reminder_max_count (column comparison not supported in JS client)
  const eligible = (dueDevis ?? []).filter(
    (d) => (d.reminder_count ?? 0) < (d.reminder_max_count ?? 2)
  );

  console.log(`[reminders] ${eligible.length} reminders due (of ${dueDevis?.length ?? 0} fetched)`);

  if (eligible.length === 0) {
    return NextResponse.json({ sent: 0, message: "No reminders due" });
  }

  let sent = 0;
  let errors = 0;

  for (const devis of eligible as ReminderDevis[]) {
    try {
      const emailHtml = await generateReminderEmail(devis);
      const subject = buildSubject(devis.reminder_tone, devis.artisan_name, devis.reminder_count + 1);

      const { error: emailError } = await resend.emails.send({
        from: "noreply@devis-flow.fr",
        to: devis.client_email,
        replyTo: devis.artisan_email ?? undefined,
        subject,
        html: emailHtml,
      });

      if (emailError) {
        console.error(`[reminders] email error for devis ${devis.id}:`, emailError);
        errors++;
        continue;
      }

      const nextCount = (devis.reminder_count ?? 0) + 1;
      const isLast = nextCount >= (devis.reminder_max_count ?? 2);
      const nextDate = isLast
        ? null
        : new Date(Date.now() + (devis.reminder_frequency_days ?? 3) * 24 * 60 * 60 * 1000).toISOString();

      await admin.from("devis").update({
        reminder_count: nextCount,
        reminder_next_date: nextDate,
        reminder_enabled: !isLast,
      }).eq("id", devis.id);

      sent++;
      console.log(`[reminders] sent to ${devis.client_email} for devis ${devis.devis_number}`);
    } catch (err) {
      console.error(`[reminders] error for devis ${devis.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({ sent, errors, total: eligible.length });
}

function buildSubject(tone: string | null, artisanName: string, attempt: number): string {
  if (tone === "urgent") {
    return `⚠ Votre devis expire bientôt — réponse souhaitée`;
  }
  if (tone === "amical") {
    return attempt === 1
      ? `Avez-vous eu le temps de consulter notre devis ?`
      : `Dernière relance — votre devis vous attend`;
  }
  return `Relance devis — ${artisanName}`;
}

interface ReminderDevis {
  id: string;
  devis_number: string | null;
  artisan_name: string;
  artisan_email: string | null;
  client_name: string;
  client_email: string;
  total_ttc: number | null;
  reminder_tone: string | null;
  reminder_count: number;
  reminder_frequency_days: number | null;
  reminder_max_count: number | null;
  result_json: {
    lines?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  } | null;
}

async function generateReminderEmail(devis: ReminderDevis): Promise<string> {
  const toneMap: Record<string, string> = {
    professionnel: "professionnel et courtois",
    amical: "chaleureux et amical",
    urgent: "direct et urgent, en soulignant l'importance de répondre rapidement",
  };
  const toneDesc = toneMap[devis.reminder_tone ?? "professionnel"] ?? "professionnel et courtois";
  const attemptNum = (devis.reminder_count ?? 0) + 1;

  const prompt = `Tu rédiges un court email de relance de devis pour un artisan français. L'email doit être ${toneDesc}.

Informations :
- Artisan : ${devis.artisan_name}
- Client : ${devis.client_name}
- Numéro de devis : ${devis.devis_number ?? "–"}
- Montant TTC : ${devis.total_ttc ? `${devis.total_ttc.toFixed(2)} €` : "voir devis"}
- Relance n° : ${attemptNum}

Génère UNIQUEMENT 2-3 phrases de corps d'email en HTML simple (balises <p> uniquement, pas de html/head/body).
L'email commence par "Bonjour ${devis.client_name}," et finit par "Cordialement," suivi du nom de l'artisan.`;

  const linesTable = buildLinesTable(devis);

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });
    const body = message.content[0].type === "text" ? message.content[0].text : fallbackBody(devis);
    return wrapTemplate(body, linesTable, devis.artisan_name, devis.artisan_email);
  } catch {
    return wrapTemplate(fallbackBody(devis), linesTable, devis.artisan_name, devis.artisan_email);
  }
}

function buildLinesTable(devis: ReminderDevis): string {
  const lines = devis.result_json?.lines;
  if (!lines || lines.length === 0) return "";

  const rows = lines
    .slice(0, 5)
    .map(
      (l) =>
        `<tr>
          <td style="padding:6px 12px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6;">${esc(l.description)}</td>
          <td style="padding:6px 12px;font-size:12px;color:#6b7280;text-align:right;border-bottom:1px solid #f3f4f6;">${esc(l.quantity)}</td>
          <td style="padding:6px 12px;font-size:12px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #f3f4f6;">${l.total.toFixed(2)} €</td>
        </tr>`
    )
    .join("");

  return `
<div style="margin:16px 0;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#1e3a5f;">
        <th style="padding:8px 12px;text-align:left;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">Prestation</th>
        <th style="padding:8px 12px;text-align:right;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:40px;">Qté</th>
        <th style="padding:8px 12px;text-align:right;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:90px;">Total HT</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:8px 12px;font-size:13px;font-weight:700;color:#1e3a5f;">Total TTC</td>
        <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#1e3a5f;text-align:right;">${devis.total_ttc ? `${devis.total_ttc.toFixed(2)} €` : "—"}</td>
      </tr>
    </tfoot>
  </table>
</div>`;
}

function fallbackBody(devis: {
  devis_number: string | null;
  client_name: string;
  artisan_name: string;
  total_ttc: number | null;
}): string {
  return `<p>Bonjour ${esc(devis.client_name)},</p>
<p>Je me permets de revenir vers vous au sujet du devis <strong>${esc(devis.devis_number)}</strong>${devis.total_ttc ? ` d'un montant de ${devis.total_ttc.toFixed(2)} € TTC` : ""} que je vous ai adressé récemment.</p>
<p>N'hésitez pas à me contacter pour toute question.</p>
<p>Cordialement,<br>${esc(devis.artisan_name)}</p>`;
}

function wrapTemplate(body: string, linesTable: string, artisanName: string, artisanEmail: string | null): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
  <p style="font-size:20px;font-weight:900;color:#1e3a5f;margin:0 0 24px;">
    Devis<span style="color:#f97316;">Flow</span>
  </p>
  <div style="background:#ffffff;border-radius:12px;padding:24px;margin-bottom:16px;line-height:1.7;color:#374151;">
    ${body}
    ${linesTable}
  </div>
  <hr style="border:none;border-top:2px solid #f97316;margin:0 0 16px;" />
  <p style="color:#6b7280;font-size:13px;margin:0;">
    ${esc(artisanName)}${artisanEmail ? ` &nbsp;·&nbsp; <a href="mailto:${esc(artisanEmail)}" style="color:#f97316;text-decoration:none;">${esc(artisanEmail)}</a>` : ""}
  </p>
  <p style="color:#9ca3af;font-size:11px;margin-top:16px;">
    Cet email a été envoyé via <a href="${SITE_URL}" style="color:#9ca3af;">DevisFlow</a>
  </p>
</div>
`;
}
