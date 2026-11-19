import { expect, test } from "@playwright/test";
import { addTeam, ids, installGuide, login, signOut } from "./fixtures/guide-continuity";
const dashboard = "/admin/dashboard";
const teamsPage = "/admin/partidas/criar-times";
const dialogName = "Guia Interativo Fut7Pro";
test("contextual team creation resumes the current page, persists X by real login, and keeps milestones alive", async ({
  page,
}, info) => {
  test.setTimeout(240_000);
  const fixture = await installGuide(page);
  await login(page);
  const guide = page.getByRole("dialog", { name: dialogName });
  await expect(
    guide.getByRole("heading", { name: "Cadastre os times", exact: true })
  ).toBeVisible();
  const firstLogin = await page.evaluate(() =>
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => s.user.onboardingLoginId)
  );
  await guide.getByRole("link", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/criar-times\?guia=OFFICIAL_TEAMS&guiaOrigem=dashboard/);
  await expect(guide).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mostrar Novo Time", exact: true })).toHaveCount(0);
  await addTeam(page, "Falha simulada");
  expect(fixture.teams).toHaveLength(0);
  expect(fixture.snapshot().tasks[3].completed).toBe(false);
  const form = page.getByRole("dialog", { name: "Adicionar time", exact: true });
  await form.getByLabel("Nome do time").fill("Time Azul");
  await form.getByRole("button", { name: "Adicionar time", exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(page.getByText(/1 de 2 times oficiais ativos/)).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao guia", exact: true }).click();
  await expect(
    guide.getByRole("heading", { name: "Cadastre os times", exact: true })
  ).toBeVisible();
  await guide.getByRole("link", { name: "Continuar", exact: true }).click();
  await addTeam(page, "Time Verde");
  await expect(page.getByRole("status").filter({ hasText: "Etapa concluída!" })).toBeVisible();
  await expect(page).toHaveURL(/criar-times/);
  await expect(guide).toHaveCount(0);
  await expect(page.getByText(/Os dois times necess/)).toBeVisible();
  await expect(page.getByText("Time adicionado", { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });
  await page
    .getByRole("complementary", { name: "Orientação do guia" })
    .screenshot({ path: info.outputPath("teams-complete-minimum.png") });
  // The real page action stays available; revalidation preserves its draft.
  await page.getByRole("button", { name: "Novo Time", exact: true }).first().click();
  await form.getByLabel("Nome do time").fill("Rascunho preservado");
  await page.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
  await expect(form.getByLabel("Nome do time")).toHaveValue("Rascunho preservado");
  await form.getByRole("button", { name: "Adicionar time", exact: true }).click();
  await expect(form).not.toBeVisible();
  expect(fixture.teams).toHaveLength(3);
  await expect(page.getByRole("status").filter({ hasText: "Etapa concluída!" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar no Guia Interativo", exact: true }).click();
  await expect(
    guide.getByRole("heading", { name: "Sua pelada está configurada! 🎉⚽" })
  ).toBeVisible();
  await expect(guide.getByText(/9 de 10 atletas cadastrados/)).toBeVisible();
  await guide.getByRole("button", { name: "Conhecer a Fase 2", exact: true }).click();
  await expect(guide.getByText("9 / 10", { exact: true })).toBeVisible();
  await expect(
    guide.getByRole("button", { name: "Avalie o nível dos atletas", exact: true })
  ).toBeEnabled();
  await expect(
    guide.getByRole("list", { name: "Etapas de Entre em campo" }).locator("li")
  ).toHaveCount(4);
  await expect(guide.getByRole("button", { name: "Continuar", exact: true })).toHaveCount(0);
  await guide.getByRole("button", { name: "Avalie o nível dos atletas", exact: true }).click();
  await expect(guide.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
  await expect(guide.getByRole("link", { name: "Continuar", exact: true })).toHaveCount(0);
  await guide.getByRole("button", { name: "Recolher orientação", exact: true }).click();
  await guide.screenshot({ path: info.outputPath("locked-football-phase.png") });
  await guide.getByRole("button", { name: "Rever etapas da Fase 1", exact: true }).click();
  await expect(
    guide.getByRole("list", { name: "Etapas de Prepare seu grupo" }).locator("li")
  ).toHaveCount(4);
  await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
  await page.getByRole("button", { name: "Continuar no Guia Interativo", exact: true }).click();
  await expect(
    guide.getByRole("list", { name: "Etapas de Entre em campo" }).locator("li")
  ).toHaveCount(4);
  expect(fixture.actions).not.toContain("FOOTBALL_STARTED");
  fixture.setEligible(10);
  await page.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
  await expect(guide.getByRole("heading", { name: /A galera está chegando/ })).toBeVisible();
  await guide.getByRole("button", { name: "Começar a Parte 2", exact: true }).click();
  await expect(
    guide.getByRole("heading", { name: "Avalie o nível dos atletas", exact: true })
  ).toBeVisible();
  await expect(
    guide.getByRole("list", { name: "Etapas de Entre em campo" }).locator("li")
  ).toHaveCount(4);
  await expect(guide.getByRole("list", { name: "Etapas de Prepare seu grupo" })).toHaveCount(0);
  if (info.project.name === "chromium")
    await expect(guide.getByRole("link", { name: "Continuar", exact: true })).toBeInViewport({
      ratio: 1,
    });
  await guide.screenshot({ path: info.outputPath("active-football-phase.png") });
  await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
  const reloadDashboard = async () => {
    if (new URL(page.url()).pathname !== dashboard) await page.goto(dashboard);
    await page.reload();
    await expect(page.getByTestId("admin-dashboard-card-partidas-resultados")).toBeVisible();
    // Read from the current document. WebKit can discard response bodies from
    // the previous document when a Dashboard request races with the reload.
    const [access, currentGuide] = await page.evaluate(async () =>
      Promise.all(
        ["/api/admin/access", "/api/admin/guide"].map(async (url) => {
          const response = await fetch(url, { cache: "no-store" });
          return { ok: response.ok, body: await response.json() };
        })
      )
    );
    expect(access.ok).toBe(true);
    expect(access.body).toMatchObject({ allowed: true });
    expect(currentGuide.ok).toBe(true);
    expect(currentGuide.body.tenant.slug).toBe("grupo-fixture");
  };
  await page.goto(dashboard);
  await reloadDashboard();
  await expect(guide).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((s) => s.user.onboardingLoginId)
    )
  ).toBe(firstLogin);
  await page.goto(teamsPage);
  await page.goto(dashboard);
  await expect(guide).toHaveCount(0);
  await signOut(page);
  await login(page);
  await expect(
    guide.getByRole("heading", { name: "Avalie o nível dos atletas", exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((s) => s.user.onboardingLoginId)
    )
  ).not.toBe(firstLogin);
  expect(fixture.actions.filter((action) => action === "PREPARATION_CELEBRATED")).toHaveLength(1);
  expect(fixture.actions.filter((action) => action === "FOOTBALL_INVITE_PRESENTED")).toHaveLength(
    1
  );
  await guide.getByRole("button", { name: "Não mostrar este Guia novamente", exact: true }).click();
  await guide.getByRole("button", { name: "Não mostrar novamente", exact: true }).click();
  await expect(guide).toHaveCount(0);
  await reloadDashboard();
  await expect(guide).toHaveCount(0);
  await page.goto(`${teamsPage}?guia=OFFICIAL_TEAMS&guiaOrigem=dashboard`);
  await page.getByRole("button", { name: "Continuar no Guia Interativo", exact: true }).click();
  await expect(guide).toBeVisible();
  await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
  await reloadDashboard();
  await expect(guide).toHaveCount(0);
  for (const post of fixture.posts) {
    expect(new URL(post.url).searchParams.has("guia")).toBe(false);
    expect(Object.keys(post.body).sort()).toEqual(["color", "logoUrl", "name"]);
  }
  await page.screenshot({ path: info.outputPath("clean-dashboard-after-dismissal.png") });
});

test("teams saved through the sidebar have the same conclusion and full-page guide keeps its return destination", async ({
  page,
}) => {
  test.setTimeout(150_000);
  const fixture = await installGuide(page);
  await login(page);
  const guide = page.getByRole("dialog", { name: dialogName });
  await expect(guide).toBeVisible();
  // Navigation away, unlike X, must not suspend the next Dashboard presentation.
  await guide.getByRole("link", { name: "Continuar", exact: true }).click();
  const openTeamsFromSidebar = async () => {
    const sidebar = page.getByTestId("admin-sidebar-desktop");
    const toggle = sidebar.getByTestId("admin-sidebar-toggle-partidas");
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    await sidebar.getByRole("link", { name: "Gerenciar Times", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/partidas\/criar-times$/);
  };
  await openTeamsFromSidebar();
  await expect(page.getByRole("complementary", { name: "Orientação do guia" })).toHaveCount(0);
  await addTeam(page, "Time do Menu A");
  await page.goto(dashboard);
  await expect(
    guide.getByRole("heading", { name: "Cadastre os times", exact: true })
  ).toBeVisible();
  await guide.getByRole("link", { name: "Continuar", exact: true }).click();
  await openTeamsFromSidebar();
  await addTeam(page, "Time do Menu B");
  await page.goto(dashboard);
  await expect(
    guide.getByRole("heading", { name: "Sua pelada está configurada! 🎉⚽" })
  ).toBeVisible();
  expect(fixture.teams).toHaveLength(2);
  await page.goto("/admin/guia-fut7pro");
  await expect(guide).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Etapas de Entre em campo" })).toBeVisible();
  await page.getByRole("button", { name: "Rever etapas da Fase 1", exact: true }).click();
  await page.getByRole("button", { name: /Cadastre os times$/ }).click();
  await page.getByRole("link", { name: "Consultar funcionalidade", exact: true }).click();
  await expect(page).toHaveURL(/guiaOrigem=pagina/);
  await expect(
    page.getByRole("link", { name: "Continuar no Guia Interativo", exact: true })
  ).toHaveAttribute("href", "/admin/guia-fut7pro");
});

for (const reward of [false, true])
  test(`final completion is celebrated once with commercial eligibility ${reward}`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const fixture = await installGuide(page);
    fixture.completed.add("OFFICIAL_TEAMS");
    fixture.state.preparationCelebratedAt = "2026-11-17T00:00:00Z";
    fixture.state.footballInvitePresentedAt = "2026-11-17T00:00:00Z";
    fixture.state.footballStartedAt = "2026-11-17T00:00:00Z";
    fixture.setEligible(10);
    await login(page);
    const guide = page.getByRole("dialog", { name: dialogName });
    // Each operational return consumes current persisted server state, not URL state.
    for (const id of ids.slice(4)) {
      await expect(
        guide.getByRole("heading", {
          name: fixture.snapshot().tasks.find((t) => t.id === id)!.title,
          exact: true,
        })
      ).toBeVisible();
      await guide.getByRole("link", { name: "Continuar", exact: true }).click();
      const destination = fixture.snapshot().tasks.find((task) => task.id === id)!.route;
      await expect(page).toHaveURL((url) => url.pathname === destination);
      await expect(guide).toHaveCount(0);
      fixture.completed.add(id);
      if (id === "CHAMPION_PUBLISHED") fixture.setRewardEligible(reward);
      await page.goto(dashboard);
    }
    await expect(
      guide.getByRole("heading", {
        name: reward ? "Você entrou para o jogo! 🏆" : "Guia concluído!",
        exact: true,
      })
    ).toBeVisible();
    if (reward) await expect(guide.getByText("+10 DIAS DE FUT7PRO", { exact: true })).toBeVisible();
    else {
      await expect(guide.getByText("+10 DIAS DE FUT7PRO", { exact: true })).toHaveCount(0);
      expect(fixture.actions).not.toContain("REWARD_CLAIM");
    }
    await guide
      .getByRole("button", { name: "Continuar aproveitando o Fut7Pro", exact: true })
      .click();
    await page.reload();
    await expect(guide).toHaveCount(0);
    expect(
      fixture.actions.filter(
        (action) => action === (reward ? "REWARD_PRESENTED" : "COMPLETION_PRESENTED")
      )
    ).toHaveLength(1);
  });

for (const width of [1280, 390, 320]) {
  test(`contextual team creation keeps locked phase two after reopening and refresh at ${width}`, async ({
    page,
  }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: width === 320 ? 640 : 900 });
    const fixture = await installGuide(page);
    fixture.completed.add("OFFICIAL_TEAMS");
    fixture.state.preparationCelebratedAt = "2026-11-18T12:00:00Z";
    fixture.state.footballInvitePresentedAt = "2026-11-18T12:00:00Z";
    fixture.setEligible(0);
    await login(page);
    const guide = page.getByRole("dialog", { name: dialogName });
    const phase = guide.getByRole("list", { name: "Etapas de Entre em campo" });
    await expect(phase.locator("li")).toHaveCount(4);
    await expect(guide.getByText("0 / 10", { exact: true })).toBeVisible();
    await expect(guide.getByText(/Faltam 10 atletas para liberar/)).toBeVisible();
    const indicator = guide.getByRole("region", {
      name: "Requisito para liberar a Fase 2",
      exact: true,
    });
    const indicatorBox = (await indicator.boundingBox())!;
    const listBox = (await phase.boundingBox())!;
    expect(indicatorBox.y + indicatorBox.height).toBeLessThanOrEqual(listBox.y);
    expect(indicatorBox.height).toBeLessThanOrEqual(width >= 1024 ? 104 : 128);
    await expect(guide.getByRole("button", { name: "Continuar", exact: true })).toHaveCount(0);
    if (width >= 1024) {
      await expect(indicator).toBeInViewport({ ratio: 1 });
      await expect(
        indicator.getByRole("button", { name: "Convidar jogadores", exact: true })
      ).toBeInViewport({ ratio: 1 });
    }

    for (const title of [
      "Avalie o nível dos atletas",
      "Prepare a primeira rodada",
      "Registre os resultados",
      "Publique o Time Campeão do Dia",
    ]) {
      await guide.getByRole("button", { name: title, exact: true }).click();
      await expect(guide.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(guide.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
      await expect(guide.getByRole("link", { name: "Continuar", exact: true })).toHaveCount(0);
    }
    await guide.getByRole("button", { name: "Rever etapas da Fase 1", exact: true }).click();
    await expect(
      guide.getByRole("list", { name: "Etapas de Prepare seu grupo" }).locator("li")
    ).toHaveCount(4);
    await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
    const reopen = async () => {
      if (width < 1024)
        await page.getByRole("button", { name: "Abrir Guia Interativo", exact: true }).click();
      else {
        await page.getByRole("button", { name: "Ajuda Fut7Pro", exact: true }).click();
        await page
          .getByRole("navigation", { name: "Ajuda Fut7Pro", exact: true })
          .getByRole("button", { name: /Guia Interativo/ })
          .click();
      }
      await expect(phase.locator("li")).toHaveCount(4);
      await expect(guide.getByText("0 / 10", { exact: true })).toBeVisible();
    };
    await reopen();
    await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
    await page.reload();
    await expect(page.getByTestId("admin-dashboard-card-partidas-resultados")).toBeVisible();
    await reopen();
    expect(fixture.actions).not.toContain("PREPARATION_CELEBRATED");
    expect(fixture.actions).not.toContain("FOOTBALL_STARTED");
    await expect(
      guide.getByRole("heading", { name: "Avalie o nível dos atletas", exact: true })
    ).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await guide.screenshot({ path: info.outputPath(`phase-two-locked-${width}.png`) });
    await guide.getByRole("button", { name: "Convidar jogadores", exact: true }).click();
    await expect(
      guide.getByRole("heading", { name: "Etapa concluída!", exact: true })
    ).toBeVisible();
    await guide
      .getByRole("button", { name: "Continuar para a próxima etapa", exact: true })
      .click();
    await expect(phase.locator("li")).toHaveCount(4);
    await expect(guide.getByText("0 / 10", { exact: true })).toBeVisible();
    fixture.setEligible(9);
    await page.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
    await expect(guide.getByText("9 / 10", { exact: true })).toBeVisible();
    await expect(guide.getByText(/Falta 1 atleta para liberar/)).toBeVisible();
    fixture.setEligible(10);
    await page.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
    await expect(
      guide.getByRole("region", { name: "Requisito para liberar a Fase 2", exact: true })
    ).toHaveCount(0);
    await expect(guide.getByRole("link", { name: "Continuar", exact: true })).toHaveAttribute(
      "href",
      /ATHLETE_LEVELS/
    );
    await guide.getByRole("button", { name: "Registre os resultados", exact: true }).click();
    await expect(guide.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
    expect(fixture.completed.has("OFFICIAL_TEAMS")).toBe(true);
    expect(fixture.actions).not.toContain("FOOTBALL_STARTED");
  });
}
