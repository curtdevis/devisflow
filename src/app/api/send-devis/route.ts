import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(s: string | number | null | undefined): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface DevisLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SendDevisRequest {
  recipientEmail: string;
  devis: {
    id?: string | null;
    devisNumber: string;
    date: string;
    validUntil: string;
    artisan: { name: string; siret: string; email?: string };
    client: { name: string; address: string; phone: string; email: string };
    lines: DevisLine[];
    subtotalHT: number;
    tvaRate: number;
    tvaAmount: number;
    totalTTC: number;
    notes: string;
    legalMentions: string;
  };
}

export async function POST(req: NextRequest) {
  let body: SendDevisRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { recipientEmail } = body;
  let devis = body.devis;

  if (!recipientEmail || !devis) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(recipientEmail)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const supabaseServer = await createSupabaseServer();
  const { data: { user } } = await supabaseServer.auth.getUser();

  // Verify ownership and rebuild the email content server-side — never trust
  // the client-submitted `devis` object once an id is given, otherwise
  // anyone who knows any existing devis id could relay arbitrary spam/phishing
  // content through devis-flow.fr's sending domain.
  if (devis.id) {
    const { data: stored } = await createSupabaseAdmin()
      .from("devis")
      .select("id, user_id, result_json, devis_number, artisan_name, artisan_email, client_name, total_ttc, created_at")
      .eq("id", devis.id)
      .single();

    if (!stored) {
      return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
    }
    if (stored.user_id && stored.user_id !== user?.id) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    const saved = stored.result_json as SendDevisRequest["devis"] | null;
    devis = saved
      ? { ...saved, id: stored.id }
      : {
          id: stored.id,
          devisNumber: stored.devis_number ?? "",
          date: stored.created_at ?? "",
          validUntil: "",
          artisan: { name: stored.artisan_name ?? "", siret: "", email: stored.artisan_email ?? undefined },
          client: { name: stored.client_name ?? "", address: "", phone: "", email: "" },
          lines: [],
          subtotalHT: 0,
          tvaRate: 0,
          tvaAmount: 0,
          totalTTC: stored.total_ttc ?? 0,
          notes: "",
          legalMentions: "",
        };
  } else if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Rate limit: 10 sends/hour for authenticated users (by account),
  // 5 sends/hour for anonymous senders (by IP, shares the rate_limits table
  // with generate-devis under a distinct key so the two quotas don't mix).
  try {
    if (user) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await createSupabaseAdmin()
        .from("devis")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", oneHourAgo);
      if ((count ?? 0) >= 10) {
        return NextResponse.json({ error: "Limite atteinte : 10 envois par heure." }, { status: 429 });
      }
    } else {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const admin = createSupabaseAdmin();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const key = `send-devis:${ip}`;
      const { count } = await admin
        .from("rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("ip", key)
        .gte("window_start", oneHourAgo);
      if ((count ?? 0) >= 5) {
        return NextResponse.json({ error: "Limite atteinte : 5 envois par heure." }, { status: 429 });
      }
      await admin.from("rate_limits").insert({ ip: key, window_start: new Date().toISOString(), count: 1 });
    }
  } catch (err) {
    console.warn("[send-devis] rate-limit check failed, allowing:", err);
  }

  const linesRows = devis.lines
    .map(
      (line, i) => `
      <tr style="background: ${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
        <td style="padding: 10px 14px; color: #374151; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${esc(line.description)}</td>
        <td style="padding: 10px 14px; text-align: right; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${esc(line.quantity)}</td>
        <td style="padding: 10px 14px; text-align: right; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${line.unitPrice.toFixed(2)} €</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: 600; color: #111827; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${line.total.toFixed(2)} €</td>
      </tr>`
    )
    .join("");

  const notesBlock = devis.notes
    ? `<div style="margin: 24px 0; padding: 14px 18px; background: #f3f4f6; border-left: 4px solid #1e3a5f; border-radius: 4px;">
        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 0.05em;">Notes</p>
        <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">${esc(devis.notes)}</p>
       </div>`
    : "";

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, sans-serif;">
  <div style="max-width: 680px; margin: 32px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: #1e3a5f; padding: 28px 36px;">
      <p style="margin: 0 0 4px; font-size: 22px; font-weight: 800; color: white;">
        Devis<span style="color: #f97316;">Flow</span>
      </p>
      <p style="margin: 0; font-size: 14px; color: #93c5fd;">Votre devis professionnel est prêt</p>
    </div>

    <!-- Intro -->
    <div style="padding: 28px 36px 0;">
      <p style="font-size: 15px; color: #111827; margin: 0 0 6px;">Bonjour <strong>${esc(devis.client.name)}</strong>,</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
        Veuillez trouver ci-dessous votre devis <strong>N° ${esc(devis.devisNumber)}</strong> établi par <strong>${esc(devis.artisan.name)}</strong>,
        d'un montant total de <strong style="color: #1e3a5f;">${devis.totalTTC.toFixed(2)} € TTC</strong>.
      </p>

      <!-- Meta -->
      <div style="display: flex; gap: 24px; margin-bottom: 28px; flex-wrap: wrap;">
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 18px; flex: 1; min-width: 140px;">
          <p style="margin: 0 0 2px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Émis le</p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${esc(devis.date)}</p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 18px; flex: 1; min-width: 140px;">
          <p style="margin: 0 0 2px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Valable jusqu'au</p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${esc(devis.validUntil)}</p>
        </div>
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 18px; flex: 1; min-width: 140px;">
          <p style="margin: 0 0 2px; font-size: 11px; color: #c2410c; text-transform: uppercase; letter-spacing: 0.05em;">Total TTC</p>
          <p style="margin: 0; font-size: 16px; font-weight: 800; color: #1e3a5f;">${devis.totalTTC.toFixed(2)} €</p>
        </div>
      </div>
    </div>

    <!-- Lines table -->
    <div style="padding: 0 36px;">
      <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #1e3a5f;">
            <th style="padding: 10px 14px; text-align: left; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Description</th>
            <th style="padding: 10px 14px; text-align: right; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; width: 50px;">Qté</th>
            <th style="padding: 10px 14px; text-align: right; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; width: 90px;">PU HT</th>
            <th style="padding: 10px 14px; text-align: right; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; width: 90px;">Total HT</th>
          </tr>
        </thead>
        <tbody>${linesRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="padding: 20px 36px; display: flex; justify-content: flex-end;">
      <table style="width: 260px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Sous-total HT</td>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280; text-align: right;">${devis.subtotalHT.toFixed(2)} €</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">TVA (${devis.tvaRate}%)</td>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280; text-align: right;">${devis.tvaAmount.toFixed(2)} €</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 10px 0 4px; font-size: 16px; font-weight: 800; color: #1e3a5f;">Total TTC</td>
          <td style="padding: 10px 0 4px; font-size: 16px; font-weight: 800; color: #1e3a5f; text-align: right;">${devis.totalTTC.toFixed(2)} €</td>
        </tr>
      </table>
    </div>

    <!-- Notes -->
    <div style="padding: 0 36px;">
      ${notesBlock}
    </div>

    <!-- Signature -->
    <div style="padding: 24px 36px; margin: 0 36px 28px; border: 2px solid #f97316; border-radius: 12px; background: #fff7ed; text-align: center;">
      <p style="margin: 0 0 14px; font-size: 13px; color: #374151;">Pour accepter ce devis, cliquez sur le bouton ci-dessous :</p>
      ${devis.id ? `<a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr"}/sign/${devis.id}" style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">✍️ Signer le devis en ligne →</a>` : `<p style="margin:0;font-size:13px;color:#6b7280;">Répondez à cet email avec la mention <strong>« Bon pour accord »</strong>.</p>`}
      ${devis.id ? `<div style="margin-top: 14px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr"}/sign/${devis.id}/telecharger" style="display:inline-block;background:#ffffff;color:#1e3a5f;font-weight:700;font-size:13px;padding:10px 24px;border-radius:10px;text-decoration:none;border:1px solid #fed7aa;">📄 Télécharger le devis (PDF)</a></div>` : ""}
      ${devis.id ? `<p style="margin: 12px 0 0; font-size: 11px; color: #9ca3af;">Ou copiez ce lien : ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr"}/sign/${devis.id}</p>` : ""}
    </div>

    <!-- Legal -->
    <div style="padding: 0 36px 28px;">
      <p style="font-size: 11px; color: #9ca3af; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 16px; margin: 0;">
        ${esc(devis.legalMentions)}
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 16px 36px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Devis généré par <strong style="color: #1e3a5f;">DevisFlow</strong> — Le générateur de devis IA pour les artisans français
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: "DevisFlow <equipe@devis-flow.fr>",
      to: recipientEmail,
      replyTo: devis.artisan.email ?? undefined,
      subject: `Votre devis N° ${devis.devisNumber} — ${devis.totalTTC.toFixed(2)} € TTC`,
      html: emailHtml,
    });

    // Confirm to the artisan that their devis was successfully sent.
    // Awaited (not fire-and-forget) — on serverless, an un-awaited promise
    // can get cut off once the handler returns before Resend's request completes.
    if (devis.artisan.email) {
      const confirmationHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
  <p style="font-size:22px;font-weight:900;color:#1e3a5f;margin:0 0 24px;">
    Devis<span style="color:#f97316;">Flow</span>
  </p>
  <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="font-size:18px;font-weight:700;color:#1e3a5f;margin:0 0 6px;">📤 Devis envoyé !</p>
    <p style="font-size:14px;color:#1e3a5f;margin:0;">
      Votre devis <strong>${esc(devis.devisNumber)}</strong> (${devis.totalTTC.toFixed(2)} € TTC) a bien été envoyé à
      <strong>${esc(recipientEmail)}</strong>.
    </p>
  </div>
  <p style="font-size:14px;color:#374151;margin:0 0 16px;">
    Vous serez notifié par email dès que votre client aura signé le devis.
  </p>
  <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr"}/dashboard" style="display:inline-block;background:#1e3a5f;color:#ffffff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
    Voir mon tableau de bord →
  </a>
  <p style="color:#9ca3af;font-size:11px;margin-top:20px;">
    Notification automatique — <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr"}" style="color:#9ca3af;">DevisFlow</a>
  </p>
</div>`;

      try {
        await resend.emails.send({
          from: "DevisFlow <equipe@devis-flow.fr>",
          to: devis.artisan.email,
          subject: `📤 Devis envoyé — ${devis.devisNumber} transmis à ${devis.client.name}`,
          html: confirmationHtml,
        });
      } catch (err) {
        console.error("[send-devis] artisan confirmation email error:", err instanceof Error ? err.message : "unknown");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-devis] Resend error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email." },
      { status: 500 }
    );
  }
}
