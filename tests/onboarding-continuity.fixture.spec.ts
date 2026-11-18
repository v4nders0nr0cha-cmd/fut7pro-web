import { expect, test } from "@playwright/test";
import { addTeam, ids, installGuide, login, signOut } from "./fixtures/guide-continuity";
const dashboard = "/admin/dashboard";
const teamsPage = "/admin/partidas/criar-times";
const dialogName = "Guia Interativo Fut7Pro";
test("contextual team creation resumes the Dashboard, persists X by real login, and keeps milestones alive", async ({
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
  await page.getByRole("button", { name: "Mostrar Novo Time", exact: true }).click();
  await expect(page.getByRole("button", { name: "Novo Time", exact: true }).first()).toBeFocused();
  await addTeam(page, "Falha simulada");
  expect(fixture.teams).toHaveLength(0);
  expect(fixture.snapshot().tasks[3].completed).toBe(false);
  const form = page.getByRole("dialog", { name: "Adicionar time", exact: true });
  await form.getByLabel("Nome do time").fill("Time Azul");
  await form.getByRole("button", { name: "Adicionar time", exact: true }).click();
  await expect(form).not.toBeVisible();
  await expect(page.getByText(/1 de 2 times oficiais ativos/)).toBeVisible();
  await page.getByRole("link", { name: "Voltar ao guia", exact: true }).click();
  await expect(
    guide.getByRole("heading", { name: "Cadastre os times", exact: true })
  ).toBeVisible();
  await guide.getByRole("link", { name: "Continuar", exact: true }).click();
  await addTeam(page, "Time Verde");
  await expect(page.getByRole("heading", { name: "Etapa concluída!", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/criar-times/);
  await expect(guide).toHaveCount(0);
  await expect(
    page.getByText("Você já cadastrou os dois times necessários para concluir esta etapa!", {
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByText(
      "Se sua pelada utiliza mais equipes, aproveite para cadastrar os demais times que participam dos jogos. Assim, tudo fica organizado desde o início.",
      { exact: true }
    )
  ).toBeVisible();
  await expect(page.getByText("Time adicionado", { exact: true })).toHaveCount(0, {
    timeout: 15_000,
  });
  await page
    .getByRole("complementary", { name: "Orientação do guia" })
    .screenshot({ path: info.outputPath("teams-complete-minimum.png") });
  // The new contextual action opens the existing form; revalidation preserves it.
  await page.getByRole("button", { name: "Cadastrar outro time", exact: true }).click();
  await form.getByLabel("Nome do time").fill("Rascunho preservado");
  await page.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
  await expect(form.getByLabel("Nome do time")).toHaveValue("Rascunho preservado");
  await form.getByRole("button", { name: "Adicionar time", exact: true }).click();
  await expect(form).not.toBeVisible();
  expect(fixture.teams).toHaveLength(3);
  await expect(page.getByRole("heading", { name: "Etapa concluída!", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Continuar guia", exact: true }).click();
  await expect(
    guide.getByRole("heading", { name: "Sua pelada está configurada! 🎉⚽" })
  ).toBeVisible();
  await expect(guide.getByText(/9 de 10 atletas cadastrados/)).toBeVisible();
  await guide.getByRole("button", { name: "Agora não", exact: true }).click();
  await expect(guide.getByText(/9 de 10 atletas elegíveis/)).toBeVisible();
  await expect(
    guide.getByRole("button", { name: "Avalie o nível dos atletas", exact: true })
  ).toHaveCount(0);
  await expect(
    guide.getByRole("list", { name: "Etapas de Prepare seu grupo" }).locator("li")
  ).toHaveCount(4);
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
  await guide.screenshot({ path: info.outputPath("active-football-phase.png") });
  await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
  const reloadDashboard = async () => {
    const accessAfterRefresh = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/admin/access"
    );
    await page.reload();
    const accessResponse = await accessAfterRefresh;
    expect(accessResponse.ok(), await accessResponse.text()).toBe(true);
    expect(await accessResponse.json()).toMatchObject({ allowed: true });
    await expect(page.getByTestId("admin-dashboard-card-partidas-resultados")).toBeVisible();
  };
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
  await page.getByRole("link", { name: "Continuar guia", exact: true }).click();
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
  await page.getByRole("button", { name: /Cadastre os times$/ }).click();
  await page.getByRole("link", { name: "Consultar funcionalidade", exact: true }).click();
  await expect(page).toHaveURL(/guiaOrigem=pagina/);
  await expect(page.getByRole("link", { name: "Continuar guia", exact: true })).toHaveAttribute(
    "href",
    "/admin/guia-fut7pro"
  );
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
