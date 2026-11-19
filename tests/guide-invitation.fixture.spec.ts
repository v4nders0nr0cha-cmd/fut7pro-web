import { expect, test } from "@playwright/test";
import { installGuide, login } from "./fixtures/guide-continuity";
for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile320", width: 320, height: 640 },
  { name: "mobile390", width: 390, height: 844 },
]) {
  test(`invitation recruiting ${viewport.name} confirms deliberately and preserves continuity`, async ({
    page,
    context,
  }, info) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const fixture = await installGuide(page);
    fixture.completed.clear();
    fixture.completed.add("ACCOUNT_READY");
    fixture.state.welcomePresentedAt = "2026-11-18T00:00:00Z";
    await page.addInitScript(() => {
      (window as any).__failCopy = true;
      (window as any).__copied = [];
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            if ((window as any).__failCopy) throw new Error("Clipboard denied in fixture");
            (window as any).__copied.push(value);
          },
        },
      });
    });
    let examples = 0;
    page.on("request", (r) => {
      if (decodeURIComponent(r.url()).includes("/images/onboarding/")) examples++;
    });
    await context.route(/^https:\/\/(wa\.me|www\.instagram\.com)\//, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<title>Aplicativo externo de teste</title>",
      })
    );
    let rejected = false;
    let confirmations = 0;
    await page.route("**/api/admin/guide", (route) => {
      const request = route.request();
      if (
        request.method() === "PATCH" &&
        request.postDataJSON().action === "INVITATION_SHARED_CONFIRMED"
      ) {
        confirmations++;
        if (!rejected) {
          rejected = true;
          return route.fulfill({ status: 503, json: { message: "Falha controlada" } });
        }
      }
      return route.fallback();
    });
    await login(page);
    const dialog = page.getByRole("dialog", { name: "Guia Interativo Fut7Pro" });
    await expect(dialog).toBeVisible();
    const original = page.url();
    const origin = await page.evaluate(() => performance.timeOrigin);
    await dialog.evaluate((el) => ((window as any).__invitationDialog = el));
    await dialog.getByRole("button", { name: "Convidar jogadores agora", exact: true }).click();
    await expect(
      dialog.getByRole("heading", { name: "Traga seus primeiros jogadores", exact: true })
    ).toBeVisible();
    expect(examples).toBe(0);
    await expect(dialog.getByRole("link", { name: "Cadastrar jogador manualmente" })).toHaveCount(
      0
    );
    const whatsapp = dialog.getByRole("region", { name: "WhatsApp", exact: true });
    const instagram = dialog.getByRole("region", { name: "Instagram", exact: true });
    if (viewport.width >= 768) {
      const a = (await whatsapp.boundingBox())!,
        b = (await instagram.boundingBox())!;
      expect(Math.abs(a.y - b.y)).toBeLessThan(1);
      expect(Math.abs(a.height - b.height)).toBeLessThan(1);
      expect(a.x + a.width).toBeLessThan(b.x);
    } else {
      await expect(instagram).toBeHidden();
    }
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await dialog.screenshot({ path: info.outputPath(`invitation-options-${viewport.name}.png`) });
    await dialog.getByRole("button", { name: "Ver exemplo no WhatsApp", exact: true }).click();
    await expect(
      dialog.getByRole("img", { name: "Exemplo ilustrativo ampliado do WhatsApp" })
    ).toBeVisible();
    await expect.poll(() => examples).toBeGreaterThan(0);
    await dialog.screenshot({
      path: info.outputPath(`invitation-example-whatsapp-${viewport.name}.png`),
    });
    await dialog.getByRole("button", { name: "Voltar às opções de convite", exact: true }).click();
    await expect(
      dialog.getByRole("button", { name: "Ver exemplo no WhatsApp", exact: true })
    ).toBeFocused();
    await dialog.getByRole("button", { name: "Copiar convite", exact: true }).click();
    await expect(dialog.getByText(/A cópia falhou/)).toBeVisible();
    expect(fixture.completed.has("ACTIVE_PLAYERS")).toBe(false);
    expect(fixture.actions).not.toContain("INVITATION_COPY_RECORDED");
    const popupPromise = page.waitForEvent("popup");
    await dialog.getByRole("link", { name: "Compartilhar no WhatsApp", exact: true }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    await popup.close();
    await expect(
      dialog.getByRole("heading", { name: "Conseguiu compartilhar o convite?" })
    ).toBeVisible();
    expect(fixture.completed.has("ACTIVE_PLAYERS")).toBe(false);
    expect(confirmations).toBe(0);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(dialog.getByRole("heading", { name: "Etapa concluída!" })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Voltar às opções", exact: true }).click();
    await page.evaluate(() => ((window as any).__failCopy = false));
    await dialog.getByRole("button", { name: "Copiar convite", exact: true }).click();
    await expect.poll(() => fixture.actions.includes("INVITATION_COPY_RECORDED")).toBe(true);
    expect(await page.evaluate(() => (window as any).__copied[0])).toContain(
      "https://app.fut7pro.com.br/grupo-fixture"
    );
    expect(fixture.completed.has("ACTIVE_PLAYERS")).toBe(false);
    await dialog.getByRole("button", { name: "Fechar modal", exact: true }).click();
    if (viewport.width >= 1024) {
      await page.getByRole("button", { name: "Ajuda Fut7Pro", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Ajuda Fut7Pro", exact: true })
        .getByRole("button", { name: /Guia Interativo/ })
        .click();
    } else await page.getByRole("button", { name: "Abrir Guia Interativo", exact: true }).click();
    await dialog.getByRole("button", { name: "Convidar jogadores agora", exact: true }).click();
    await expect(
      dialog.getByRole("heading", { name: "Conseguiu compartilhar o convite?" })
    ).toBeVisible();
    await dialog.evaluate((el) => ((window as any).__invitationDialog = el));
    await dialog.getByRole("button", { name: "Já compartilhei o convite", exact: true }).click();
    await expect(dialog.getByText(/Não foi possível confirmar a divulgação/)).toBeVisible();
    expect(fixture.completed.has("ACTIVE_PLAYERS")).toBe(false);
    await dialog.screenshot({ path: info.outputPath(`invitation-confirm-${viewport.name}.png`) });
    const confirm = dialog.getByRole("button", { name: "Já compartilhei o convite", exact: true });
    await confirm.evaluate((el) => {
      (el as HTMLButtonElement).click();
      (el as HTMLButtonElement).click();
    });
    await expect(dialog.getByRole("heading", { name: "Etapa concluída!" })).toBeVisible();
    expect(confirmations).toBe(2);
    expect(fixture.state.invitationCopiedAt).toBeUndefined();
    expect(fixture.state.invitationConfirmations.WHATSAPP).toBeTruthy();
    expect(fixture.actions).not.toContain("REWARD_CLAIM");
    await expect(
      dialog.getByRole("link", { name: "Cadastrar jogador manualmente" })
    ).toHaveAttribute(
      "href",
      "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS&guiaOrigem=dashboard"
    );
    await dialog.screenshot({ path: info.outputPath(`invitation-done-${viewport.name}.png`) });
    await dialog.getByRole("button", { name: "Divulgar também no Instagram", exact: true }).click();
    await dialog.getByRole("button", { name: "Ver exemplo no Instagram", exact: true }).click();
    await dialog.getByRole("img", { name: "Exemplo ilustrativo ampliado do Instagram" }).waitFor();
    await dialog.screenshot({
      path: info.outputPath(`invitation-example-instagram-${viewport.name}.png`),
    });
    await dialog.getByRole("button", { name: "Voltar às opções de convite", exact: true }).click();
    if (viewport.width < 768)
      await expect(dialog.getByRole("button", { name: "Instagram", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    const instagramPopup = page.waitForEvent("popup");
    await dialog.getByRole("link", { name: "Abrir Instagram", exact: true }).click();
    const instagramPage = await instagramPopup;
    await instagramPage.waitForLoadState("domcontentloaded");
    await instagramPage.close();
    await expect(dialog.getByRole("heading", { name: "Etapa concluída!" })).toBeVisible();
    await dialog.getByRole("button", { name: "Consultar opções e exemplos", exact: true }).click();
    await dialog.getByRole("button", { name: "Copiar link", exact: true }).click();
    await expect(dialog.getByRole("heading", { name: "Etapa concluída!" })).toBeVisible();
    expect(await page.evaluate(() => (window as any).__copied.at(-1))).toBe(
      "https://app.fut7pro.com.br/grupo-fixture"
    );
    await expect(dialog.getByText("Quer divulgar o site em mais um lugar?")).toHaveCount(0);
    await dialog
      .getByRole("button", { name: "Continuar para a próxima etapa", exact: true })
      .click();
    await expect(
      dialog.getByRole("heading", { name: "Defina os dias e horários", exact: true })
    ).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Defina os dias e horários/ })).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(await dialog.evaluate((el) => el === (window as any).__invitationDialog)).toBe(true);
    await expect(page).toHaveURL(original);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(origin);
    await expect(
      dialog.getByRole("heading", { name: "Primeiros passos do grupo", exact: true })
    ).toBeFocused();
    expect(await dialog.locator(".overflow-y-auto").evaluate((el) => el.scrollTop)).toBe(0);
  });
}
for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile320", width: 320, height: 640 },
  { name: "mobile390", width: 390, height: 844 },
]) {
  test(`invitation manual return ${viewport.name} resumes the originating operational page`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const fixture = await installGuide(page);
    fixture.state.welcomePresentedAt = "2026-11-18T00:00:00Z";
    await login(page);
    const dialog = page.getByRole("dialog", { name: "Guia Interativo Fut7Pro" });
    await dialog.getByRole("button", { name: "Fechar modal", exact: true }).click();
    await page.waitForLoadState("networkidle");
    await page.goto("/admin/partidas/criar-times");
    await page.waitForLoadState("networkidle");
    if (viewport.width >= 1024) {
      await page.getByRole("button", { name: "Ajuda Fut7Pro", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Ajuda Fut7Pro", exact: true })
        .getByRole("button", { name: /Guia Interativo/ })
        .click();
    } else await page.getByRole("button", { name: "Abrir Guia Interativo", exact: true }).click();
    await dialog.getByRole("button", { name: /Traga seus primeiros jogadores/ }).click();
    await dialog.getByRole("button", { name: "Convidar jogadores agora", exact: true }).click();
    const manual = dialog.getByRole("link", { name: "Cadastrar jogador manualmente", exact: true });
    await expect(manual).toHaveAttribute(
      "href",
      "/admin/jogadores/listar-cadastrar?guia=ACTIVE_PLAYERS&guiaOrigem=dashboard&guiaRetorno=%2Fadmin%2Fpartidas%2Fcriar-times"
    );
    await manual.click();
    await expect(page).toHaveURL(/\/admin\/jogadores\/listar-cadastrar\?/);
    await expect(dialog).toHaveCount(0);
    const guidance = page.getByRole("complementary", { name: "Orientação do guia", exact: true });
    await guidance.getByRole("link", { name: "Continuar guia", exact: true }).click();
    await expect(
      dialog.getByRole("heading", { name: "Cadastre os times", exact: true })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/partidas\/criar-times$/);
    await expect(dialog).toHaveCount(1);
    expect(fixture.state.dashboardInviteDismissedAt).toBeUndefined();
  });
}
