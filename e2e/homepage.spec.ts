import { test, expect } from "@playwright/test";

test("homepage loads and shows brand", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=DevisFlow").first()).toBeVisible();
});

test("homepage has a CTA linking to registration", async ({ page }) => {
  await page.goto("/");
  // CTA can link to /auth/register or /auth/register?type=agence — both are valid
  const cta = page.locator("a[href*='/auth/register']").first();
  await expect(cta).toBeVisible();
});

test("homepage nav shows login link", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a[href='/auth/login']").first()).toBeVisible();
});

test("pricing section is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=29").first()).toBeVisible();
});

test("legal pages are reachable", async ({ page }) => {
  for (const path of ["/cgu", "/confidentialite", "/mentions-legales"]) {
    await page.goto(path);
    await expect(page).not.toHaveURL(/\/auth\//);
    await expect(page.locator("body")).not.toBeEmpty();
  }
});

test("homepage FAQ section is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#faq")).toBeVisible();
});

test("homepage tarifs section is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#tarifs")).toBeVisible();
});

test("404 page renders correctly", async ({ page }) => {
  await page.goto("/une-page-qui-nexiste-pas-du-tout-xyz");
  const body = await page.locator("body").textContent();
  expect(body).toContain("introuvable");
});

test("contact page is accessible", async ({ page }) => {
  await page.goto("/contact");
  await expect(page).not.toHaveURL(/\/auth\//);
  await expect(page.locator("input[type='email']")).toBeVisible();
});
