import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL || process.env.TEST_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD || process.env.TEST_PASSWORD;
const shouldRun = Boolean(adminEmail) && Boolean(adminPassword);

const FORBIDDEN_TEXTS = ["mock", "em construção", "temporário", "placeholder"];

const HEADING_BY_ROUTE: Array<{ prefix: string; expected: RegExp }> = [
  { prefix: "/admin/dashboard", expected: /dashboard/i },
  { prefix: "/admin/partidas", expected: /partidas|times|sorteio|resultado|campeão|histórico/i },
  { prefix: "/admin/jogadores", expected: /jogadores|atletas|mensalistas|ranking/i },
  { prefix: "/admin/conquistas", expected: /conquistas|campeões|torneios/i },
  { prefix: "/admin/financeiro", expected: /financeiro|mensalistas|patrocinadores|planos/i },
  { prefix: "/admin/personalizacao", expected: /personalização|identidade|temas|rodapé|redes/i },
  { prefix: "/admin/administracao", expected: /administração|administradores|permissões|logs/i },
  {
    prefix: "/admin/comunicacao",
    expected: /comunicação|notificações|comunicados|enquetes|suporte|ajuda|mensagens/i,
  },
  {
    prefix: "/admin/configuracoes",
    expected: /configurações|domínio|integrações|backup|atualizações|cancelar/i,
  },
  { prefix: "/admin/monetizacao", expected: /monetização/i },
];

function expectedHeadingRegex(pathname: string) {
  return HEADING_BY_ROUTE.find((entry) => pathname.startsWith(entry.prefix))?.expected ?? null;
}

async function loginAdmin(page: Page) {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page
    .locator('[data-testid="admin-login-email"], input[type="email"]')
    .first()
    .fill(adminEmail || "");
  await page
    .locator('[data-testid="admin-login-password"], input[type="password"]')
    .first()
    .fill(adminPassword || "");
  const submit = page.locator(
    '[data-testid="admin-login-submit"], button:has-text("Entrar no painel")'
  );
  await submit.first().click();

  const loginState = await Promise.race([
    page
      .waitForURL(/\/admin\/(selecionar-racha|dashboard)/, { timeout: 20000 })
      .then(() => "redirect" as const)
      .catch(() => null),
    page
      .locator('[role="alert"], [aria-live="polite"]')
      .filter({ hasText: /E-mail ou senha inválidos|E-mail ou senha invalidos/i })
      .first()
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => "invalid_credentials" as const)
      .catch(() => null),
    page
      .locator('[role="alert"], [aria-live="polite"]')
      .filter({ hasText: /Acesso ao painel bloqueado/i })
      .first()
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => "blocked" as const)
      .catch(() => null),
  ]);

  if (loginState === "invalid_credentials") {
    throw new Error(
      "Falha de autenticação: e-mail/senha inválidos para o login admin. Verifique as credenciais E2E."
    );
  }

  if (loginState === "blocked") {
    throw new Error(
      "Conta autenticável, mas com acesso ao painel bloqueado. O smoke exige um admin com painel liberado."
    );
  }

  if (loginState !== "redirect") {
    throw new Error(
      "Login não redirecionou para /admin/selecionar-racha ou /admin/dashboard dentro do tempo esperado."
    );
  }

  if (page.url().includes("/admin/selecionar-racha")) {
    // Fluxo com 1 racha pode auto-redirecionar sem renderizar botão de seleção.
    const autoRedirected = await page
      .waitForURL(/\/admin\/dashboard/, { timeout: 12000 })
      .then(() => true)
      .catch(() => false);
    if (autoRedirected) {
      return;
    }

    const noTenantState = page.getByRole("heading", { name: /Nenhum racha encontrado/i });
    const hasNoTenantState = await noTenantState.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasNoTenantState) {
      throw new Error(
        "Login autenticado, mas o usuário não possui racha com acesso admin no Hub (/admin/selecionar-racha). Use uma conta vinculada a pelo menos 1 racha."
      );
    }

    const selector =
      '[data-testid^="admin-hub-select-"], button:has-text("Acessar painel"), button:has-text("Entrar neste racha")';
    const selectButton = page.locator(selector).first();
    await expect(selectButton).toBeVisible({ timeout: 12000 });
    await Promise.all([
      page.waitForURL(/\/admin\/dashboard/, { timeout: 20000 }),
      selectButton.click(),
    ]);
  }
}

async function openAllSidebarSections(page: Page) {
  const sidebar = page.getByTestId("admin-sidebar-desktop");
  await expect(sidebar).toBeVisible();

  const toggles = sidebar.locator('[data-testid^="admin-sidebar-toggle-"]');
  const toggleCount = await toggles.count();
  for (let i = 0; i < toggleCount; i += 1) {
    const toggle = toggles.nth(i);
    if ((await toggle.getAttribute("aria-expanded")) !== "true") {
      await toggle.click();
    }
  }
}

