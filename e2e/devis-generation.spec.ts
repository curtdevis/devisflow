import { test, expect } from "@playwright/test";

test.describe("Devis form (unauthenticated)", () => {
  test("redirects to auth when not logged in", async ({ page }) => {
    await page.goto("/devis");
    await expect(page).toHaveURL(/\/auth\//);
  });
});

test.describe("Sign page (public)", () => {
  test("renders without crashing for non-existent devis", async ({ page }) => {
    await page.goto("/sign/00000000-0000-0000-0000-000000000000");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("sign page does not expose server errors to users", async ({ page }) => {
    await page.goto("/sign/not-a-valid-uuid");
    // Should show a user-friendly message, not a raw stack trace
    const text = await page.locator("body").textContent() ?? "";
    expect(text).not.toContain("at Object.");
    expect(text).not.toContain("SUPABASE");
    expect(text).not.toContain("service_role");
  });
});
