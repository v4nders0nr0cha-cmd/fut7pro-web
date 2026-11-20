import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { installGuide, login } from "./fixtures/guide-continuity";

const before = process.env.GUIDE_LAYOUT_VARIANT === "before";
const contexts = [
  ["ATHLETE_LEVELS", "/admin/jogadores/nivel-dos-atletas", true],
  ["ATHLETE_LEVELS", "/admin/jogadores/nivel-dos-atletas", false],
  ["ACTIVE_PLAYERS", "/admin/jogadores/listar-cadastrar", true],
  ["OFFICIAL_TEAMS", "/admin/partidas/criar-times", true],
  ["SCHEDULE", "/admin/rachas", true],
  ["FIRST_MATCHDAY", "/admin/partidas/criar", true],
  ["RESULTS_RECORDED", "/admin/partidas/resultados-do-dia", true],
  ["CHAMPION_PUBLISHED", "/admin/partidas/time-campeao-do-dia", true],
  ["FOOTBALL_PLAYERS", "/admin/jogadores/listar-cadastrar", true],
] as const;

async function paint(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
}
async function geometry(page: Page) {
  await paint(page);
  return page.evaluate(() => {
    const anchor = document.querySelector("[data-layout-content-anchor]")!;
    const panel = document.querySelector('[aria-label="Orientação do guia"]');
    return {
      top: anchor.getBoundingClientRect().top + scrollY,
      height: panel?.getBoundingClientRect().height ?? 0,
      viewportTop: anchor.getBoundingClientRect().top,
      dpr: devicePixelRatio,
      time: performance.now(),
    };
  });
}
type Box = Awaited<ReturnType<typeof geometry>>;

