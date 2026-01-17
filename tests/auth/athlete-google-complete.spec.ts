import { test, expect } from "@playwright/test";

const slug = process.env.E2E_PUBLIC_SLUG;
const storageState = process.env.E2E_GOOGLE_STORAGE_STATE;

test.describe("athlete google completion", () => {
  test.use({ storageState: storageState || undefined });

  test("shows completion flow", async ({ page }) => {
    test.skip(!slug || !storageState, "E2E_GOOGLE_STORAGE_STATE or E2E_PUBLIC_SLUG not set");

    await page.goto(`/${slug}/register`);
    await expect(
      page.getByText("Complete seu cadastro para liberar o acesso ao racha.")
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Concluir cadastro" })).toBeVisible();
  });
});
