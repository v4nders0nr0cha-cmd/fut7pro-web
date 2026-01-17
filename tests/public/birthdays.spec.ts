import { test, expect } from "@playwright/test";

const emptySlug = process.env.E2E_BIRTHDAYS_EMPTY_SLUG;
const filledSlug = process.env.E2E_BIRTHDAYS_FILLED_SLUG;

test.describe("public birthdays", () => {
  test("shows empty state", async ({ page }) => {
    test.skip(!emptySlug, "E2E_BIRTHDAYS_EMPTY_SLUG not set");

    await page.goto(`/${emptySlug}/sobre-nos/aniversariantes`);
    await expect(page.getByRole("heading", { name: "Aniversariantes do Mes" })).toBeVisible();
    await expect(page.getByText("Nenhum aniversariante neste mes ainda!")).toBeVisible();
  });

  test("shows birthdays list", async ({ page }) => {
    test.skip(!filledSlug, "E2E_BIRTHDAYS_FILLED_SLUG not set");

    await page.goto(`/${filledSlug}/sobre-nos/aniversariantes`);
    await expect(page.getByRole("heading", { name: "Aniversariantes do Mes" })).toBeVisible();

    const cards = page.locator("section img");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
