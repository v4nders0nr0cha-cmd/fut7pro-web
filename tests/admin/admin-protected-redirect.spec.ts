import { expect, test } from "@playwright/test";

test.describe("admin protected redirect", () => {
  test("acesso sem sessao redireciona para /admin/login", async ({ context, page }) => {
    await context.clearCookies();
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/admin\/login(\?|$)/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/admin\/login(\?|$)/);
  });
});

