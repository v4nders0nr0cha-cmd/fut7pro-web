import { expect, test, type Page } from "@playwright/test";
import { GUIDE_STEP_ACTION_NAME, installGuide, login } from "./fixtures/guide-continuity";
function gate(fail = false) {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { pending, release, fail };
}
async function schedule(page: Page, mobile: boolean) {
  if (mobile) await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  const sidebar = page.getByTestId(mobile ? "admin-sidebar-mobile" : "admin-sidebar-desktop");
  const menu = sidebar.getByRole("button", { name: "Partidas", exact: true });
  if ((await menu.getAttribute("aria-expanded")) !== "true") await menu.click();
  await sidebar.locator('a[href="/admin/partidas/proximos-rachas"]').click();
  await expect(page).toHaveURL(/\/admin\/partidas\/proximos-rachas$/);
  await page.getByRole("link", { name: "Gerenciar dias e horarios", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/rachas$/);
  await expect(page.getByLabel("Horário", { exact: true })).toBeEnabled();
}
async function open(page: Page, mobile: boolean) {
  if (!mobile) await page.getByRole("button", { name: "Ajuda Fut7Pro", exact: true }).click();
  const trigger = mobile
    ? page.getByRole("button", { name: "Abrir Guia Interativo", exact: true })
    : page
        .getByRole("navigation", { name: "Ajuda Fut7Pro", exact: true })
        .getByRole("button", { name: /Guia Interativo/ });
  await trigger.evaluate((element) =>
    element.addEventListener(
      "click",
      () => {
        (window as any).__guideClickAt = performance.now();
      },
      { capture: true, once: true }
    )
  );
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Guia Interativo Fut7Pro" });
  await expect(dialog).toBeVisible();
  const elapsed = await page.evaluate(() => performance.now() - (window as any).__guideClickAt);
  expect(elapsed).toBeLessThan(1000);
  return { dialog, elapsed };
}
for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile320", width: 320, height: 640 },
  { name: "mobile390", width: 390, height: 844 },
]) {
  test(`immediate guide cold loading ${viewport.name} closes, retries and preserves the current form`, async ({
    page,
  }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    const mobile = viewport.width < 1024;
    const fixture = await installGuide(page);
    fixture.state.welcomePresentedAt = "2026-11-18T00:00:00Z";
    await page.route("**/api/admin/rachas/agenda", (route) => route.fulfill({ json: [] }));
    let pending = gate();
    let calls = 0;
    await page.route("**/api/admin/guide", async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      calls++;
      const current = pending;
      await current.pending;
      if (current.fail)
        return route.fulfill({ status: 503, json: { message: "Falha controlada de leitura" } });
      return route.fallback();
    });
    await login(page);
    await expect(page.getByTestId("admin-dashboard-card-partidas-resultados")).toBeVisible();
    await schedule(page, mobile);
    const input = page.getByLabel("Horário", { exact: true });
    await input.fill("18:15");
    const originalUrl = page.url();
    const first = await open(page, mobile);
    await expect(
      first.dialog.getByText("Carregando seu progresso...", { exact: true })
    ).toBeVisible();
    await expect(page).toHaveURL(originalUrl);
    expect(calls).toBe(1);
    await expect(
      first.dialog.getByRole("button", { name: "Fechar modal", exact: true })
    ).toBeFocused();
    await first.dialog.screenshot({ path: info.outputPath(`loading-${viewport.name}.png`) });
    await first.dialog.getByRole("button", { name: "Fechar modal", exact: true }).click();
    await expect(first.dialog).toHaveCount(0);
    const firstResponse = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/admin/guide"
    );
    pending.release();
    await firstResponse;
    await page.waitForLoadState("networkidle");
    await expect(first.dialog).toHaveCount(0);
    await expect(input).toHaveValue("18:15");
    const acknowledge = page.getByRole("button", { name: "Entendi", exact: true });
    if (await acknowledge.isVisible()) await acknowledge.click();
    await page.locator('header a[href="/admin/dashboard"]').click();
    await expect(page.getByTestId("admin-dashboard-card-partidas-resultados")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(first.dialog).toHaveCount(0);
    await schedule(page, mobile);
    await page.waitForLoadState("networkidle");
    // O refresh é parte do teste de cache frio, não um efeito do atalho.
    pending = gate(true);
    const access = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/admin/access"
    );
    await page.reload();
    expect((await access).ok()).toBe(true);
    await expect(input).toBeEnabled();
    await input.fill("19:45");
    const documentOrigin = await page.evaluate(() => performance.timeOrigin);
    const second = await open(page, mobile);
    await second.dialog.evaluate((element) => {
      (window as any).__guideDialog = element;
    });
    const failedResponse = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/admin/guide" && response.status() === 503
    );
    pending.release();
    await failedResponse;
    await expect(
      second.dialog.getByRole("button", { name: "Tentar novamente", exact: true })
    ).toBeVisible();
    await expect(
      second.dialog.getByRole("button", { name: "Fechar modal", exact: true })
    ).toBeVisible();
    await second.dialog.screenshot({ path: info.outputPath(`error-${viewport.name}.png`) });
    pending = gate();
    await second.dialog.getByRole("button", { name: "Tentar novamente", exact: true }).click();
    await expect(
      second.dialog.getByText("Carregando seu progresso...", { exact: true })
    ).toBeVisible();
    expect(
      await second.dialog.evaluate((element) => element === (window as any).__guideDialog)
    ).toBe(true);
    pending.release();
    await expect(
      second.dialog.getByRole("heading", { name: "Cadastre os times", exact: true })
    ).toBeVisible();
    await expect(
      second.dialog.getByRole("link", { name: GUIDE_STEP_ACTION_NAME, exact: true })
    ).toBeEnabled();
    expect(
      await second.dialog.locator(".overflow-y-auto").evaluate((element) => element.scrollTop)
    ).toBe(0);
    expect(
      await second.dialog.evaluate((element) => element === (window as any).__guideDialog)
    ).toBe(true);
    await expect(
      second.dialog.getByRole("button", { name: "Fechar modal", exact: true })
    ).toBeFocused();
    await expect(page).toHaveURL(originalUrl);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentOrigin);
    await expect(second.dialog).toHaveCount(1);
    await second.dialog.screenshot({ path: info.outputPath(`loaded-${viewport.name}.png`) });
    await second.dialog.getByRole("button", { name: "Fechar modal", exact: true }).click();
    await expect(input).toHaveValue("19:45");
    console.log(
      "GUIDE_COLD_OPEN",
      JSON.stringify({
        viewport,
        firstShellMs: first.elapsed,
        secondShellMs: second.elapsed,
        requestCount: calls,
        route: originalUrl,
      })
    );
  });
}