async function collectSidebarRoutes(page: Page) {
  await openAllSidebarSections(page);
  const sidebar = page.getByTestId("admin-sidebar-desktop");
  const hrefs = await sidebar.locator('[data-admin-nav-link="true"]').evaluateAll((elements) => {
    const routes = elements
      .map((element) => (element as HTMLAnchorElement).getAttribute("href") || "")
      .filter((href) => href.startsWith("/admin"));
    return Array.from(new Set(routes.map((href) => href.split("#")[0])));
  });
  return hrefs;
}

async function assertNoForbiddenTexts(page: Page) {
  const mainText = (await page.locator("main").innerText()).toLowerCase();
  FORBIDDEN_TEXTS.forEach((text) => {
    expect(mainText).not.toContain(text);
  });
}

async function assertPageHealthy(page: Page, expectedPath: string) {
  const response = await page.request.get(expectedPath, { failOnStatusCode: false });
  expect(response.status(), `Status inesperado em ${expectedPath}`).toBeLessThan(400);

  const pathname = new URL(page.url()).pathname;
  const expectedHeading = expectedHeadingRegex(pathname);
  const headings = page.locator("main h1, main h2, h1");
  await expect(headings.first()).toBeVisible({ timeout: 10000 });

  if (expectedHeading) {
    const headingTexts = await headings.allInnerTexts();
    const normalized = headingTexts.join(" ").toLowerCase();
    expect(normalized).toMatch(expectedHeading);
  }

  await assertNoForbiddenTexts(page);
}

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    try {
      if (!page.isClosed()) {
        await page.screenshot({
          path: testInfo.outputPath("admin-smoke-failure.png"),
          fullPage: true,
        });
      }
    } catch {
      // noop
    }
  }
});

test.describe("Admin Smoke Navigation", () => {
  test.setTimeout(180000);

  test("navega pelos principais itens do admin sem rota quebrada", async ({ page }) => {
    test.skip(!shouldRun, "E2E auth envs not set");

    await loginAdmin(page);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await assertPageHealthy(page, "/admin/dashboard");

    const sidebarRoutes = await collectSidebarRoutes(page);
    for (const route of sidebarRoutes) {
      await page.goto("/admin/dashboard");
      await openAllSidebarSections(page);

      const link = page
        .getByTestId("admin-sidebar-desktop")
        .locator(`[data-admin-nav-link="true"][href="${route}"]`)
        .first();
      await expect(link).toBeVisible();
      await Promise.all([
        page.waitForURL((url) => url.pathname === route, { timeout: 20000 }),
        link.click(),
      ]);
      await assertPageHealthy(page, route);
    }

    const headerRoutes = [
      {
        testId: "admin-header-link-admin-comunicacao-notificacoes",
        path: "/admin/comunicacao/notificacoes",
      },
      {
        testId: "admin-header-link-admin-comunicacao-mensagens",
        path: "/admin/comunicacao/mensagens",
      },
      {
        testId: "admin-header-link-admin-jogadores-listar-cadastrar-solicitacoes",
        path: "/admin/jogadores/listar-cadastrar",
      },
    ];

    for (const entry of headerRoutes) {
      await page.goto("/admin/dashboard");
      const link = page.getByTestId(entry.testId);
      await expect(link).toBeVisible();
      await Promise.all([
        page.waitForURL((url) => url.pathname === entry.path, { timeout: 20000 }),
        link.click(),
      ]);
      await assertPageHealthy(page, entry.path);
    }

    const dashboardCards = [
      { testId: "admin-dashboard-card-time-campeao", path: "/admin/partidas/time-campeao-do-dia" },
      { testId: "admin-dashboard-card-times-do-dia", path: "/admin/partidas/times-do-dia" },
      {
        testId: "admin-dashboard-card-sorteio-inteligente",
        path: "/admin/partidas/sorteio-inteligente",
      },
      { testId: "admin-dashboard-card-monetizacao", path: "/admin/monetizacao" },
      {
        testId: "admin-dashboard-quick-cadastrar-jogador",
        path: "/admin/jogadores/listar-cadastrar",
      },
      { testId: "admin-dashboard-quick-criar-partida", path: "/admin/partidas/criar" },
      {
        testId: "admin-dashboard-quick-adicionar-patrocinador",
        path: "/admin/financeiro/patrocinadores",
      },
      {
        testId: "admin-dashboard-quick-enviar-notificacao",
        path: "/admin/comunicacao/notificacoes",
      },
    ];

    for (const entry of dashboardCards) {
      await page.goto("/admin/dashboard");
      const cardLink = page.getByTestId(entry.testId);
      await expect(cardLink).toBeVisible();
      await Promise.all([
        page.waitForURL((url) => url.pathname === entry.path, { timeout: 20000 }),
        cardLink.click(),
      ]);
      await assertPageHealthy(page, entry.path);
    }
  });
});
