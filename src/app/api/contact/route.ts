import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  clientCount: string;
  message: string;
}

export async function POST(req: NextRequest) {
  let body: ContactRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { companyName, contactName, email, phone, clientCount, message } = body;

  if (!companyName || !contactName || !email || !phone || !clientCount) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e3a5f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">
          🎯 Nouvelle demande de démo — DevisFlow
        </h1>
      </div>
      <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 13px; width: 40%; vertical-align: top;">Cabinet / Groupement</td>
            <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 14px;">${companyName}</td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Contact</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">${contactName}</td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Email</td>
            <td style="padding: 10px 0; font-size: 14px;">
              <a href="mailto:${email}" style="color: #f97316;">${email}</a>
            </td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Téléphone</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              <a href="tel:${phone}" style="color: #f97316;">${phone}</a>
            </td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Artisans gérés</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${clientCount}</td>
          </tr>
          ${message ? `
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Message</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</td>
          </tr>
          ` : ""}
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #f97316;">
          <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">
            ⏱️ À rappeler dans les 24h
          </p>
          <p style="margin: 4px 0 0; color: #92400e; font-size: 13px;">
            Répondre à <a href="mailto:${email}" style="color: #f97316;">${email}</a> ou appeler le ${phone}
          </p>
        </div>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
        DevisFlow — Générateur de devis IA pour artisans français
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "DevisFlow <onboarding@resend.dev>",
      to: "nathan.makambo23@gmail.com",
      replyTo: email,
      subject: `🎯 Nouvelle démo demandée — ${companyName} (${clientCount} artisans)`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
