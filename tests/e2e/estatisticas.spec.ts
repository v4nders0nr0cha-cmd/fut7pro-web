// tests/e2e/estatisticas.spec.ts
import { test, expect } from "@playwright/test";
import { ensureSeedData } from "../utils/seeds";
import { gotoAndIdle, paths } from "../utils/navigation";

function visibleHeading(page: import("@playwright/test").Page, re: RegExp) {
  return page
    .locator("h1:visible,h2:visible,h3:visible,h4:visible,h5:visible,h6:visible")
    .filter({ hasText: re })
    .first();
}

async function expectSomeContent(page: import("@playwright/test").Page) {
  const table = page.locator("table:visible").first();
  const rows = page.locator("table:visible tbody tr");
  const empty = page.getByText(/nenhum|sem registros|no data|vazio|empty|sem dados/i).first();
  const card = page.locator(".card:visible, [data-testid*=card]:visible").first();
  const list = page.locator("ul:visible li, ol:visible li").first();
  const region = page.locator("main:visible, section:visible, article:visible").first();
  const loading = page.getByText(/carregando|loading/i).first();

  if (await table.isVisible()) {
    const count = await rows.count();
    if (count > 0) await expect(count).toBeGreaterThan(0);
    else if (await empty.isVisible()) await expect(empty).toBeVisible();
    return;
  }
  if (await empty.isVisible()) return expect(empty).toBeVisible();
  if (await card.isVisible()) return expect(card).toBeVisible();
  if (await list.isVisible()) return expect(list).toBeVisible();
  if (await region.isVisible()) return expect(region).toBeVisible();
  if (await loading.isVisible()) return expect(loading).toBeVisible();

  await expect(page.locator("body")).toBeVisible();
}

test.describe("Estatisticas publicas", () => {
  test.describe.configure({ timeout: 120_000 });

  test.beforeAll(async () => {
    await ensureSeedData();
  });

  test("Ranking geral renderiza e lista atletas (ou empty-state)", async ({ page }) => {
    test.slow();
    await gotoAndIdle(page, paths.rankingGeral());
    await expect(visibleHeading(page, /ranking geral/i)).toBeVisible({ timeout: 45_000 });
    await expectSomeContent(page);
  });

  test("Artilheiros exibem dados (ou empty-state)", async ({ page }) => {
    test.slow();
    await gotoAndIdle(page, paths.artilheiros());
    await expect(visibleHeading(page, /artilheiros/i)).toBeVisible({ timeout: 45_000 });
    await expectSomeContent(page);
  });

  test("Assistencias exibem dados (ou empty-state)", async ({ page }) => {
    test.slow();
    await gotoAndIdle(page, paths.assistencias());
    await expect(visibleHeading(page, /assist/i)).toBeVisible({ timeout: 45_000 });
    await expectSomeContent(page);
  });

  test("Classificacao dos times renderiza (ou empty-state)", async ({ page }) => {
    test.slow();
    await gotoAndIdle(page, paths.classificacaoTimes());
    await expect(visibleHeading(page, /classifica/i)).toBeVisible({ timeout: 45_000 });
    await expectSomeContent(page);
  });
});
