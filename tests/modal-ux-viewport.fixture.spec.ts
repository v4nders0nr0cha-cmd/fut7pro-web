import { expect, test, type Page } from "@playwright/test";
import QRCode from "qrcode";

const fixturePassword = "fixture-only-password";
const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "celular", width: 390, height: 844 },
  { name: "celular estreito", width: 320, height: 640 },
  { name: "altura reduzida", width: 640, height: 320 },
];

test.beforeEach(async ({ page }) => {
  expect(process.env.ADMIN_SMOKE_FIXTURE, "Este teste exige a API sintética local").toBe("1");
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "accepted"));
  await page.route(/^https:\/\/api\.fut7pro\.com\.br(?:\/|$)/, (route) => route.abort());
});

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByTestId("admin-login-email").fill("presidente@fixture.invalid");
  await page.getByRole("button", { name: "Entrar com senha" }).click();
  await page.getByTestId("admin-login-password").fill(fixturePassword);
  await page.getByTestId("admin-login-submit").click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 90_000 });
}

async function expectFitsViewport(page: Page, dialog: ReturnType<Page["getByRole"]>) {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const bounds = await dialog.boundingBox();
    expect(bounds, `Diálogo ausente em ${viewport.name}`).not.toBeNull();
    expect(bounds!.x, `Diálogo sai pela esquerda em ${viewport.name}`).toBeGreaterThanOrEqual(-1);
    expect(
      bounds!.x + bounds!.width,
      `Diálogo sai pela direita em ${viewport.name}`
    ).toBeLessThanOrEqual(viewport.width + 1);
    expect(bounds!.y, `Diálogo sai pelo topo em ${viewport.name}`).toBeGreaterThanOrEqual(-1);
    expect(
      bounds!.y + bounds!.height,
      `Diálogo sai por baixo em ${viewport.name}`
    ).toBeLessThanOrEqual(viewport.height + 1);
    for (const button of [
      dialog.getByRole("button", { name: /Fechar modal|Fechar pagamento via PIX/ }),
      dialog.getByRole("button", { name: /Enviar convite|^Fechar$/ }),
    ]) {
      await expect(button).toBeInViewport();
      const unobstructed = await button.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
        return hit === element || element.contains(hit);
      });
      expect(unobstructed, `Botão coberto por outra camada em ${viewport.name}`).toBe(true);
    }
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    if (viewport.name === "altura reduzida") {
      const scrollArea = dialog.locator(".overflow-y-auto").first();
      const scroll = await scrollArea.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
        return {
          total: element.scrollHeight,
          visible: element.clientHeight,
          position: element.scrollTop,
        };
      });
      expect(scroll.total, "Conteúdo deve ter espaço para rolar").toBeGreaterThan(scroll.visible);
      expect(scroll.position, "Conteúdo deve rolar dentro do diálogo").toBeGreaterThan(0);
    }
  }
}

test("convite de administrador cabe em cinco formatos de tela", async ({ page }, testInfo) => {
  await page.route("**/api/admin/administradores/atletas**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        results: [{ id: "fixture-atleta", nome: "Atleta de Teste", hasUserAccount: true }],
      }),
    })
  );
  await login(page);
  await page.goto("/admin/administracao/administradores");
  await page.getByRole("button", { name: "Selecionar atleta" }).first().click();
  await page
    .getByRole("dialog", { name: "Selecionar atleta" })
    .getByRole("button", { name: /Atleta de Teste/ })
    .click();
  await page.getByRole("button", { name: "Continuar" }).click();
  const dialog = page.getByRole("dialog", { name: "Convidar para Vice-Presidente?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Como ficará a mensalidade dele?")).toBeVisible();
  await expect(dialog.getByText("O que acontece depois")).toBeVisible();
  await expectFitsViewport(page, dialog);
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog
    .locator(".overflow-y-auto")
    .first()
    .evaluate((element) => (element.scrollTop = 0));
  await dialog.screenshot({ path: testInfo.outputPath("convite-mobile.png") });
  await page.setViewportSize({ width: 1280, height: 800 });
  await dialog.screenshot({ path: testInfo.outputPath("convite-desktop.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("PIX sintético cabe em cinco formatos de tela", async ({ page }, testInfo) => {
  const pixCode = "00020126" + "PIX-FIXTURE-SEM-VALOR-REAL-".repeat(12);
  const qrCodeBase64 = (await QRCode.toDataURL(pixCode)).split(",")[1];
  const pricing = {
    isFirstPayment: true,
    firstPaymentDiscountApplied: true,
    baseAmountCents: 10000,
    discountPct: 10,
    discountCents: 1000,
    totalCents: 9000,
  };
  await page.route("**/api/admin/billing/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown;
    if (path.endsWith("/plans")) {
      body = {
        plans: [
          {
            key: "mensal",
            label: "Mensal",
            amount: 10000,
            interval: "month",
            trialDays: 0,
            marketingStartsAfterFirstPayment: false,
            active: true,
          },
        ],
      };
    } else if (path.endsWith("/subscription/tenant")) {
      body = {
        id: "fixture-subscription",
        tenantId: "fixture-tenant",
        planKey: "mensal",
        interval: "month",
        amount: 10000,
        status: "past_due",
        marketingEnabled: true,
        requiresUpfront: false,
        pricingPreview: pricing,
        access: {
          status: "ALERTA",
          accessStatus: "ATIVO",
          blocked: false,
          canAccess: true,
          source: "SUBSCRIPTION",
        },
      };
    } else if (path.endsWith("/status")) {
      body = { preapproval: "pending", upfront: "pending", active: false };
    } else if (path.endsWith("/pix")) {
      body = {
        invoice: {
          id: "fixture-invoice",
          amount: 9000,
          createdAt: "2026-11-13T00:00:00Z",
          periodStart: "2026-11-13T00:00:00Z",
          periodEnd: "2026-12-13T00:00:00Z",
        },
        pricing,
        pix: {
          qrCode: pixCode,
          qrCodeBase64,
          ticketUrl: "https://fixture.invalid/pix",
          expiresAt: "2026-11-14T00:00:00Z",
        },
      };
    } else {
      return route.abort();
    }
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
  });
  await login(page);
  await page.goto("/admin/financeiro/planos-limites");
  await page
    .getByRole("button", { name: /Regularizar pagamento|Atualizar pagamento/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Gerar PIX" }).click();
  const dialog = page.getByRole("dialog", { name: "Pague com PIX" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("img", { name: "QR Code para pagamento via PIX" })).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Código PIX completo" })).toHaveValue(pixCode);
  await expect(dialog.getByText("Resumo do pagamento")).toBeVisible();
  await expect(dialog.getByText("Código válido até")).toBeVisible();
  await expectFitsViewport(page, dialog);
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog
    .locator(".overflow-y-auto")
    .first()
    .evaluate((element) => (element.scrollTop = 0));
  await dialog.screenshot({ path: testInfo.outputPath("pix-mobile.png") });
  await page.setViewportSize({ width: 1280, height: 800 });
  await dialog.screenshot({ path: testInfo.outputPath("pix-desktop.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});
