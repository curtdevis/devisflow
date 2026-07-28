import { createSign } from "crypto";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

// Service-account auth via a self-signed JWT exchanged for a short-lived
// access token — no external dependency needed (googleapis is large; this is
// ~30 lines of plain fetch + Node's built-in crypto).
async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !privateKey) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY manquants");

  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })
  )}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  // Env vars sometimes store the PEM with literal "\n" instead of real newlines.
  const signature = signer.sign(privateKey.replace(/\\n/g, "\n")).toString("base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google OAuth token exchange failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// USER_ENTERED lets Sheets auto-linkify URLs (useful for the "Site web"
// column), but it also means a string starting with +, -, =, or @ gets
// parsed as a formula — e.g. a phone number "+33 1 84 73 13 96" became
// #ERROR!. Prefix those with a straight apostrophe to force plain text,
// same escaping idea as the CSV-injection guard in csv-export.ts.
function escapeSheetFormula(value: string | number): string | number {
  if (typeof value === "number") return value;
  return /^[+\-=@]/.test(value) ? `'${value}` : value;
}

export async function appendSheetRow(values: (string | number)[]): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID manquant");

  const accessToken = await getAccessToken();

  const res = await fetch(
    `${SHEETS_API_BASE}/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values.map(escapeSheetFormula)] }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Sheets append failed (${res.status}): ${text.slice(0, 500)}`);
  }
}
