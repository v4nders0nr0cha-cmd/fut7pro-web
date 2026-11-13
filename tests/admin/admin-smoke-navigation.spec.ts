import { expect, test, type Page } from "@playwright/test";

const fixturePassword = "fixture-only-password";
const entryPath = "/admin/jogadores/listar-cadastrar#solicitacoes";
const monthlyPath = "/admin/jogadores/mensalistas#solicitacoes-mensalista";

test.beforeEach(async ({ page }) => {
  expect(process.env.ADMIN_SMOKE_FIXTURE, "Este smoke exige a API local de fixtures").toBe("1");
  await page.route(/^https:\/\/api\.fut7pro\.com\.br(?:\/|$)/, async (route) => {
    await route.abort();
    throw new Error(`Admin Smoke tentou acessar API de produção: ${route.request().url()}`);
  });
});

async function login(page: Page, email: string) {
  await page.goto("/admin/login");
  const rejectCookies = page.getByRole("button", { name: "Rejeitar" });
  if (await rejectCookies.isVisible()) await rejectCookies.click();
  await page.getByTestId("admin-login-email").fill(email);
  await page.getByRole("button", { name: "Entrar com senha" }).click();
  await page.getByTestId("admin-login-password").fill(fixturePassword);
  await page.getByTestId("admin-login-submit").click();
  await expect(page).toHaveURL(/\/admin\/(dashboard|status-assinatura|selecionar-racha)/, {
    timeout: 90000,
  });
  if (email !== "sem-grupo@fixture.invalid") {
    await expect(page).toHaveURL(
      email === "bloqueado@fixture.invalid" ? /\/admin\/status-assinatura/ : /\/admin\/dashboard/,
      { timeout: 60000 }
    );
  }
}

async function expectDestination(page: Page, href: string) {
  await expect(page, `Clique deve alcançar ${href}`).toHaveURL(
    (url) => `${url.pathname}${url.hash}` === href,
    { timeout: 60000 }
  );
  await expect(page.locator("main").first()).toBeVisible();
  await expect(
    page.getByText(/Falha ao carregar o painel|Painel demorou para responder/)
  ).toHaveCount(0);
}

async function openRequests(page: Page, variant: "header" | "bottom") {
  const trigger = page.getByTestId(`admin-${variant}-requests-trigger`);
  await expect(trigger).toBeVisible({ timeout: 30000 });
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const dialog = page.getByRole("dialog", { name: "Selecionar tipo de solicitação" });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

async function expectCountsAndLinks(page: Page, variant: "header" | "bottom") {
  const { trigger, dialog } = await openRequests(page, variant);
  const entry = dialog.getByRole("link", { name: /Entrada de jogadores/ });
  const monthly = dialog.getByRole("link", { name: /Solicitações de mensalista/ });
  await expect(entry).toContainText("2 pedidos aguardando análise", { timeout: 30000 });
  await expect(monthly).toContainText("1 pedido aguardando análise", { timeout: 30000 });
  await expect(entry).toHaveAttribute("href", entryPath);
  await expect(monthly).toHaveAttribute("href", monthlyPath);
  return { trigger, dialog, entry, monthly };
}

test.describe("Admin Smoke Navigation — fixtures locais", () => {
  test.setTimeout(420000);

  test("presidente: sidebar e Solicitações desktop navegam por clique", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, "presidente@fixture.invalid");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const sidebar = page.getByTestId("admin-sidebar-desktop");
    await expect(sidebar).toBeVisible({ timeout: 30000 });
    await sidebar.getByTestId("admin-sidebar-toggle-jogadores").click();
    const players = sidebar.getByTestId("admin-sidebar-link-admin-jogadores-listar-cadastrar");
    await expect(players).toBeVisible();
    await players.click();
    await expectDestination(page, "/admin/jogadores/listar-cadastrar");

    await page.goto("/admin/dashboard");
    let { trigger, dialog, entry } = await expectCountsAndLinks(page, "header");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    ({ entry } = await expectCountsAndLinks(page, "header"));
    await entry.click();
    await expectDestination(page, entryPath);

    await page.goto("/admin/dashboard");
    const { monthly } = await expectCountsAndLinks(page, "header");
    await monthly.click();
    await expectDestination(page, monthlyPath);
  });

  for (const viewport of [
    { name: "tablet", width: 800, height: 700 },
    { name: "celular", width: 390, height: 640 },
  ]) {
    test(`presidente: Solicitações ${viewport.name} abre, fecha e navega`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await login(page, "presidente@fixture.invalid");
      await expect(page).toHaveURL(/\/admin\/dashboard/);
      let { trigger, dialog } = await expectCountsAndLinks(page, "bottom");
      await expect(dialog).toHaveAttribute("aria-modal", "true");
      await expect(dialog).toBeInViewport();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      ({ dialog } = await expectCountsAndLinks(page, "bottom"));
      await dialog.getByRole("button", { name: "Fechar solicitações" }).click();
      await expect(dialog).toBeHidden();
      let { entry } = await expectCountsAndLinks(page, "bottom");
      await entry.click();
      await expectDestination(page, entryPath);

      await page.goto("/admin/dashboard");
      const { monthly } = await expectCountsAndLinks(page, "bottom");
      await monthly.click();
      await expectDestination(page, monthlyPath);
    });
  }

  test("administrador esportivo tem as duas opções autorizadas", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, "admin@fixture.invalid");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const { entry, monthly } = await expectCountsAndLinks(page, "header");
    await expect(entry).toBeEnabled();
    await expect(monthly).toBeEnabled();
    await monthly.click();
    await expectDestination(page, monthlyPath);
  });

  test("diretor de futebol vê contagem esportiva sem aprovação financeira", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, "futebol@fixture.invalid");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const { dialog } = await openRequests(page, "header");
    await expect(dialog.locator('[aria-disabled="true"]')).toHaveCount(2, { timeout: 30000 });
    await expect(dialog.locator('[aria-disabled="true"]').first()).toContainText("2");
    await expect(dialog.getByRole("link", { name: /Solicitações de mensalista/ })).toHaveCount(0);
    await expect(dialog.getByRole("link", { name: /Entrada de jogadores/ })).toHaveCount(0);
    await expect(dialog.locator('[aria-disabled="true"]').last()).toContainText("1");
    await expect(dialog.getByText(/Análise indisponível para seu cargo/)).toHaveCount(2);
  });

  test("grupo bloqueado não abre dashboard e oferece regularização", async ({ page }) => {
    await login(page, "bloqueado@fixture.invalid");
    await expect(page).toHaveURL(/\/admin\/status-assinatura/);
    await expect(
      page.getByRole("heading", { name: /Painel bloqueado por inadimplência/ })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Ir para pagamento/ })).toHaveAttribute(
      "href",
      "/admin/financeiro/planos-limites"
    );
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/status-assinatura/);
  });

  test("conta sem grupo apresenta estado vazio no Hub", async ({ page }) => {
    await login(page, "sem-grupo@fixture.invalid");
    await expect(page).toHaveURL(/\/admin\/selecionar-racha/);
    await expect(page.getByRole("heading", { name: /Nenhum grupo encontrado/i })).toBeVisible();
    await expect(page.getByTestId("admin-hub-list")).toHaveCount(0);
  });
});
