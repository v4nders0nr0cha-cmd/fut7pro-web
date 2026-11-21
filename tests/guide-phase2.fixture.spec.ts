import { expect, test } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";

for (const width of [1280, 390, 320]) {
  test(`phase 2 modality selection at ${width}px`, async ({ page }, info) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 900 });
    const fixture = await installGuide(page);
    Object.assign(fixture.state, {
      dashboardInviteDismissedAt: "2026-11-21T12:00:00Z",
      preparationCelebratedAt: "2026-11-21T12:00:00Z",
      footballInvitePresentedAt: "2026-11-21T12:00:00Z",
      footballStartedAt: "2026-11-21T12:00:00Z",
    });
    fixture.completed.add("OFFICIAL_TEAMS");
    fixture.completed.add("ATHLETE_LEVELS");
    fixture.setEligible(10);
    await login(page);
    await page.goto("/admin/partidas/criar?guia=FIRST_MATCHDAY&guiaOrigem=dashboard");
    const draw = page.getByRole("link", { name: "Experimentar Sorteio Inteligente", exact: true });
    const classic = page.getByRole("link", { name: "Criar Partida Clássica", exact: true });
    await expect(draw).toBeVisible();
    await expect(classic).toBeVisible();
    await expect(page.getByText("Recomendado", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Crie sua primeira rodada", exact: true })
    ).toBeVisible();
    expect(fixture.completed.has("FIRST_MATCHDAY")).toBe(false);
    expect(
      fixture.posts.filter((post) => /sorteio\/publicar|\/api\/partidas$/.test(post.url))
    ).toEqual([]);
    await page.keyboard.press("Tab");
    for (const link of [draw, classic]) {
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await draw.focus();
    await page.keyboard.press("Tab");
    await expect(classic).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await info.attach(`modality-${width}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(
      /\/admin\/partidas\/criar\/classica\?guia=FIRST_MATCHDAY&guiaOrigem=dashboard/
    );
    expect(fixture.completed.has("FIRST_MATCHDAY")).toBe(false);
    await page.goBack();
    await draw.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(
      /\/admin\/partidas\/sorteio-inteligente\?guia=FIRST_MATCHDAY&guiaOrigem=dashboard/
    );
    expect(fixture.completed.has("FIRST_MATCHDAY")).toBe(false);
    await page.goto("/admin/partidas/criar");
    await expect(draw).toHaveAttribute("href", "/admin/partidas/sorteio-inteligente");
    await expect(classic).toHaveAttribute("href", "/admin/partidas/criar/classica");
    await expect(page.getByRole("region", { name: "Orientação do guia" })).toHaveCount(0);
  });
}
