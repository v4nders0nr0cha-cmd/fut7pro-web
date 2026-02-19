import { expect, test, type Page } from "@playwright/test";

const activeAdminEmail =
  process.env.E2E_ACTIVE_ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL || process.env.TEST_EMAIL;
const activeAdminPassword =
  process.env.E2E_ACTIVE_ADMIN_PASSWORD ||
  process.env.E2E_ADMIN_PASSWORD ||
  process.env.TEST_PASSWORD;
const blockedAdminEmail =
  process.env.E2E_BLOCKED_ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL || process.env.TEST_EMAIL;
const blockedAdminPassword =
  process.env.E2E_BLOCKED_ADMIN_PASSWORD ||
  process.env.E2E_ADMIN_PASSWORD ||
  process.env.TEST_PASSWORD;
const activeTenantSlug = process.env.E2E_ACTIVE_TENANT_SLUG;
const blockedTenantSlug = process.env.E2E_BLOCKED_TENANT_SLUG;

const shouldRunActive =
  Boolean(activeAdminEmail) &&
  Boolean(activeAdminPassword) &&
  process.env.E2E_RUN_ACTIVE_SMOKE === "1";
const shouldRunBlocked = Boolean(blockedAdminEmail) && Boolean(blockedAdminPassword);

const FORBIDDEN_TEXTS = ["mock", "em construção", "temporário", "placeholder"];

