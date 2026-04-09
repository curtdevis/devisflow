import { config } from "dotenv";
import { Resend } from "resend";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local file
config({ path: ".env.local" });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "onboarding@resend.dev"; // Using Resend's test domain to avoid verification issues

if (!RESEND_API_KEY) {
  console.error("❌ Error: RESEND_API_KEY not found in environment variables");
  console.error("Please make sure .env.local exists and contains RESEND_API_KEY");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

async function sendTestEmail() {
  try {
    // Read the HTML template
    const templatePath = resolve(process.cwd(), "src/lib/prospecting-email-template.html");
    const html = readFileSync(templatePath, "utf-8");

    console.log("📧 Sending test email...");
    console.log(`   From: Nathan - DevisFlow <${FROM_EMAIL}>`);
    console.log("   To: nathan.makambo23@gmail.com");
    console.log("   Subject: Générez vos devis en 30 secondes ⚡");

    const { data, error } = await resend.emails.send({
      from: `Nathan - DevisFlow <${FROM_EMAIL}>`,
      to: "nathan.makambo23@gmail.com",
      subject: "Générez vos devis en 30 secondes ⚡",
      html,
    });

    if (error) {
      console.error("\n❌ Failed to send email:");
      console.error("   Status:", error.statusCode);
      console.error("   Message:", error.message);

      if (error.message?.includes("gmail.com domain is not verified")) {
        console.error("\n💡 Solution:");
        console.error("   Resend requires a verified domain to send emails.");
        console.error("   Options:");
        console.error("   1. Use your verified domain (e.g., noreply@devis-flow.fr)");
        console.error("   2. Use Resend's test domain: onboarding@resend.dev");
        console.error("   3. Add and verify your domain at https://resend.com/domains");
      }

      process.exit(1);
    }

    console.log("\n✅ Email sent successfully!");
    console.log("   Email ID:", data?.id);
    console.log("   Check your inbox at nathan.makambo23@gmail.com");

  } catch (err) {
    console.error("❌ Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

sendTestEmail();
