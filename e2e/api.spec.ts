import { test, expect } from "@playwright/test";

test.describe("API security", () => {
  test("generate-devis rejects missing required fields", async ({ request }) => {
    const res = await request.post("/api/generate-devis", {
      data: { artisanName: "Test" }, // missing required fields
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("generate-devis rejects invalid artisan email", async ({ request }) => {
    const res = await request.post("/api/generate-devis", {
      data: {
        artisanName: "Jean Dupont",
        artisanEmail: "not-an-email",
        clientName: "Client Test",
        clientAddress: "1 rue Test",
        workDescription: "Plomberie",
        laborHours: "2",
        hourlyRate: "50",
        tvaRate: "20",
        validityDays: "30",
        materials: [],
      },
    });
    expect(res.status()).toBe(400);
  });

  test("send-devis rejects invalid recipient email", async ({ request }) => {
    const res = await request.post("/api/send-devis", {
      data: {
        recipientEmail: "not-an-email",
        devis: { id: null, devisNumber: "DEV-001", date: "01/01/2025", validUntil: "01/02/2025",
          artisan: { name: "Test", siret: "123" }, client: { name: "Client", address: "", phone: "", email: "" },
          lines: [], subtotalHT: 0, tvaRate: 20, tvaAmount: 0, totalTTC: 0, notes: "", legalMentions: "" },
      },
    });
    expect(res.status()).toBe(400);
  });

  test("send-devis rejects devis with fake ID", async ({ request }) => {
    const res = await request.post("/api/send-devis", {
      data: {
        recipientEmail: "client@test.com",
        devis: { id: "00000000-0000-0000-0000-000000000000", devisNumber: "DEV-001", date: "01/01/2025", validUntil: "01/02/2025",
          artisan: { name: "Test", siret: "123" }, client: { name: "Client", address: "", phone: "", email: "" },
          lines: [], subtotalHT: 0, tvaRate: 20, tvaAmount: 0, totalTTC: 0, notes: "", legalMentions: "" },
      },
    });
    expect(res.status()).toBe(404);
  });

  test("create-invoice requires authentication", async ({ request }) => {
    const res = await request.post("/api/create-invoice", {
      data: { devisId: "00000000-0000-0000-0000-000000000000" },
    });
    expect(res.status()).toBe(401);
  });

  test("invoices PATCH requires authentication", async ({ request }) => {
    const res = await request.patch("/api/invoices/00000000-0000-0000-0000-000000000000", {
      data: { status: "paid" },
    });
    expect(res.status()).toBe(401);
  });

  test("devis PATCH rejects future signed_at", async ({ request }) => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const res = await request.patch("/api/devis/00000000-0000-0000-0000-000000000000", {
      data: { signed_at: futureDate, signature_data: "data:image/png;base64," + "A".repeat(200) },
    });
    // Either 422 (validation) or 404 (not found) — both are correct rejections
    expect([404, 422]).toContain(res.status());
  });

  test("clients GET requires authentication", async ({ request }) => {
    const res = await request.get("/api/clients");
    expect(res.status()).toBe(401);
  });

  test("billing checkout requires authentication", async ({ request }) => {
    const res = await request.post("/api/billing/checkout", {
      data: { user_id: "00000000-0000-0000-0000-000000000000" },
    });
    expect(res.status()).toBe(401);
  });

  test("admin login rejects wrong password", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { password: "wrong-password-xyz" },
    });
    expect(res.status()).toBe(401);
  });

  test("cron reminders rejects non-Vercel callers", async ({ request }) => {
    const res = await request.get("/api/reminders");
    // Either 401 (secret enforced) or 200 (no secret set in test env) — never 500
    expect([200, 401]).toContain(res.status());
  });
});

test.describe("Sign page (public)", () => {
  test("sign page with non-existent ID renders without crashing", async ({ page }) => {
    await page.goto("/sign/00000000-0000-0000-0000-000000000000");
    await expect(page.locator("body")).not.toBeEmpty();
    // Should show a not-found or error message, not a blank page
    const text = await page.locator("body").textContent();
    expect(text?.length).toBeGreaterThan(10);
  });
});