const HEADING_BY_ROUTE: Array<{ prefix: string; expected: RegExp }> = [
  { prefix: "/admin/dashboard", expected: /dashboard|pós-jogo|acoes rápidas|ações rápidas/i },
  {
    prefix: "/admin/partidas",
    expected: /partidas|times|sorteio|resultado|campeão|histórico|dias|hor[aá]rios/i,
  },
  { prefix: "/admin/jogadores", expected: /jogadores|atletas|mensalistas|ranking/i },
  { prefix: "/admin/conquistas", expected: /conquistas|campeões|torneios/i },
  {
    prefix: "/admin/financeiro",
    expected: /financeiro|mensalistas|patrocinadores|planos|prestação|contas/i,
  },
  { prefix: "/admin/personalizacao", expected: /personalização|identidade|temas|rodapé|redes/i },
  { prefix: "/admin/administracao", expected: /administração|administradores|permissões|logs/i },
  {
    prefix: "/admin/comunicacao",
    expected:
      /comunicação|notificações|comunicados|enquetes|suporte|ajuda|mensagens|sugestões|feedback/i,
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

type LoginExpectedAccess = "active" | "blocked" | "any";

type LoginOptions = {
  email: string;
  password: string;
  expectedAccess: LoginExpectedAccess;
  targetTenantSlug?: string;
};

type LoginResult = {
  path: string;
  access: "active" | "blocked";
};

async function selectTenantFromHub(
  page: Page,
  expectedAccess: LoginExpectedAccess,
  targetTenantSlug?: string
) {
  const allHubButtons = page.locator('[data-testid^="admin-hub-select-"]');

  if (targetTenantSlug) {
    const targetButton = page.getByTestId(`admin-hub-select-${targetTenantSlug}`).first();
    const targetExists = (await targetButton.count()) > 0;
    if (targetExists) {
      await expect(targetButton).toBeVisible({ timeout: 12000 });
      return targetButton;
    }
  }

  const expectedButtonText =
    expectedAccess === "blocked"
      ? /Ver status/i
      : expectedAccess === "active"
        ? /Acessar painel/i
        : /Acessar painel|Ver status/i;

  const matchedByText = allHubButtons.filter({ hasText: expectedButtonText }).first();
  const hasMatched = (await matchedByText.count()) > 0;
  if (hasMatched) {
    return matchedByText;
  }

  await expect(allHubButtons.first()).toBeVisible({ timeout: 12000 });
  return allHubButtons.first();
}

async function loginAdmin(page: Page, options: LoginOptions): Promise<LoginResult> {
  const { email, password, expectedAccess, targetTenantSlug } = options;
  await page.goto("/admin/login", { waitUntil: "domcontentloaded", timeout: 60000 });

  const submit = page.locator(
    '[data-testid="admin-login-submit"], button:has-text("Entrar no painel")'
  );
  await expect(submit.first()).toBeEnabled({ timeout: 30000 });

  const emailInput = page.locator('[data-testid="admin-login-email"], input[type="email"]').first();
  const passwordInput = page
    .locator('[data-testid="admin-login-password"], input[type="password"]')
    .first();

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await expect(emailInput).toHaveValue(email);
  await expect(passwordInput).toHaveValue(password);

  const waitLoginState = async () =>
    Promise.race([
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

  await submit.first().click();
  let loginState = await waitLoginState();

  // Retry defensivo para flakiness eventual no callback de login.
  if (!loginState) {
    const canRetry = await submit
      .first()
      .isEnabled()
      .catch(() => false);
    if (canRetry) {
      await submit.first().click();
      loginState = await waitLoginState();
    }
  }

  if (loginState === "invalid_credentials") {
    throw new Error(
      "Falha de autenticação: e-mail/senha inválidos para o login admin. Verifique as credenciais E2E."
    );
  }

  if (loginState === "blocked") {
    if (expectedAccess === "active") {
      throw new Error(
        "Conta autenticável, mas com acesso ao painel bloqueado. O cenário de navegação exige admin ativo."
      );
    }
    return { path: new URL(page.url()).pathname, access: "blocked" };
  }

  if (loginState !== "redirect") {
    throw new Error(
      "Login não redirecionou para /admin/selecionar-racha ou /admin/dashboard dentro do tempo esperado."
    );
  }

  if (page.url().includes("/admin/status-assinatura")) {
    if (expectedAccess === "active") {
      throw new Error(
        "Usuário caiu em /admin/status-assinatura, mas o cenário exige acesso ativo."
      );
    }
    return { path: "/admin/status-assinatura", access: "blocked" };
  }

  if (page.url().includes("/admin/dashboard")) {
    if (expectedAccess === "blocked") {
      throw new Error("Usuário entrou em /admin/dashboard, mas o cenário exige racha bloqueado.");
    }
    return { path: "/admin/dashboard", access: "active" };
  }

  if (page.url().includes("/admin/selecionar-racha")) {
    // Fluxo com 1 racha pode auto-redirecionar sem renderizar botão de seleção.
    const autoRedirected = await page
      .waitForURL(/\/admin\/(dashboard|status-assinatura)/, { timeout: 12000 })
      .then(() => true)
      .catch(() => false);
    if (autoRedirected) {
      const autoPath = new URL(page.url()).pathname;
      if (autoPath === "/admin/status-assinatura") {
        if (expectedAccess === "active") {
          throw new Error(
            "Usuário auto-redirecionado para /admin/status-assinatura, mas o cenário exige acesso ativo."
          );
        }
        return { path: autoPath, access: "blocked" };
      }
      if (expectedAccess === "blocked") {
        throw new Error(
          "Usuário auto-redirecionado para /admin/dashboard, mas o cenário exige racha bloqueado."
        );
      }
      return { path: autoPath, access: "active" };
    }

    const noTenantState = page.getByRole("heading", { name: /Nenhum racha encontrado/i });
    const hasNoTenantState = await noTenantState.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasNoTenantState) {
      throw new Error(
        "Login autenticado, mas o usuário não possui racha com acesso admin no Hub (/admin/selecionar-racha). Use uma conta vinculada a pelo menos 1 racha."
      );
    }

    const selectButton = await selectTenantFromHub(page, expectedAccess, targetTenantSlug);
    await Promise.all([
      page.waitForURL(/\/admin\/(dashboard|status-assinatura)/, { timeout: 20000 }),
      selectButton.click(),
    ]);
    const finalPath = new URL(page.url()).pathname;
    const finalAccess = finalPath === "/admin/status-assinatura" ? "blocked" : "active";

    if (expectedAccess === "active" && finalAccess !== "active") {
      throw new Error("Seleção de racha levou para bloqueio, mas o cenário exige admin ativo.");
    }
    if (expectedAccess === "blocked" && finalAccess !== "blocked") {
      throw new Error(
        "Seleção de racha levou para dashboard, mas o cenário exige racha bloqueado."
      );
    }
    return { path: finalPath, access: finalAccess };
  }

  throw new Error("Login concluiu, mas sem rota final reconhecida.");
}

async function waitForAdminShell(page: Page) {
  await page.waitForURL(/\/admin\//, { timeout: 20000 });
  const pathname = new URL(page.url()).pathname;
  if (pathname === "/admin/status-assinatura") {
    throw new Error("Fluxo ativo caiu em /admin/status-assinatura durante navegação.");
  }

  const loadingText = page.getByText(/Carregando painel/i).first();
  const loadingVisible = await loadingText.isVisible().catch(() => false);
  if (loadingVisible) {
    const cleared = await expect(loadingText)
      .toBeHidden({ timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (!cleared) {
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.getByText(/Carregando painel/i).first()).toBeHidden({ timeout: 10000 });
    }
  }

  let sidebar = page.getByTestId("admin-sidebar-desktop");
  if ((await sidebar.count()) === 0) {
    await page.reload({ waitUntil: "domcontentloaded" });
    sidebar = page.getByTestId("admin-sidebar-desktop");
  }
  await expect(sidebar).toBeVisible({ timeout: 30000 });
}

async function pinActiveTenantScope(page: Page, slug?: string) {
  if (!slug) return;
  const response = await page.request.post("/api/admin/hub/select", {
    data: { slug },
  });
  expect(response.status(), `Falha ao fixar tenant ativo: ${slug}`).toBeLessThan(400);
  const body = await response.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    "blocked" in body &&
    (body as { blocked?: boolean }).blocked
  ) {
    throw new Error(`Tenant ativo configurado (${slug}) retornou bloqueado ao fixar escopo.`);
  }
}

function sidebarToggleForRoute(route: string): string | null {
  if (route.startsWith("/admin/partidas")) return "admin-sidebar-toggle-partidas";
  if (route.startsWith("/admin/jogadores")) return "admin-sidebar-toggle-jogadores";
  if (route.startsWith("/admin/financeiro")) return "admin-sidebar-toggle-financeiro";
  if (route.startsWith("/admin/personalizacao")) return "admin-sidebar-toggle-personalizacao";
  if (route.startsWith("/admin/administracao")) return "admin-sidebar-toggle-administracao";
  if (route.startsWith("/admin/comunicacao")) return "admin-sidebar-toggle-comunicacao";
  if (route.startsWith("/admin/configuracoes")) return "admin-sidebar-toggle-configuracoes-extras";
  return null;
}

async function openSidebarSectionForRoute(page: Page, route: string) {
  await waitForAdminShell(page);
  const toggleTestId = sidebarToggleForRoute(route);
  if (!toggleTestId) return;

  const toggle = page.getByTestId(toggleTestId).first();
  const exists = (await toggle.count()) > 0;
  if (!exists) return;
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded !== "true") {
    await toggle.click();
  }
}

async function collectSidebarRoutes(page: Page) {
  await waitForAdminShell(page);
  const sidebar = page.getByTestId("admin-sidebar-desktop");
  const routes = new Set<string>();

  const collectVisibleRoutes = async () => {
    const hrefs = await sidebar.locator('[data-admin-nav-link="true"]').evaluateAll((elements) =>
      elements
        .map((element) => (element as HTMLAnchorElement).getAttribute("href") || "")
        .filter((href) => href.startsWith("/admin"))
        .map((href) => href.split("#")[0])
    );
    hrefs.forEach((href) => routes.add(href));
  };

  await collectVisibleRoutes();

  const toggles = sidebar.locator('[data-testid^="admin-sidebar-toggle-"]');
  const toggleCount = await toggles.count();
  for (let i = 0; i < toggleCount; i += 1) {
    const toggle = toggles.nth(i);
    if ((await toggle.getAttribute("aria-expanded")) !== "true") {
      await toggle.click();
    }
    await collectVisibleRoutes();
  }

  return Array.from(routes);
}

async function assertNoForbiddenTexts(page: Page) {
  const mains = page.locator("main");
  const mainCount = await mains.count();
  let mainText = "";
  for (let i = 0; i < mainCount; i += 1) {
    mainText += ` ${await mains.nth(i).innerText()}`;
  }
  const normalized = mainText.toLowerCase();
  FORBIDDEN_TEXTS.forEach((text) => {
    expect(normalized).not.toContain(text);
  });
}

async function assertPageHealthy(page: Page, expectedPath: string) {
  const pathname = new URL(page.url()).pathname;
  if (pathname.startsWith("/admin") && pathname !== "/admin/status-assinatura") {
    await waitForAdminShell(page);
  }
  const expectedHeading = expectedHeadingRegex(pathname);
  const main = page.locator("main").first();
  await expect(main).toBeVisible({ timeout: 10000 });

  const headings = main.locator("h1, h2");
  const headingCount = await headings.count();
  let normalized = "";

  if (headingCount > 0) {
    const headingTexts = await headings.allInnerTexts();
    normalized = headingTexts.join(" ").toLowerCase();
  } else {
    normalized = (await main.innerText()).toLowerCase();
  }

  if (expectedHeading) {
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
  test.setTimeout(420000);

  test("navega pelos principais itens do admin sem rota quebrada", async ({ page }) => {
    test.skip(!shouldRunActive, "Credenciais de admin ativo não configuradas.");

    await loginAdmin(page, {
      email: activeAdminEmail || "",
      password: activeAdminPassword || "",
      expectedAccess: "active",
      targetTenantSlug: activeTenantSlug,
    });
    await pinActiveTenantScope(page, activeTenantSlug);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await assertPageHealthy(page, "/admin/dashboard");

    const sidebarRoutes = await collectSidebarRoutes(page);
    for (const route of sidebarRoutes) {
      await pinActiveTenantScope(page, activeTenantSlug);
      await page.goto("/admin/dashboard");
      await openSidebarSectionForRoute(page, route);

      const link = page
        .getByTestId("admin-sidebar-desktop")
        .locator(`[data-admin-nav-link="true"][href="${route}"]`)
        .first();
      const visibleLink = await link.isVisible().catch(() => false);
      if (!visibleLink) {
        await page.goto(route);
        await assertPageHealthy(page, route);
        continue;
      }
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
      await pinActiveTenantScope(page, activeTenantSlug);
      await page.goto("/admin/dashboard");
      const link = page.getByTestId(entry.testId);
      const visibleLink = await link.isVisible().catch(() => false);
      if (!visibleLink) {
        await page.goto(entry.path);
        await assertPageHealthy(page, entry.path);
        continue;
      }
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
      await pinActiveTenantScope(page, activeTenantSlug);
      await page.goto("/admin/dashboard");
      const cardLink = page.getByTestId(entry.testId);
      const visibleCard = await cardLink.isVisible().catch(() => false);
      if (!visibleCard) {
        await page.goto(entry.path);
        await assertPageHealthy(page, entry.path);
        continue;
      }
      await Promise.all([
        page.waitForURL((url) => url.pathname === entry.path, { timeout: 20000 }),
        cardLink.click(),
      ]);
      await assertPageHealthy(page, entry.path);
    }
  });

  test("valida bloqueio por inadimplência com isolamento do tenant", async ({ page }) => {
    test.skip(!shouldRunBlocked, "Credenciais de admin bloqueado não configuradas.");

    const result = await loginAdmin(page, {
      email: blockedAdminEmail || "",
      password: blockedAdminPassword || "",
      expectedAccess: "blocked",
      targetTenantSlug: blockedTenantSlug,
    });

    expect(result.access).toBe("blocked");
    await expect(page).toHaveURL(/\/admin\/status-assinatura/);
    await expect(
      page.getByRole("heading", { name: /Painel bloqueado por inadimplência/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Ir para pagamento e regularizar acesso/i })
    ).toHaveAttribute("href", "/admin/financeiro/planos-limites");

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/status-assinatura/);

    await page.goto("/admin/financeiro/planos-limites");
    await expect(page).toHaveURL(/\/admin\/financeiro\/planos-limites/);
    await expect(page.getByRole("heading", { name: /Planos & Limites/i })).toBeVisible();

    await page.goto("/admin/comunicacao/notificacoes");
    await expect(page).toHaveURL(/\/admin\/status-assinatura/);
  });
});
