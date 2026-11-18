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
    const state: {
      revision: number;
      knownTips: string[];
      dismissedTips: string[];
      snoozedTips: Record<string, string>;
      viewedResources: string[];
      welcomePresentedAt?: string;
      rewardPresentedAt?: string;
    } = {
      revision: 1,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources: [],
    };
    const guide = {
      guideVersion: 3,
      reward: {
        granted: false,
        eligible: false,
        days: 10,
        grantedAt: null as string | null,
        trialEnd: null as string | null,
        reason: null as string | null,
      },
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
        if (route.request().postDataJSON().action === "WELCOME_PRESENTED")
          state.welcomePresentedAt = new Date().toISOString();
        const action = route.request().postDataJSON().action;
        if (action === "REWARD_CLAIM")
          guide.reward = {
            granted: true,
            eligible: false,
            days: 10,
            grantedAt: new Date().toISOString(),
            trialEnd: "2099-01-20T18:00:00Z",
            reason: null,
          };
        if (action === "REWARD_PRESENTED") state.rewardPresentedAt = new Date().toISOString();
        await route.fulfill({ json: { pedagogicalState: state, reward: guide.reward } });
      } else await route.fulfill({ json: guide });
    });
    await page.route("**/api/auth/session", async (route) => {
      const response = await route.fetch();
      const session = await response.json();
      if (session?.user) session.user.image = "/images/avatar_padrao_admin.png";
      await route.fulfill({ response, json: session });
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
    await expect(dialog.getByRole("button", { name: "Agora não", exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Pular por enquanto" })).toHaveCount(0);
    await expect(
      dialog.getByRole("button", { name: "Não mostrar este Guia novamente" })
    ).toBeVisible();
    const logos = [
      "/images/logos/logo_fut7pro.png",
      `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><circle cx="80" cy="80" r="75" fill="#e32929"/><text x="80" y="98" text-anchor="middle" font-size="50" fill="white">F7</text></svg>')}`,
      `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="140"><rect width="220" height="140" fill="#1677c8"/><text x="110" y="88" text-anchor="middle" font-size="50" fill="white">F7</text></svg>')}`,
    ];
    for (const [index, src] of logos.entries()) {
      await brandImage.evaluate((element: HTMLImageElement, url) => {
        element.removeAttribute("srcset");
        element.src = url;
      }, src);
      await expect
        .poll(() =>
          brandImage.evaluate(
            (element: HTMLImageElement) => element.complete && element.naturalWidth > 0
          )
        )
        .toBe(true);
      expect(await brandImage.evaluate((element) => getComputedStyle(element).objectFit)).toBe(
        "contain"
      );
      expect(
        await brandImage.evaluate(
          (element) => getComputedStyle(element.parentElement!).backgroundImage
        )
      ).toBe("none");
      await dialog.screenshot({
        path: testInfo.outputPath(`identity-${index}-${viewport.name}.png`),
      });
    }
    await brandImage.evaluate((element: HTMLImageElement) => {
      element.src = "/images/avatar_padrao_admin.png";
    });
    await expect
      .poll(() =>
        brandImage.evaluate(
          (element: HTMLImageElement) => element.complete && element.naturalWidth > 0
        )
      )
      .toBe(true);
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
    await dialog.getByRole("button", { name: "Fechar modal" }).click();
    await expect(page.getByRole("button", { name: "Continuar guia", exact: true })).toHaveCount(0);
    await expect(page.getByRole("complementary", { name: "Guia Fut7Pro" })).toHaveCount(0);
    guide.tasks.forEach((task) => {
      task.completed = true;
    });
    guide.activationProgress = { completed: 8, total: 8, percentage: 100, complete: true };
    guide.phases.preparation = {
      ...guide.phases.preparation,
      completed: 4,
      percentage: 100,
      complete: true,
    };
    guide.phases.football = {
      ...guide.phases.football,
      completed: 4,
      percentage: 100,
      complete: true,
      unlocked: true,
    };
    guide.reward.eligible = true;
    await page.reload();
    await expect(page.getByText("+10 DIAS DE FUT7PRO", { exact: true })).toBeVisible();
    await dialog.screenshot({ path: testInfo.outputPath(`reward-${viewport.name}.png`) });
    await page.getByRole("button", { name: "Continuar aproveitando o Fut7Pro" }).click();
    await expect(dialog).toHaveCount(0);
    await page.goto("/admin/guia-fut7pro");
    await expect(
      page.getByText(/Conquista do guia: \+10 dias de Fut7Pro concedidos ao grupo/)
    ).toBeVisible();
    await expect(dialog).toHaveCount(0);
  });
}
