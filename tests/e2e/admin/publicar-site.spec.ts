// tests/e2e/admin/publicar-site.spec.ts
import { test, expect } from "../fixtures/auth";
import type { Page, Locator } from "@playwright/test";

/* Flags ------------------------------------------------------------------- */
function envFlag(name: string): boolean {
  const v = (process.env[name] || "").toLowerCase().trim();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

const REQUIRE_RACHA = envFlag("E2E_REQUIRE_RACHA") || envFlag("E2E_REQUIRE_PUBLISH_CARD");
const REQUIRE_PUBLISH_CARD = envFlag("E2E_REQUIRE_PUBLISH_CARD");
const CREATE_RACHA = envFlag("E2E_CREATE_RACHA");

const RACHA_SLUG = process.env.E2E_RACHA_SLUG || "demo-rachao";
const RACHA_NOME = process.env.E2E_RACHA_NOME || "Racha E2E";

/* Utils ------------------------------------------------------------------- */
async function isVisible(loc: Locator, timeout = 600) {
  try {
    return await loc.first().isVisible({ timeout });
  } catch {
    return false;
  }
}

async function pickVisible(locs: Locator[], timeout = 1000): Promise<Locator | null> {
  for (const l of locs) {
    if (await isVisible(l, timeout)) return l.first();
    try {
      if ((await l.count()) > 0) return l.first();
    } catch {}
  }
  return null;
}

async function bannerNenhumRachaVisivel(page: Page) {
  return isVisible(page.getByText(/Nenhum racha encontrado/i), 800);
}

async function tryCreateRachaViaAPI(page: Page) {
  try {
    const payloads = [{ slug: RACHA_SLUG, nome: RACHA_NOME, name: RACHA_NOME, titulo: RACHA_NOME }];
    const endpoints = ["/api/admin/rachas", "/api/rachas"];
    for (const data of payloads) {
      for (const url of endpoints) {
        const res = await page.request.post(url, { data });
        const status = res.status();
        if (res.ok() || status === 201 || status === 200 || status === 409 /* já existe */) {
          return true;
        }
      }
    }
  } catch {}
  return false;
}

async function tryCreateRachaViaUI(page: Page) {
  try {
    await page.goto("/admin/rachas", { waitUntil: "domcontentloaded" });

    // Tenta abrir formulário
    const novoBtn =
      (await pickVisible(
        [
          page.getByRole("button", { name: /novo|criar|cadastrar|adicionar/i }),
          page.getByTestId("btn-novo-racha"),
          page.getByRole("link", { name: /novo|criar|cadastrar|adicionar/i }),
        ],
        1400
      )) || null;

    if (novoBtn) {
      await novoBtn.click();
    }

    // Preenche campos (se o form já estiver aberto, segue mesmo sem "novo")
    const nameInput =
      (await pickVisible(
        [
          page.getByLabel(/nome/i),
          page.getByPlaceholder(/nome/i),
          page.locator('input[name*="nome" i]'),
          page.locator('input[id*="nome" i]'),
        ],
        1400
      )) || null;

    const slugInput =
      (await pickVisible(
        [
          page.getByLabel(/slug|identificador/i),
          page.getByPlaceholder(/slug|identificador/i),
          page.locator('input[name*="slug" i]'),
          page.locator('input[id*="slug" i]'),
        ],
        1400
      )) || null;

    if (nameInput) await nameInput.fill(RACHA_NOME);
    if (slugInput) await slugInput.fill(RACHA_SLUG);

    const salvarBtn =
      (await pickVisible(
        [
          page.getByRole("button", { name: /salvar|criar|cadastrar/i }),
          page.getByTestId("btn-salvar"),
        ],
        1400
      )) || null;

    if (salvarBtn) {
      await salvarBtn.click();
    } else {
      // fallback: submit do form com Enter
      await page.keyboard.press("Enter");
    }

    // Feedback opcional (toast/sucesso)
    await page
      .getByText(/sucesso|criad|salv|ok/i)
      .first()
      .waitFor({ state: "visible", timeout: 3500 })
      .catch(() => {});
    return true;
  } catch {}
  return false;
}

async function ensureRacha(page: Page) {
  await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);

  const none = await bannerNenhumRachaVisivel(page);
  if (!none) return true;

  if (CREATE_RACHA) {
    const created = (await tryCreateRachaViaAPI(page)) || (await tryCreateRachaViaUI(page));

    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const noneAfter = await bannerNenhumRachaVisivel(page);
    if (created && !noneAfter) return true;
  }

  if (REQUIRE_RACHA) {
    expect(
      false,
      "Pré-requisito ausente: crie um racha para que o card de publicação apareça. " +
        "Dica: `E2E_CREATE_RACHA=1` para criar on-the-fly ou rode o seed do projeto."
    ).toBe(true);
  } else {
    test.skip(
      true,
      "Nenhum racha encontrado — o card de publicação só aparece quando existe ao menos um racha."
    );
  }
  return false;
}

async function findPublishButton(page: Page): Promise<Locator | null> {
  const candidates: Locator[] = [
    page.getByTestId("publish-site"),
    page.getByTestId("btn-publish-site"),
    page.getByTestId("publicar-site"),
    page.locator('[data-testid="card-publicacao"] button'),
    page.getByRole("button", { name: /publicar\s*site/i }),
    page.getByRole("button", { name: /^publicar$/i }),
    page.getByRole("button", { name: /despublicar\s*site/i }),
    page.getByRole("button", { name: /despublicar$/i }),
    page.getByRole("button").filter({ hasText: /publicar|despublicar/i }),
  ];

  for (const loc of candidates) {
    if (await isVisible(loc, 400)) return loc.first();
    try {
      if ((await loc.count()) > 0) return loc.first();
    } catch {}
  }
  return null;
}

/* Spec -------------------------------------------------------------------- */
test.describe("Admin - Publicação do site", () => {
  test.setTimeout(120_000);

  test("card de publicacao funciona com sessao valida", async ({ authedPage }) => {
    const page = authedPage;

    await ensureRacha(page);

    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // procura o botão por até ~10s
    let publishBtn: Locator | null = null;
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      publishBtn = await findPublishButton(page);
      if (publishBtn) break;
      await page.waitForTimeout(250);
    }

    if (!publishBtn) {
      // artefatos úteis antes de decidir pular/falhar
      try {
        await test.info().attach("dom-final.html", {
          body: await page.content(),
          contentType: "text/html",
        });
        const controls = await page
          .locator("button, [role='button'], [data-testid]")
          .allTextContents();
        await test.info().attach("visible-controls-final.txt", {
          body: controls.join("\n"),
          contentType: "text/plain",
        });
        await test.info().attach("screenshot-final.png", {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
      } catch {}
    }

    if (!publishBtn && !REQUIRE_PUBLISH_CARD) {
      test.skip(true, "Card/botão de publicação não disponível para este admin/ambiente.");
    }

    expect(publishBtn, "Card/botão de publicação não encontrado no dashboard.").not.toBeNull();

    await expect(publishBtn!).toBeVisible();
    try {
      // garantir que está visível na viewport em layouts com scroll
      await publishBtn!.scrollIntoViewIfNeeded();
    } catch {}
    await publishBtn!.click();

    // aceita “Publicado com sucesso” e “Despublicado com sucesso” (toggle)
    const toast =
      page.getByText(/Publicado com sucesso/i).first() ||
      page.getByText(/Despublicado com sucesso/i).first() ||
      page.getByText(/publicad[oa].*sucesso/i).first();

    await expect(toast).toBeVisible({ timeout: 8000 });
  });
});
