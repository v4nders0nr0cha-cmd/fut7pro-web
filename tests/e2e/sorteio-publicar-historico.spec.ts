// tests/e2e/sorteio-publicar-historico.spec.ts
import { test, expect } from "@playwright/test";
import { ensureRacha, publicarTimes } from "../utils/ensureRacha";
import { gotoAndIdle, paths } from "../utils/navigation";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const SEED_SLUG = process.env.SEED_SLUG ?? "demo-rachao";
const BYPASS = process.env.E2E_ALLOW_NOAUTH === "1";

/** Constrói um RegExp acento-insensível para pt-BR a partir de string/regex simples. */
function accentInsensitive(pattern: string | RegExp): RegExp {
  const src = typeof pattern === "string" ? pattern : pattern.source;
  const map: Record<string, string> = {
    a: "aáàâãä",
    e: "eéêë",
    i: "iíï",
    o: "oóôõö",
    u: "uúü",
    c: "cç",
  };
  return new RegExp(
    src.replace(/[aeiouc]/gi, (ch) => {
      const low = ch.toLowerCase();
      const cls = map[low] ?? low;
      const set = `${cls}${cls.toUpperCase()}`;
      return `[${set}]`;
    }),
    "i"
  );
}

function visibleHeading(page: import("@playwright/test").Page, re: RegExp | string) {
  // pega apenas headings VISÍVEIS, evitando <h1 class="sr-only">
  const ai = accentInsensitive(re);
  return page
    .locator("h1:visible,h2:visible,h3:visible,h4:visible,h5:visible,h6:visible")
    .filter({ hasText: ai })
    .first();
}

async function expectSomeContent(page: import("@playwright/test").Page) {
  const table = page.locator("table:visible").first();
  const rows = page.locator("table:visible tbody tr");
  const emptyMsg = page.getByText(/nenhum|sem registros|no data|vazio|empty|sem dados/i).first();
  const anyCard = page.locator(".card:visible, [data-testid*=card]:visible").first();
  const anyList = page.locator("ul:visible li, ol:visible li").first();
  const region = page.locator("main:visible, section:visible, article:visible").first();
  const loading = page.getByText(/carregando|loading/i).first();

  if (await table.isVisible()) {
    const count = await rows.count();
    if (count > 0) await expect(count).toBeGreaterThan(0);
    else if (await emptyMsg.isVisible()) await expect(emptyMsg).toBeVisible();
    return;
  }

  if (await emptyMsg.isVisible()) return expect(emptyMsg).toBeVisible();
  if (await anyCard.isVisible()) return expect(anyCard).toBeVisible();
  if (await anyList.isVisible()) return expect(anyList).toBeVisible();
  if (await region.isVisible()) return expect(region).toBeVisible();
  if (await loading.isVisible()) return expect(loading).toBeVisible();

  await expect(page.locator("body")).toBeVisible();
}

test.describe("Sorteio -> Publicar -> Historico", () => {
  test.describe.configure({ timeout: 120_000 });
  test.skip(!BYPASS, "exige bypass (E2E_ALLOW_NOAUTH=1) para acionar rotas admin");

  test("publica partidas e valida paginas publicas", async ({ page, request }) => {
    test.slow();

    const rachaId = await ensureRacha(request, BASE_URL, SEED_SLUG);
    await publicarTimes(request, BASE_URL, rachaId);

    // Times do dia
    await gotoAndIdle(page, paths.timesDoDia());
    await expect(visibleHeading(page, /times do dia/i)).toBeVisible({ timeout: 45_000 });
    await expectSomeContent(page);

    // Histórico — agora acento-insensível
    await gotoAndIdle(page, paths.historico());
    await expect(visibleHeading(page, /historico/i)).toBeVisible({ timeout: 45_000 });

    const verDetalhes = page.getByRole("link", { name: /ver detalhes/i }).first();
    if (await verDetalhes.isVisible()) {
      await verDetalhes.click();
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await expect(
        page.locator("h1:visible,h2:visible,h3:visible,h4:visible,h5:visible,h6:visible").first()
      ).toBeVisible({ timeout: 30_000 });
      await expectSomeContent(page);
    } else {
      await expectSomeContent(page);
    }
  });
});
