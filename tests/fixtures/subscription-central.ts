import { expect, type Page } from "@playwright/test";

// Exercise the actual profile entry without interrupting the login's client navigation.
export async function openSubscriptionCentral(page: Page) {
  if ((page.viewportSize()?.width ?? 1280) >= 1024) {
    await page.getByRole("button", { name: /Abrir menu do perfil/ }).click();
  } else {
    await page.getByRole("link", { name: "Abrir Mais", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/mais(?:\?|$)/);
  }
  await page.getByRole("link", { name: "Gerenciar assinatura", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/assinatura$/, { timeout: 30000 });
  await expect(page.getByRole("heading", { name: "Minha assinatura", exact: true })).toBeVisible();
}
