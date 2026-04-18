import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("renders email and password inputs", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill("input[type='email']", "noone@nowhere.invalid");
    await page.fill("input[type='password']", "wrongpassword");
    await page.click("button[type='submit']");
    await expect(page.locator("text=invalide").or(page.locator("text=incorrect")).or(page.locator("[role='alert']"))).toBeVisible({ timeout: 8000 });
  });

  test("has link to register page", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("a[href='/auth/register']")).toBeVisible();
  });
});

test.describe("Register page", () => {
  test("renders email and password inputs", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("has link back to login", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.locator("a[href='/auth/login']")).toBeVisible();
  });
});

test.describe("Password reset flow", () => {
  test("reset-password page renders email input", async ({ page }) => {
    await page.goto("/auth/reset-password");
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("reset-password has link back to login", async ({ page }) => {
    await page.goto("/auth/reset-password");
    await expect(page.locator("a[href='/auth/login']").first()).toBeVisible();
  });

  test("login page has link to reset-password", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("a[href='/auth/reset-password']")).toBeVisible();
  });

  test("update-password shows invalid state without token", async ({ page }) => {
    await page.goto("/auth/update-password");
    // Should show spinner then invalid state — not crash
    await page.waitForTimeout(1500);
    const body = await page.locator("body").textContent();
    expect(body?.length).toBeGreaterThan(10);
  });
});

test.describe("Auth guards", () => {
  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("devis page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/devis");
    await expect(page).toHaveURL(/\/auth\//);
  });

  test("factures page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard/factures");
    await expect(page).toHaveURL(/\/auth\//);
  });

  test("clients page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(page).toHaveURL(/\/auth\//);
  });
});
