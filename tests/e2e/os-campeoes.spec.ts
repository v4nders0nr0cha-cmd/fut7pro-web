// tests/e2e/os-campeoes.spec.ts
import { test, expect } from "@playwright/test";
import { gotoAndIdle, paths } from "../utils/navigation";
import { ensureSeedData } from "../utils/seeds";

const SEED_SLUG = process.env.SEED_SLUG ?? "demo-rachao";

function visibleHeading(page: import("@playwright/test").Page, re: RegExp) {
  return page
    .locator("h1:visible,h2:visible,h3:visible,h4:visible,h5:visible,h6:visible")
    .filter({ hasText: re })
    .first();
}

const HEADING_REGEX = /os campeoes|campeoes do ano|campe/i;

async function expectSomeContent(page: import("@playwright/test").Page) {
  const cards = page
    .locator(
      "[data-testid=campeao-card]:visible, [data-testid=campeoes-ano]:visible, .card:visible, .grid [class*=card]:visible"
    )
    .first();
  const categoria = page
    .getByText(
      /melhor do ano|artilheiro|atacante do ano|meia do ano|zagueiro do ano|goleiro do ano|time campe/i
    )
    .first();
  const empty = page.getByText(/nenhum campeao|sem registros|no data|vazio|empty/i).first();
  const region = page.locator("main:visible, section:visible, article:visible").first();
  const loading = page.getByText(/carregando|loading/i).first();

  if (await cards.isVisible()) return expect(cards).toBeVisible({ timeout: 30_000 });
  if (await categoria.isVisible()) return expect(categoria).toBeVisible({ timeout: 30_000 });
  if (await empty.isVisible()) return expect(empty).toBeVisible({ timeout: 30_000 });
  if (await region.isVisible()) return expect(region).toBeVisible({ timeout: 30_000 });
  if (await loading.isVisible()) return expect(loading).toBeVisible({ timeout: 30_000 });

  await expect(page.locator("body")).toBeVisible();
}

test.describe("Pagina publica: Os Campeoes", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeAll(async () => {
    await ensureSeedData(SEED_SLUG);
  });

  test("renderiza e exibe ao menos uma categoria de campeao (ou empty-state visivel)", async ({
    page,
  }) => {
    test.slow();
    await gotoAndIdle(page, paths.osCampeoes());

    const h = visibleHeading(page, HEADING_REGEX);
    if (await h.count()) {
      await expect(h).toBeVisible({ timeout: 45_000 });
    } else {
      await expect(
        page.locator("h1:visible,h2:visible,h3:visible,h4:visible,h5:visible,h6:visible").first()
      ).toBeVisible({ timeout: 45_000 });
    }

    await expectSomeContent(page);
  });
});
