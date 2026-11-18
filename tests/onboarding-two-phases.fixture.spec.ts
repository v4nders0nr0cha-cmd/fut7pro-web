import { expect, test } from "@playwright/test";

// Uses the existing local authentication fixture; never accesses production data.
for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 640 },
]) {
  test(`guide and invitation fit ${viewport.name}`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    expect(process.env.ADMIN_SMOKE_FIXTURE).toBe("1");
    await page.setViewportSize(viewport);
    await page.addInitScript(() => localStorage.setItem("cookie-consent", "accepted"));
    await page.route(/^https:\/\/api\.fut7pro\.com\.br(?:\/|$)/, (route) => route.abort());
    const ids = [
      "ACCOUNT_READY",
      "ACTIVE_PLAYERS",
      "SCHEDULE",
      "OFFICIAL_TEAMS",
      "ATHLETE_LEVELS",
      "FIRST_MATCHDAY",
      "RESULTS_RECORDED",
      "CHAMPION_PUBLISHED",
    ];
    const titles = [
      "Conta criada e site no ar",
      "Traga seus primeiros jogadores",
      "Defina os dias e horários",
      "Cadastre os times",
      "Avalie o nível dos atletas",
      "Prepare a primeira rodada",
      "Registre os resultados",
      "Publique o Time Campeão do Dia",
    ];
    const state = {
      revision: 1,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources: [],
    };
    const guide = {
      guideVersion: 3,
      tenant: {
        id: "fixture-tenant",
        slug: "grupo-fixture",
        name: "Pelada dos Amigos — Grupo de Futebol",
        publicUrl: "https://app.fut7pro.com.br/grupo-fixture",
        logoUrl: "/images/avatar_padrao_admin.png",
      },
      administrator: { membershipId: "fixture-membership", role: "PRESIDENTE", status: "APROVADO" },
      pedagogicalState: state,
      activationProgress: { completed: 1, total: 8, percentage: 13, complete: false },
      eligibility: {
        eligiblePlayers: 7,
        minimumPlayers: 10,
        missingPlayers: 3,
        preparationComplete: false,
        footballUnlocked: false,
      },
      phases: {
        preparation: {
          id: "PREPARATION",
          title: "Parte 1 — Prepare seu grupo",
          taskIds: ids.slice(0, 4),
          unlocked: true,
          completed: 1,
          total: 4,
          percentage: 25,
          complete: false,
        },
        football: {
          id: "FOOTBALL",
          title: "Parte 2 — Entre em campo",
          taskIds: ids.slice(4),
          unlocked: false,
          completed: 0,
          total: 4,
          percentage: 0,
          complete: false,
        },
      },
      tasks: ids.map((id, i) => ({
        id,
        title: titles[i],
        route: "/admin/rachas",
        requirement: "REQUIRED",
        completed: i === 0,
        canAct: true,
        applicable: true,
      })),
      actionAvailability: Object.fromEntries(
        ids.map((id, i) => [id, { allowed: i < 2, reason: i < 2 ? null : "PREVIOUS_STEPS" }])
      ),
      capabilities: {},
      operationalState: {},
      laterRecommendations: [],
      notices: {},
      nextAction: null,
    };
    await page.route("**/api/admin/guide", async (route) => {
      if (route.request().method() === "PATCH") {
        state.revision++;
        await route.fulfill({ json: { pedagogicalState: state } });
      } else await route.fulfill({ json: guide });
    });
    await page.goto("/admin/login");
    await page.getByTestId("admin-login-email").fill("presidente@fixture.invalid");
    await page.getByRole("button", { name: "Entrar com senha" }).click();
    await page.getByTestId("admin-login-password").fill("fixture-only-password");
    await page.getByTestId("admin-login-submit").click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 90_000 });
    const dialog = page.getByRole("dialog", { name: "Guia Interativo Fut7Pro" });
    await expect(dialog).toBeVisible({ timeout: 60_000 });
    const brandImage = dialog.locator("aside img").first();
    await expect
      .poll(
        () =>
          brandImage.evaluate(
            (element: HTMLImageElement) => element.complete && element.naturalWidth > 0
          ),
        { timeout: 60_000 }
      )
      .toBe(true);
    const fits = async () => {
      const box = await dialog.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await expect(dialog.getByRole("button", { name: "Fechar modal" })).toBeInViewport();
    };
    await fits();
    await dialog.screenshot({ path: testInfo.outputPath(`welcome-${viewport.name}.png`) });
    await dialog.getByRole("button", { name: "Sobre o Guia Interativo" }).click();
    await expect(
      dialog.getByRole("heading", { name: "Como funciona o Guia Interativo?" })
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Voltar ao guia" }).click();
    await dialog.getByRole("button", { name: "Convidar jogadores agora" }).click();
    for (const channel of ["WhatsApp", "Instagram"]) {
      await dialog.getByRole("button", { name: channel, exact: true }).click();
      await fits();
      const preview = dialog.getByRole("button", { name: `Ampliar imagem do ${channel}` });
      await preview.scrollIntoViewIfNeeded();
      const img = preview.locator("img");
      await expect
        .poll(
          () =>
            img.evaluate(
              (element: HTMLImageElement) => element.complete && element.naturalWidth > 0
            ),
          { timeout: 60_000 }
        )
        .toBe(true);
      expect((await img.boundingBox())!.height).toBeLessThanOrEqual(
        viewport.width < 640 ? 260 : 380
      );
      await dialog.screenshot({ path: testInfo.outputPath(`${channel}-${viewport.name}.png`) });
      await preview.click();
      await expect(dialog.getByRole("region", { name: "Imagem educativa ampliada" })).toBeVisible();
      await fits();
      await dialog.getByRole("button", { name: "Voltar às opções de convite" }).click();
    }
  });
}
