import { test, expect } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";
import { openSubscriptionCentral } from "./fixtures/subscription-central";

for (const width of [1280, 768, 390, 320]) {
  test(`Backend PostgreSQL integrado: quatro áreas em ${width}px`, async ({ page }, info) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width, height: 900 });
    const guide = await installGuide(page);
    Object.assign(guide.state, {
      dashboardInviteDismissedAt: "2026-11-21T12:00:00Z",
      preparationCelebratedAt: "2026-11-21T12:00:00Z",
      footballInvitePresentedAt: "2026-11-21T12:00:00Z",
      footballStartedAt: "2026-11-21T12:00:00Z",
    });
    // Authentication UI shell and guide use isolated fixtures. Billing is never intercepted.
    const ready = page.waitForResponse(
      (r) => new URL(r.url()).pathname === "/api/admin/access" && r.ok(),
      { timeout: 90000 }
    );
    await Promise.all([login(page), ready]);
    await expect(page.getByTestId("admin-dashboard-card-monetizacao")).toBeVisible({
      timeout: 30000,
    });
    await expect
      .poll(
        async () =>
          (await page.context().cookies()).find((c) => c.name === "fut7pro_admin_active_tenant")
            ?.value
      )
      .toBe("grupo-fixture");
    await openSubscriptionCentral(page);
    const nav = page.getByRole("navigation", { name: "Central de Assinatura" });
    await expect(page.getByText("Acesso liberado", { exact: true })).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByRole("button", { name: "Regularizar pagamento" })).toBeEnabled();
    await expect(
      page.getByText("Assinatura registrada em").locator("..").locator("dd")
    ).not.toHaveText(/Não registrado|Consultando/);
    const capture = async (name: string) => {
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, 0));
      if (name !== "pix") {
        const refresh = page.getByRole("button", { name: "Atualizar", exact: true });
        await expect(refresh).toBeVisible();
        expect(
          (await refresh.boundingBox())!.height,
          "A ação de atualizar deve permanecer em uma linha"
        ).toBeLessThanOrEqual(48);
      }
      if (width === 320 && name !== "pix") {
        const link = page.getByTestId("admin-bottom-link-admin-comunicacao-notificacoes");
        const label = link.locator("span").filter({ hasText: "Notificações" }).first();
        expect(
          (await label.boundingBox())!.width,
          "O rótulo da navegação não deve invadir o próximo item"
        ).toBeLessThanOrEqual((await link.boundingBox())!.width);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      );
      const file = info.outputPath(`${name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      await info.attach(`${name}-${width}`, { path: file, contentType: "image/png" });
    };
    await capture("overview");
    await nav.getByRole("link", { name: "Benefícios" }).click();
    await expect(page.getByRole("heading", { name: "Benefícios do grupo" })).toBeVisible();
    await expect(page.getByText("Cortesia do Fut7Pro", { exact: false })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Benefícios" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await capture("benefits");
    await nav.getByRole("link", { name: "Pagamentos" }).focus();
    await page.keyboard.press("Enter");
    const detail = page
      .getByRole("button", { name: /Detalhar cobrança/ })
      .filter({ visible: true })
      .first();
    await expect(detail).toBeVisible();
    await capture("payments");
    await page.getByLabel("Situação", { exact: true }).selectOption("refunds");
    await page.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect(
      page.getByText("Devolução parcial", { exact: true }).filter({ visible: true })
    ).toBeVisible();
    await expect(
      page.getByText("Devolução total", { exact: true }).filter({ visible: true })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Detalhar cobrança/ }).filter({ visible: true })
    ).toHaveCount(2);
    await detail.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Detalhes da cobrança" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(detail).toBeFocused();
    await nav.getByRole("link", { name: "Planos", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Planos para o seu grupo" })).toBeVisible();
    await expect(page.getByText("Plano atual", { exact: true })).toBeVisible();
    await capture("plans");
    await page.getByRole("button", { name: "Anual", exact: true }).click();
    await expect(page.getByRole("button", { name: "Anual", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await page.goto("/admin/financeiro/planos-limites?faturas=1");
    await expect(page).toHaveURL(/\/admin\/assinatura\/pagamentos/);
    await page.goto("/admin/assinatura");
    const payment = page.getByRole("button", { name: "Regularizar pagamento" });
    await expect(payment).toBeEnabled();
    await payment.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Regularizar assinatura" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Gerar PIX", exact: true }).click();
    await expect(page.getByLabel("Código PIX copia e cola")).toHaveValue(
      "DEMONSTRACAO-SEM-VALOR-PARA-PAGAMENTO"
    );
    await expect(page.getByText(/Validade do PIX:.*horário de Brasília/)).toBeVisible();
    await capture("pix");
    await page.keyboard.press("Escape");
    await expect(payment).toBeFocused();
  });
}

test("Diretor de Futebol: resumo permitido e histórico protegido no backend real", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 900 });
  const guide = await installGuide(page);
  Object.assign(guide.state, {
    dashboardInviteDismissedAt: "2026-11-21T12:00:00Z",
    preparationCelebratedAt: "2026-11-21T12:00:00Z",
    footballInvitePresentedAt: "2026-11-21T12:00:00Z",
    footballStartedAt: "2026-11-21T12:00:00Z",
  });
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Entrar com senha", exact: true }).click();
  await page.getByTestId("admin-login-email").fill("futebol@fixture.invalid");
  await page.getByTestId("admin-login-password").fill("fixture-only-password");
  await page.getByTestId("admin-login-submit").click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 90000 });
  await expect
    .poll(
      async () =>
        (await page.context().cookies()).find((c) => c.name === "fut7pro_admin_active_tenant")
          ?.value
    )
    .toBe("grupo-fixture");
  await openSubscriptionCentral(page);
  await expect(page.getByRole("button", { name: "Regularizar pagamento" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Solicitar cancelamento" })).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Central de Assinatura" })
    .getByRole("link", { name: "Pagamentos" })
    .click();
  await expect(
    page.getByText(/O histórico detalhado está disponível aos responsáveis financeiros/)
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Detalhar cobrança/ })).toHaveCount(0);
  const path = info.outputPath("football-director-390.png");
  await page.screenshot({ path, fullPage: true });
  await info.attach("football-director-390", { path, contentType: "image/png" });
});