for (const width of [1280, 390, 320]) {
  test(`context layout ${width} loading refresh errors recovery and official changes`, async ({
    page,
    context,
  }, info) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width, height: 900 });
    const auth = await installGuide(page);
    auth.state.dashboardInviteDismissedAt = "2026-11-20T00:00:00Z";
    await login(page);
    await expect(page.getByTestId("admin-dashboard-card-sorteio-inteligente")).toBeVisible();
    await page.waitForLoadState("networkidle");
    const results: Array<Record<string, unknown>> = [];

    for (const [id, path, initialComplete] of contexts) {
      // Uma aba nova preserva o login real e começa sem o cache de guia da dashboard.
      const target = await context.newPage();
      await target.setViewportSize({ width, height: 900 });
      await target.emulateMedia({ reducedMotion: "reduce" });
      const fixture = await installGuide(target);
      Object.assign(fixture.state, {
        dashboardInviteDismissedAt: "2026-11-20T00:00:00Z",
        preparationCelebratedAt: "2026-11-20T00:00:00Z",
        footballInvitePresentedAt: "2026-11-20T00:00:00Z",
        footballStartedAt: "2026-11-20T00:00:00Z",
      });
      fixture.completed.add("OFFICIAL_TEAMS");
      fixture.setEligible(10);
      let held = true;
      let fail = false;
      let complete: boolean = initialComplete;
      let historicalComplete: boolean = initialComplete;
      let reads = 0;
      const releases: Array<() => void> = [];
      const release = () => {
        held = false;
        releases.splice(0).forEach((resolve) => resolve());
      };
      const players = Array.from({ length: 10 }, (_, i) => ({
        id: `player-${i + 1}`,
        name: `Atleta ${i + 1}`,
        position: "Meia",
        status: "Ativo",
        isBot: false,
        userId: null,
        photoUrl: null,
      }));
      const levels: Array<{
        athleteId: string;
        jogadorId: string;
        habilidade: number | null;
        fisico: number;
        atualizadoEm: string;
      }> = players.map((player) => ({
        athleteId: player.id,
        jogadorId: player.id,
        habilidade: 3,
        fisico: 3,
        atualizadoEm: "2026-11-20T00:00:00Z",
      }));
      if (!initialComplete) levels[0].habilidade = null;
      const posts: unknown[] = [];
      await target.route(/\/api\/jogadores(?:\?|$)/, (route) => route.fulfill({ json: players }));
      await target.route(/\/api\/admin\/solicitacoes(?:\?|$)/, (route) =>
        route.fulfill({ json: [] })
      );
      await target.route("**/api/admin/solicitacoes/auto-approve", (route) =>
        route.fulfill({ json: { autoApproveAthletes: false, autoApproveAthletesUntil: null } })
      );
      await target.route("**/api/estrelas", async (route) => {
        if (route.request().method() === "GET") return route.fulfill({ json: levels });
        const body = route.request().postDataJSON();
        posts.push(body);
        const index = levels.findIndex((item) => item.athleteId === body.athleteId);
        Object.assign(levels[index], body);
        complete = true;
        historicalComplete = true;
        return route.fulfill({ json: levels[index] });
      });
      await target.route("**/api/admin/rachas/agenda", (route) =>
        route.fulfill({
          json: [
            { id: "sat", weekday: 6, time: "06:27" },
            { id: "tue", weekday: 2, time: "20:00" },
          ],
        })
      );
      await target.route("**/api/admin/guide", async (route) => {
        if (route.request().method() !== "GET") return route.fallback();
        reads += 1;
        if (held) await new Promise<void>((resolve) => releases.push(resolve));
        if (fail) return route.fulfill({ status: 503, json: { message: "Consulta indisponível" } });
        const data = fixture.snapshot();
        data.tasks = data.tasks.map((task) => ({
          ...task,
          completed: task.id === id ? historicalComplete : task.completed,
        }));
        Object.assign(data.operationalState, {
          activeOfficialTeams: complete ? 2 : 1,
          invitedPlayers: complete ? 10 : 9,
          eligiblePlayerCount: 10,
          evaluatedEligiblePlayers: complete ? 10 : 9,
          eligibleLevelCoverage: complete ? 100 : 90,
          agendaConfigured: complete,
          validMatchCount: complete ? 1 : 0,
          hasMatchdayWithAllResults: complete,
          championPublished: complete,
        });
        data.eligibility = {
          ...data.eligibility,
          eligiblePlayers: complete ? 10 : 9,
          missingPlayers: complete ? 0 : 1,
          footballUnlocked: complete,
        };
        return route.fulfill({ json: data });
      });
      await target.addInitScript(() => {
        (window as any).__guideShifts = [];
        if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift")) return;
        new PerformanceObserver((list) => {
          for (const item of list.getEntries() as any) {
            (window as any).__guideShifts.push({
              time: item.startTime,
              value: item.value,
              recentInput: item.hadRecentInput,
              scrollY,
              guideRegions: (() => {
                const panel = document.querySelector('[aria-label="Orientação do guia"]');
                return panel
                  ? [...panel.children].map((node) => {
                      const rect = node.getBoundingClientRect();
                      return {
                        tag: node.tagName,
                        className: node.className,
                        height: rect.height,
                        width: rect.width,
                        text: node.textContent?.slice(0, 300),
                        details: [...node.querySelectorAll("details")].map((d) => d.open),
                        children: [...node.children].map((child) => ({
                          tag: child.tagName,
                          height: child.getBoundingClientRect().height,
                          width: child.getBoundingClientRect().width,
                          className: child.className,
                          descendants: [...child.querySelectorAll("*")].slice(0, 25).map((el) => ({
                            tag: el.tagName,
                            height: el.getBoundingClientRect().height,
                            width: el.getBoundingClientRect().width,
                            className: el.getAttribute("class"),
                            display: getComputedStyle(el).display,
                            alignSelf: getComputedStyle(el).alignSelf,
                          })),
                        })),
                      };
                    })
                  : [];
              })(),
              guideHeight: document
                .querySelector('[aria-label="Orientação do guia"]')
                ?.getBoundingClientRect().height,
              contentTop: (() => {
                const anchor = document.querySelector("[data-layout-content-anchor]");
                return anchor ? anchor.getBoundingClientRect().top + scrollY : null;
              })(),
              sources: (item.sources ?? []).map((source: any) => {
                const node =
                  source.node instanceof Element ? source.node : source.node?.parentElement;
                return {
                  area: node?.closest('[aria-label="Orientação do guia"]')
                    ? "guide"
                    : node?.closest("[data-layout-content-anchor]")
                      ? "content"
                      : "other",
                  dy: source.currentRect.y - source.previousRect.y,
                };
              }),
            });
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      try {
        await target.goto(`${path}?guia=${id}&guiaOrigem=dashboard`);
        await expect.poll(() => reads).toBeGreaterThan(0);
        if (id === "ATHLETE_LEVELS") {
          await expect(
            target.getByRole("button", { name: "Dar 5 estrelas", exact: true }).first()
          ).toBeEnabled();
        }
        // Marca o conteúdo operacional existente, sem inserir espaçador ou alterar seu estilo.
        await target
          .locator("main.flex-1")
          .first()
          .evaluate((main) => {
            const child = [...main.children].find(
              (node) => !node.matches('aside[aria-label="Orientação do guia"],script,style')
            );
            if (!child) throw new Error("Conteúdo abaixo do guia não encontrado");
            child.setAttribute("data-layout-content-anchor", "true");
          });
        await expect(target.locator("[data-layout-content-anchor]")).toBeVisible();
        await target.evaluate(() => document.fonts.ready);
        const panel = target.getByRole("complementary", { name: "Orientação do guia" });
        const first = await geometry(target);
        if (id === "ATHLETE_LEVELS")
          await target.screenshot({
            path: info.outputPath(
              `${before ? "before" : "after"}-${width}-${initialComplete ? "completed" : "pending"}-loading.png`
            ),
          });
        release();
        await expect(panel.getByRole("status")).toHaveText(
          id === "FOOTBALL_PLAYERS"
            ? "Requisito atendido"
            : initialComplete
              ? "Etapa concluída!"
              : "Em andamento"
        );
        const confirmed = await geometry(target);
        const measure = async (transition: string, a: Box, b: Box) => {
          const events = await target.evaluate(
            ({ start, end }) =>
              (window as any).__guideShifts.filter(
                (item: any) => item.time >= start && item.time <= end
              ),
            { start: a.time, end: b.time }
          );
          const delta = b.top - a.top;
          const row = {
            variant: before ? "before" : "after",
            browser: info.project.name,
            width,
            id,
            initialComplete,
            transition,
            contentDelta: delta,
            bannerDelta: b.height - a.height,
            beforeHeight: a.height,
            afterHeight: b.height,
            epsilon: 1 / b.dpr,
            layoutShiftSupported: await target.evaluate(() =>
              PerformanceObserver.supportedEntryTypes.includes("layout-shift")
            ),
            events,
          };
          results.push(row);
          // Uma unidade de pixel físico cobre o arredondamento das bordas rasterizadas.
          // O limite não é percentual nem proporcional ao tamanho do salto original.
          if (!before) {
            expect(Math.abs(delta), JSON.stringify(row)).toBeLessThanOrEqual(1 / b.dpr);
            for (const event of events) {
              if (typeof event.guideHeight === "number")
                expect(
                  Math.abs(event.guideHeight - b.height),
                  JSON.stringify(row)
                ).toBeLessThanOrEqual(1 / b.dpr);
            }
          }
        };
        await measure("initial-to-confirmed", first, confirmed);
        if (id === "ATHLETE_LEVELS")
          await target.screenshot({
            path: info.outputPath(
              `${before ? "before" : "after"}-${width}-${initialComplete ? "completed" : "pending"}-confirmed.png`
            ),
          });
        held = true;
        await target.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
        await expect(panel.getByRole("status")).toHaveText("Verificando progresso...");
        const refreshing = await geometry(target);
        await measure("confirmed-to-refreshing", confirmed, refreshing);
        if (id === "ATHLETE_LEVELS")
          await target.screenshot({
            path: info.outputPath(
              `${before ? "before" : "after"}-${width}-${initialComplete ? "completed" : "pending"}-refreshing.png`
            ),
          });
        if (!before) await expect(panel.getByText("Última confirmação:")).toBeVisible();
        complete = false;
        if (id === "ATHLETE_LEVELS") levels[0].habilidade = null;
        release();
        await expect(panel.getByRole("status")).toHaveText(
          id === "FOOTBALL_PLAYERS"
            ? "Reunindo jogadores"
            : historicalComplete
              ? "Etapa concluída!"
              : "Em andamento"
        );
        const changed = await geometry(target);
        await measure("refreshing-to-official-change", refreshing, changed);
        if (id === "ATHLETE_LEVELS") {
          held = true;
          await target.getByRole("button", { name: "Dar 5 estrelas", exact: true }).first().click();
          await expect.poll(() => posts.length).toBe(1);
          await expect(panel.getByRole("status")).toHaveText("Verificando progresso...");
          await expect(
            target.getByRole("button", { name: "Dar 5 estrelas", exact: true }).first()
          ).toBeEnabled();
          const saving = await geometry(target);
          await measure("pending-to-save-refresh", changed, saving);
          release();
          await expect(panel.getByRole("status")).toHaveText("Etapa concluída!");
          const saved = await geometry(target);
          await measure("save-refresh-to-confirmed", saving, saved);
          const field = target.getByRole("textbox").first();
          {
            await field.fill("Rascunho");
            await field.focus();
          }
          // A digitação filtra a lista e pode ajustar a rolagem. Sua geometria
          // é uma ação da página, separada da consulta do guia.
          const beforeError = await geometry(target);
          fail = true;
          await target.evaluate(() =>
            window.dispatchEvent(new Event("fut7pro:guide-data-changed"))
          );
          await expect(panel.getByRole("status")).toContainText("Não foi possível");
          const failed = await geometry(target);
          await measure("confirmed-to-error", beforeError, failed);
          await expect(field).toBeFocused();
          fail = false;
          await panel.getByRole("button", { name: "Tentar novamente", exact: true }).click();
          await expect(panel.getByRole("status")).toHaveText("Etapa concluída!");
          await measure("error-to-recovered", failed, await geometry(target));
        }
        expect(
          await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
        ).toBe(true);
        expect(
          fixture.actions.filter((action) => ["STEP_SELECTED", "STEP_SKIPPED"].includes(action))
        ).toEqual([]);
      } finally {
        release();
        await target.close();
        await writeFile(info.outputPath("layout-metrics.json"), JSON.stringify(results, null, 2));
      }
    }
    await info.attach("guide-layout-metrics", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });
  });
}
