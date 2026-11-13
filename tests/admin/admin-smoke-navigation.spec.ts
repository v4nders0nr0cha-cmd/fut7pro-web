import { expect, test, type Page } from "@playwright/test";

const fixturePassword = "fixture-only-password";
const entryPath = "/admin/jogadores/listar-cadastrar#solicitacoes";
const monthlyPath = "/admin/jogadores/mensalistas#solicitacoes-mensalista";
const destinationContent: Record<string, RegExp> = {
  "/admin/partidas/time-campeao-do-dia": /Time Campeão do Dia/i,
  "/admin/partidas": /Partidas e Resultados/i,
  "/admin/partidas/sorteio-inteligente": /Sorteio Inteligente/i,
  "/admin/partidas/criar": /Criar Partidas/i,
  "/admin/monetizacao": /Monetização.*Lucre Mais/i,
  "/admin/jogadores/listar-cadastrar": /Jogadores cadastrados|Solicitações de entrada/i,
  "/admin/jogadores/mensalistas": /Gestão de Mensalistas/i,
  "/admin/conquistas": /Gestão de Conquistas/i,
  "/admin/financeiro/patrocinadores": /Patrocinadores/i,
  "/admin/financeiro/planos-limites": /Planos & Limites/i,
  "/admin/personalizacao/identidade-visual": /Identidade visual do grupo/i,
  "/admin/administracao/administradores": /Administradores do Grupo/i,
  "/admin/comunicacao/notificacoes": /Notificações/i,
  "/admin/comunicacao/mensagens": /Mensagens Recebidas/i,
  "/admin/configuracoes/dominio-proprio": /Domínio Próprio/i,
};

test.beforeEach(async ({ page }) => {
  expect(process.env.ADMIN_SMOKE_FIXTURE, "Este smoke exige a API local de fixtures").toBe("1");
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "accepted"));
  await page.route(/^https:\/\/api\.fut7pro\.com\.br(?:\/|$)/, async (route) => {
    await route.abort();
    throw new Error(`Admin Smoke tentou acessar API de produção: ${route.request().url()}`);
  });
});

async function login(page: Page, email: string) {
  await page.goto("/admin/login");
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
  const main = page.locator("main").first();
  await expect(main).toBeVisible();
  const expectedContent = destinationContent[new URL(href, "http://fixture.local").pathname];
  expect(expectedContent, `Destino sem assinatura de conteúdo: ${href}`).toBeDefined();
  await expect(main, `Página incorreta ou vazia em ${href}`).toContainText(expectedContent, {
    timeout: 30000,
  });
  await expect(page.getByText(/404|This page could not be found/i)).toHaveCount(0);
  await expect(
    page.getByText(/Falha ao carregar o painel|Painel demorou para responder/)
  ).toHaveCount(0);
}

async function openRequests(page: Page, variant: "header" | "bottom") {
  await expect(page.getByRole("button", { name: "Rejeitar" })).toHaveCount(0);
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

  test("controles principais da sidebar, cabeçalho e dashboard alcançam seus destinos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, "presidente@fixture.invalid");
    const sidebarRoutes = [
      { section: "partidas", path: "/admin/partidas" },
      { section: null, path: "/admin/conquistas" },
      { section: "financeiro", path: "/admin/financeiro/patrocinadores" },
      { section: "personalizacao", path: "/admin/personalizacao/identidade-visual" },
      { section: "administracao", path: "/admin/administracao/administradores" },
      { section: "comunicacao", path: "/admin/comunicacao/notificacoes" },
      { section: "configuracoes-do-grupo", path: "/admin/configuracoes/dominio-proprio" },
    ];
    for (const { section, path } of sidebarRoutes) {
      await page.goto("/admin/dashboard");
      const sidebar = page.getByTestId("admin-sidebar-desktop");
      await expect(sidebar).toBeVisible({ timeout: 30000 });
      if (section) await sidebar.getByTestId(`admin-sidebar-toggle-${section}`).click();
      const link = sidebar.locator(`[data-admin-nav-link="true"][href="${path}"]`);
      await expect(link, `Link da sidebar ausente: ${path}`).toBeVisible();
      await link.click();
      await expectDestination(page, path);
    }

    for (const path of ["/admin/comunicacao/notificacoes", "/admin/comunicacao/mensagens"]) {
      await page.goto("/admin/dashboard");
      const link = page.locator(`header [href="${path}"]`);
      await expect(link, `Link do cabeçalho ausente: ${path}`).toBeVisible();
      await link.click();
      await expectDestination(page, path);
    }

    for (const { testId, path } of [
      {
        testId: "admin-dashboard-card-time-campeao",
        path: "/admin/partidas/time-campeao-do-dia",
      },
      { testId: "admin-dashboard-card-partidas-resultados", path: "/admin/partidas" },
      {
        testId: "admin-dashboard-card-sorteio-inteligente",
        path: "/admin/partidas/sorteio-inteligente",
      },
      {
        testId: "admin-dashboard-card-monetizacao",
        path: "/admin/monetizacao",
      },
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
    ]) {
      await page.goto("/admin/dashboard");
      const link = page.getByTestId(testId);
      await expect(link, `Atalho do dashboard ausente: ${testId}`).toBeVisible();
      await link.click();
      await expectDestination(page, path);
    }
  });

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
    const paymentLink = page.getByRole("link", { name: /Ir para pagamento/ });
    await expect(paymentLink).toHaveAttribute("href", "/admin/financeiro/planos-limites");
    await paymentLink.click();
    await expectDestination(page, "/admin/financeiro/planos-limites");
    for (const restrictedPath of ["/admin/dashboard", "/admin/comunicacao/notificacoes"]) {
      await page.goto(restrictedPath);
      await expect(page).toHaveURL(/\/admin\/status-assinatura/);
      await expect(
        page.getByRole("heading", { name: /Painel bloqueado por inadimplência/ })
      ).toBeVisible();
    }
  });

  test("conta sem grupo apresenta estado vazio no Hub", async ({ page }) => {
    await login(page, "sem-grupo@fixture.invalid");
    await expect(page).toHaveURL(/\/admin\/selecionar-racha/);
    await expect(page.getByRole("heading", { name: /Nenhum grupo encontrado/i })).toBeVisible();
    await expect(page.getByTestId("admin-hub-list")).toHaveCount(0);
  });
});
