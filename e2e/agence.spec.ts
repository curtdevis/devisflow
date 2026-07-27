import { test, expect } from "@playwright/test";

test.describe("Agence auth guards", () => {
  const agenceRoutes = [
    "/agence",
    "/agence/artisans",
    "/agence/devis",
    "/agence/rapports",
    "/agence/invitations",
    "/agence/facturation",
    "/agence/parametres",
  ];

  for (const route of agenceRoutes) {
    test(`${route} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }
});

test.describe("Agence public boundaries", () => {
  test("agence overview is not accessible without login", async ({ page }) => {
    const res = await page.goto("/agence");
    // Either redirect happened, or the page itself shows login
    const url = page.url();
    expect(url).toMatch(/\/auth\/login/);
  });

  test("agence artisans is not accessible without login", async ({ page }) => {
    await page.goto("/agence/artisans");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe("API security — agence", () => {
  test("invite-artisan POST requires authentication", async ({ request }) => {
    const res = await request.post("/api/invite-artisan", {
      data: { email: "test@test.com", agenceName: "Test Agency" },
    });
    expect(res.status()).toBe(401);
  });

  test("agence invitations PATCH requires authentication", async ({ request }) => {
    const res = await request.patch("/api/agence/invitations", {
      data: { token: "fake-token", agenceName: "Test", email: "x@x.com" },
    });
    expect(res.status()).toBe(401);
  });

  test("agence invitations DELETE requires authentication", async ({ request }) => {
    const res = await request.delete("/api/agence/invitations", {
      data: { token: "fake-token" },
    });
    expect(res.status()).toBe(401);
  });

  test("remove-artisan POST requires authentication", async ({ request }) => {
    const res = await request.post("/api/agence/remove-artisan", {
      data: { artisanId: "00000000-0000-0000-0000-000000000000" },
    });
    expect(res.status()).toBe(401);
  });
});
