import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "curt.mkb23@gmail.com";

export function escapeHtml(value: string): string {
  return value.replace(
    /[<>&"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] ?? c)
  );
}

/** Fire-and-forget admin notification email — never blocks or throws into the caller. */
export function notifyAdmin(subject: string, bodyHtml: string) {
  resend.emails
    .send({
      from: "noreply@devis-flow.fr",
      to: ADMIN_EMAIL,
      subject,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1e3a5f;line-height:1.6;">${bodyHtml}</div>`,
    })
    .catch((e) => console.error("[admin-notify]", e));
}
