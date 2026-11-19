import { expect, test, type Page } from "@playwright/test";
import { ids, installGuide, login } from "./fixtures/guide-continuity";
const name = "Guia Interativo Fut7Pro";
async function refreshed(page: Page) {
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByTestId("admin-dashboard-card-partidas-resultados")).toBeVisible();
  const access = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/admin/access"
  );
  await page.reload();
  expect((await access).ok()).toBe(true);
  await expect(page.getByTestId("admin-dashboard-card-partidas-resultados")).toBeVisible();
  await page.waitForLoadState("networkidle", { timeout: 15_000 });
}
async function floatingGuide(page: Page) {
  await page.getByRole("button", { name: "Ajuda Fut7Pro", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Ajuda Fut7Pro", exact: true })
    .getByRole("button", { name: /Guia Interativo/ })
    .click();
  await expect(page.getByRole("navigation", { name: "Ajuda Fut7Pro", exact: true })).toHaveCount(0);
}
test("quick guide access desktop keeps the profile page and manual preferences", async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  const fixture = await installGuide(page);
  await login(page);
  const guide = page.getByRole("dialog", { name });
  await expect(
    guide.getByRole("heading", { name: "Cadastre os times", exact: true })
  ).toBeVisible();
  await page.evaluate(() => ((window as any).__guideDocument = "same-document"));
  await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
  const hint = page.getByTestId("guide-access-hint");
  await expect(hint).toBeVisible();
  const helpBox = (await page
    .getByRole("button", { name: "Ajuda Fut7Pro", exact: true })
    .boundingBox())!;
  const hintBox = (await hint.boundingBox())!;
  expect(hintBox.y + hintBox.height).toBeLessThan(helpBox.y);
  await page.screenshot({ path: info.outputPath("desktop-access-hint.png") });
  await floatingGuide(page);
  await expect(guide).toBeVisible();
  await expect(hint).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  expect(await page.evaluate(() => (window as any).__guideDocument)).toBe("same-document");
  await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
  await expect(hint).toHaveCount(0);
  await floatingGuide(page);
  await guide.getByRole("link", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/criar-times/);
  await expect(guide).toHaveCount(0);
  const operationalUrl = page.url();
  await floatingGuide(page);
  await expect(page).toHaveURL(operationalUrl);
  await expect(
    guide.getByRole("heading", { name: "Cadastre os times", exact: true })
  ).toBeVisible();
  await guide.getByRole("button", { name: "Não mostrar este Guia novamente", exact: true }).click();
  await guide.getByRole("button", { name: "Não mostrar novamente", exact: true }).click();
  await expect(hint).toHaveCount(0);
  const permanent = fixture.state.dashboardInviteDismissedAt;
  await floatingGuide(page);
  await expect(guide).toBeVisible();
  expect(fixture.state.dashboardInviteDismissedAt).toBe(permanent);
  await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
  await page.locator('header a[href="/admin/dashboard"]').click();
  await refreshed(page);
  await expect(guide).toHaveCount(0);
  await expect(hint).toHaveCount(0);
  await page.getByRole("button", { name: /Abrir menu do perfil/ }).click();
  await page
    .getByRole("navigation", { name: "Menu do perfil", exact: true })
    .getByRole("link", { name: "Guia Interativo", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/guia-fut7pro$/);
  await expect(guide).toHaveCount(0);
});
for (const viewport of [
  { width: 320, height: 640 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
]) {
  test(`quick guide access mobile ${viewport.width} keeps the header aligned and hides after completion`, async ({
    page,
  }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    const fixture = await installGuide(page);
    await login(page);
    const guide = page.getByRole("dialog", { name });
    await expect(guide).toBeVisible();
    const book = page.getByRole("button", { name: "Abrir Guia Interativo", exact: true });
    await expect(book).toBeAttached();
    await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
    const hint = page.getByTestId("guide-access-hint");
    await expect(hint).toBeVisible();
    const bookBox = (await book.boundingBox())!;
    const avatarBox = (await page
      .getByRole("link", { name: "Abrir Mais", exact: true })
      .boundingBox())!;
    const header = page.locator("header").first();
    const headerBox = (await header.boundingBox())!;
    expect(bookBox.width).toBeGreaterThanOrEqual(44);
    expect(bookBox.height).toBeGreaterThanOrEqual(44);
    expect(bookBox.x + bookBox.width).toBeLessThanOrEqual(avatarBox.x);
    expect(headerBox.height).toBe(56);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    const hintBox = (await hint.boundingBox())!;
    expect(hintBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
    expect(hintBox.x).toBeGreaterThanOrEqual(0);
    expect(hintBox.x + hintBox.width).toBeLessThanOrEqual(viewport.width);
    expect(hintBox.y + hintBox.height).toBeLessThanOrEqual(viewport.height);
    await page.screenshot({ path: info.outputPath(`mobile-access-${viewport.width}.png`) });
    await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
    await expect(hint).toHaveCount(0);
    await page
      .getByTestId("admin-sidebar-mobile")
      .getByRole("button", { name: "Fechar menu", exact: true })
      .click();
    await expect(hint).toBeVisible();
    await book.click();
    await expect(guide).toBeVisible();
    await expect(hint).toHaveCount(0);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await guide.getByRole("link", { name: "Continuar", exact: true }).click();
    await expect(page).toHaveURL(/criar-times/);
    const operationalUrl = page.url();
    await book.click();
    await expect(page).toHaveURL(operationalUrl);
    await expect(
      guide.getByRole("heading", { name: "Cadastre os times", exact: true })
    ).toBeVisible();
    await guide
      .getByRole("button", { name: "Não mostrar este Guia novamente", exact: true })
      .click();
    await guide.getByRole("button", { name: "Não mostrar novamente", exact: true }).click();
    await expect(book).toBeVisible();
    await expect(hint).toHaveCount(0);
    const permanent = fixture.state.dashboardInviteDismissedAt;
    await book.click();
    await expect(guide).toBeVisible();
    expect(fixture.state.dashboardInviteDismissedAt).toBe(permanent);
    await guide.getByRole("button", { name: "Fechar modal", exact: true }).click();
    await page.locator('header a[href="/admin/dashboard"]').click();
    await refreshed(page);
    await expect(guide).toHaveCount(0);
    await expect(hint).toHaveCount(0);
    ids.forEach((id) => fixture.completed.add(id));
    fixture.setEligible(10);
    fixture.state.completionPresentedAt = new Date().toISOString();
    await page.evaluate(() => window.dispatchEvent(new Event("fut7pro:guide-data-changed")));
    await expect(book).toHaveCount(0);
    await page.getByRole("link", { name: "Abrir Mais", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/mais$/);
    await page.getByRole("link", { name: "Guia Interativo", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/guia-fut7pro$/);
    await expect(guide).toHaveCount(0);
  });
}
for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile 320", width: 320, height: 640 },
  { name: "mobile 390", width: 390, height: 844 },
]) {
  test(`guide footer and public site ${viewport.name}`, async ({ page, context }, info) => {
    await page.setViewportSize(viewport);
    const fixture = await installGuide(page);
    fixture.state.welcomePresentedAt = "2026-11-18T00:00:00Z";
    await context.route("**/grupo-fixture", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<title>Site público do grupo</title><h1>Grupo Fixture</h1>",
      })
    );
    await login(page);
    const dialog = page.getByRole("dialog", { name });
    await expect(
      dialog.getByRole("heading", { name: "Cadastre os times", exact: true })
    ).toBeVisible();
    const scroller = dialog.locator(".overflow-y-auto");
    expect(await scroller.evaluate((el) => el.scrollTop)).toBe(0);
    const banner = await dialog.locator("aside").boundingBox();
    const body = await scroller.boundingBox();
    expect(banner!.y).toBeGreaterThanOrEqual(body!.y);
    await dialog.screenshot({ path: info.outputPath(`initial-${viewport.width}.png`) });
    const footer = dialog.locator('footer[aria-label="Preferências do guia"]');
    const footerBox = (await footer.boundingBox())!;
    const columns = [
      dialog.locator("aside"),
      dialog.locator('section[aria-label="Primeiros passos do grupo"]'),
    ];
    for (const column of columns) {
      const box = (await column.boundingBox())!;
      expect(footerBox.y).toBeGreaterThanOrEqual(box.y + box.height);
    }
    expect(await footer.evaluate((el) => getComputedStyle(el).position)).toBe("static");
    const adminUrl = page.url();
    const documentOrigin = await page.evaluate(() => performance.timeOrigin);
    await dialog.getByRole("button", { name: /Conta criada e site no ar/ }).click();
    const link = dialog.getByRole("link", { name: "Ver site do grupo", exact: true });
    await expect(link).toHaveAttribute("href", "/grupo-fixture");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await page.waitForLoadState("networkidle");
    const actions = [...fixture.actions];
    const progress = fixture.snapshot().activationProgress;
    const popupPromise = page.waitForEvent("popup");
    await link.click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    await expect(popup).toHaveURL(/\/grupo-fixture$/);
    expect(await popup.evaluate(() => window.opener === null)).toBe(true);
    await popup.close();
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(adminUrl);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentOrigin);
    expect(fixture.actions).toEqual(actions);
    expect(fixture.snapshot().activationProgress).toEqual(progress);
    const dismiss = footer.getByRole("button", {
      name: "Não mostrar este Guia novamente",
      exact: true,
    });
    await dismiss.scrollIntoViewIfNeeded();
    await dialog.screenshot({ path: info.outputPath(`footer-${viewport.width}.png`) });
    await dismiss.click();
    await expect(dialog.getByRole("alertdialog")).toBeVisible();
    await dialog.getByRole("button", { name: "Manter o guia", exact: true }).click();
    await expect(dismiss).toBeFocused();
    await dialog.getByRole("button", { name: "Fechar modal", exact: true }).click();
    if (viewport.name === "desktop") await floatingGuide(page);
    else await page.getByRole("button", { name: "Abrir Guia Interativo", exact: true }).click();
    await expect(
      dialog.getByRole("heading", { name: "Cadastre os times", exact: true })
    ).toBeVisible();
    expect(await scroller.evaluate((el) => el.scrollTop)).toBe(0);
    await dialog.screenshot({ path: info.outputPath(`reopened-${viewport.width}.png`) });
    console.log(
      "GUIDE_INITIAL_SCROLL",
      JSON.stringify({
        viewport: viewport.width,
        scrollTop: await scroller.evaluate((el) => el.scrollTop),
      })
    );
  });
}
