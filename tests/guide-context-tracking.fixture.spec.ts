import { expect, test } from "@playwright/test";
import { installGuide, login, addTeam } from "./fixtures/guide-continuity";

for (const width of [1280, 768, 390, 375, 320]) {
  test(`context tracking teams ${width} pending partial completed and current-page return`, async ({
    page,
  }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 });
    const fixture = await installGuide(page);
    await login(page);
    const dialog = page.getByRole("dialog", { name: "Guia Interativo Fut7Pro" });
    await dialog.getByRole("link", { name: "Continuar", exact: true }).click();
    const panel = page.getByRole("complementary", { name: "Orientação do guia" });
    await expect(panel.getByRole("status")).toHaveText("Em andamento");
    await expect(panel.getByText(/0 de 2 times/)).toBeVisible();
    await expect(panel.locator("details")).not.toHaveAttribute("open");
    await expect(panel.getByRole("button", { name: /Mostrar|Cadastrar outro time/ })).toHaveCount(
      0
    );
    await panel.screenshot({ path: info.outputPath(`context-teams-${width}-pending.png`) });
    await addTeam(page, "Time A");
    await expect(panel.getByText(/1 de 2 times/)).toBeVisible();
    await panel.screenshot({ path: info.outputPath(`context-teams-${width}-partial.png`) });
    await addTeam(page, "Time B");
    await expect(panel.getByRole("status")).toHaveText("Etapa concluída!");
    await expect(dialog).toHaveCount(0);
    await expect(panel.getByText(/Se seu grupo utiliza mais equipes/)).toBeVisible();
    await panel.screenshot({ path: info.outputPath(`context-teams-${width}-completed.png`) });
    await page.screenshot({
      path: info.outputPath(`context-teams-${width}-page.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    const location = page.url();
    await panel.getByRole("button", { name: "Continuar no Guia Interativo", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(location);
    await expect(
      dialog.getByRole("heading", { name: /Sua pelada está configurada/ })
    ).toBeVisible();
    expect(fixture.teams).toHaveLength(2);
  });
}

for (const width of [1280, 390, 320]) {
  test(`context tracking schedule ${width} real saves checking error retry and preserved draft`, async ({
    page,
  }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 844 });
    const fixture = await installGuide(page);
    fixture.completed.delete("SCHEDULE");
    const agenda: Array<{ id: string; weekday: number; time: string }> = [];
    let failSave = true;
    let failGuide = false;
    let delayGuide = false;
    let releaseRead: (() => void) | undefined;
    await page.route("**/api/admin/guide", async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      if (delayGuide)
        await new Promise<void>((resolve) => {
          releaseRead = resolve;
        });
      if (failGuide) return route.fulfill({ status: 503, json: { message: "Falha de consulta" } });
      const snapshot = fixture.snapshot();
      await route.fulfill({
        json: {
          ...snapshot,
          operationalState: { ...snapshot.operationalState, agendaConfigured: agenda.length > 0 },
        },
      });
    });
    await page.route("**/api/admin/rachas/agenda", async (route) => {
      if (route.request().method() === "GET") return route.fulfill({ json: agenda });
      if (failSave)
        return route.fulfill({ status: 400, json: { message: "Falha ao salvar horário" } });
      const entry = { id: `agenda-${agenda.length}`, ...route.request().postDataJSON() };
      agenda.push(entry);
      fixture.completed.add("SCHEDULE");
      return route.fulfill({ status: 201, json: entry });
    });
    await login(page);
    const dialog = page.getByRole("dialog", { name: "Guia Interativo Fut7Pro" });
    await dialog.getByRole("link", { name: "Continuar", exact: true }).click();
    const panel = page.getByRole("complementary", { name: "Orientação do guia" });
    await expect(page).toHaveURL(/\/admin\/rachas\?guia=SCHEDULE/);
    await expect(panel.getByText(/Nenhum dia e horário válido/)).toBeVisible();
    await panel.screenshot({ path: info.outputPath(`context-schedule-${width}-pending.png`) });
    await page.getByLabel("Horário", { exact: true }).fill("06:27");
    await page.getByRole("button", { name: "Adicionar", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Falha ao salvar");
    await expect(panel.getByRole("status")).toHaveText("Em andamento");
    await expect(page.getByLabel("Horário", { exact: true })).toHaveValue("06:27");
    failSave = false;
    delayGuide = true;
    await page.getByRole("button", { name: "Adicionar", exact: true }).click();
    await expect(panel.getByRole("status")).toHaveText("Verificando progresso...");
    await page.getByLabel("Horário", { exact: true }).fill("20:00");
    delayGuide = false;
    releaseRead?.();
    await expect(panel.getByRole("status")).toHaveText("Etapa concluída!");
    await expect(panel.getByText("Sábado, às 06:27")).toBeVisible();
    await expect(page.getByLabel("Horário", { exact: true })).toHaveValue("20:00");
    await panel.screenshot({ path: info.outputPath(`context-schedule-${width}-completed.png`) });
    await page.getByLabel("Dia da semana", { exact: true }).selectOption("2");
    await page.getByRole("button", { name: "Adicionar", exact: true }).click();
    await expect(panel.getByText("Terça-feira, às 20:00")).toBeVisible();
    failGuide = true;
    await page.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
    await expect(panel.getByRole("status")).toContainText("Não foi possível");
    await expect(panel.getByRole("status")).not.toContainText("Etapa concluída");
    failGuide = false;
    await panel.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(panel.getByRole("status")).toHaveText("Etapa concluída!");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.waitForLoadState("networkidle");
    await page.goto("/admin/rachas");
    await expect(panel).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Adicionar", exact: true })).toBeVisible();
  });
}
