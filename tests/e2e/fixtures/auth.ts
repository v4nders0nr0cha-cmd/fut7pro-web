// tests/e2e/fixtures/auth.ts
import { test as base, expect as baseExpect, type Page, type WorkerInfo } from "@playwright/test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

type TestFixtures = {
  authedPage: Page;
};

type WorkerFixtures = {
  storageStatePath?: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Faz login 1x por worker e salva o storageState
  storageStatePath: [
    async ({ browser }, use, workerInfo: WorkerInfo) => {
      const email = process.env.TEST_EMAIL ?? "";
      const password = process.env.TEST_PASSWORD ?? "";

      if (!email || !password) {
        // sem credenciais -> não existe storage state
        await use(undefined);
        return;
      }

      const baseUrl =
        process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || "http://127.0.0.1:3000";

      const context = await browser.newContext();
      const page = await context.newPage();

      // Abre a tela de login
      await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });

      // Helpers de busca resiliente
      const firstPresent = async (...locs: ReturnType<Page["locator"]>[]) => {
        for (const l of locs) {
          try {
            if (await l.count()) return l.first();
          } catch {}
        }
        return null;
      };

      const emailInput = await firstPresent(
        page.getByLabel(/e-?mail/i),
        page.getByPlaceholder(/mail/i),
        page.locator('input[type="email"]')
      );

      const passInput = await firstPresent(
        page.getByLabel(/senha|password/i),
        page.getByPlaceholder(/senha|password/i),
        page.locator('input[type="password"]')
      );

      if (!emailInput || !passInput) {
        await context.close();
        await use(undefined);
        return;
      }

      await emailInput.fill(email);
      await passInput.fill(password);

      const loginBtn =
        (await firstPresent(
          page.getByRole("button", { name: /entrar|acessar|login|entrar no sistema/i }),
          page.locator('button[type="submit"]'),
          page.locator("button")
        )) ?? page.locator("button").first();

      await loginBtn.click();

      // Considera sucesso ao chegar em /admin ou /admin/dashboard
      await page.waitForURL(/\/admin(\/dashboard)?(\/|$)/, { timeout: 15000 });

      // Gera um arquivo temporário para este worker
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pw-auth-"));
      const statePath = path.join(tmpDir, `storageState-${workerInfo.workerIndex}.json`);

      await context.storageState({ path: statePath });
      await context.close();

      await use(statePath);
    },
    { scope: "worker" },
  ],

  // Abre uma Page já autenticada para cada teste
  authedPage: async ({ browser, storageStatePath }, use, testInfo) => {
    if (!storageStatePath) {
      testInfo.skip(true, "Defina TEST_EMAIL/TEST_PASSWORD para executar testes autenticados.");
    }

    const context = await browser.newContext({ storageState: storageStatePath });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export const expect = baseExpect;
