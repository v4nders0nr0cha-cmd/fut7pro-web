import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { installGuide, login } from "./fixtures/guide-continuity";

const placeholderUrl =
  /^(?:https?:\/\/127\.0\.0\.1:(?:3000|3443))?\/images\/avatar-placeholder\.svg$/;

for (const width of [1280, 390, 320]) {
  test(`athlete avatar ${width}`, async ({ page }, info) => {
    test.setTimeout(150_000);
    await page.setViewportSize({ width, height: 900 });
    const fixture = await installGuide(page);
    fixture.state.dashboardInviteDismissedAt = "2026-11-20T00:00:00Z";
    // An existing local photo is test input, not the application's fallback.
    const realPhoto = `data:image/jpeg;base64,${(await readFile("public/images/jogadores/jogador_padrao_01.jpg")).toString("base64")}`;
    const players = [
      { id: "real", name: "Comfoto", photoUrl: realPhoto },
      { id: "empty", name: "Semfoto", photoUrl: null },
      { id: "removed", name: "Removida", photoUrl: null },
      { id: "broken", name: "Quebrada", photoUrl: "/images/foto-inexistente-avatar-test.jpg" },
      { id: "invalid", name: "Invalida", photoUrl: "not-a-url" },
      { id: "legacy", name: "Legado", photoUrl: "/images/jogadores/jogador_padrao_01.jpg" },
    ].map((item) => ({
      ...item,
      status: "Ativo",
      position: "goleiro",
      isBot: false,
      userId: null,
    }));
    await page.route(/\/api\/jogadores(?:\?|$)/, (route) => route.fulfill({ json: players }));
    await page.route(/\/api\/public\/grupo-fixture\/athletes(?:\?|$)/, (route) =>
      route.fulfill({
        json: {
          slug: "grupo-fixture",
          total: players.length,
          results: players.map((item) => ({
            id: item.id,
            slug: item.id,
            nome: item.name,
            foto: item.photoUrl,
            posicao: "Goleiro",
          })),
        },
      })
    );
    await page.route(/\/api\/public\/grupo-fixture\/player-rankings(?:\?|$)/, (route) =>
      route.fulfill({ json: { slug: "grupo-fixture", type: "geral", results: [], total: 0 } })
    );
    await login(page);
    await page.goto("/admin/jogadores/listar-cadastrar");
    await expect(page.getByRole("img", { name: "Comfoto", exact: true })).toHaveAttribute(
      "src",
      realPhoto
    );
    for (const name of ["Semfoto", "Removida", "Invalida", "Legado"]) {
      await expect(
        page.getByRole("img", { name: `${name} (sem foto)`, exact: true })
      ).toHaveAttribute("src", placeholderUrl);
    }
    await page.getByText("Quebrada", { exact: true }).first().scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("img", { name: "Quebrada (sem foto)", exact: true })
    ).toHaveAttribute("src", placeholderUrl);
    await page.screenshot({ path: info.outputPath(`avatars-admin-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Cadastrar Jogador", exact: true }).click();
    const preview = page.getByRole("img", { name: "Foto do jogador (sem foto)", exact: true });
    await expect(preview).toHaveAttribute("src", placeholderUrl);
    await expect
      .poll(() => preview.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await page.screenshot({ path: info.outputPath(`avatar-form-${width}.png`) });
    await page.getByRole("button", { name: "Fechar", exact: true }).click();
    await page.goto("/grupo-fixture/atletas");
    await expect(
      page.getByRole("heading", { name: "Perfis dos Atletas", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "Foto do atleta Comfoto", exact: true })
    ).toHaveAttribute("src", realPhoto);
    for (const name of ["Semfoto", "Removida", "Invalida", "Legado"]) {
      await expect(
        page.getByRole("img", { name: `Foto do atleta ${name} (sem foto)`, exact: true })
      ).toHaveAttribute("src", placeholderUrl);
    }
    await page
      .getByRole("link", { name: "Abrir perfil de Quebrada", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("img", { name: "Foto do atleta Quebrada (sem foto)", exact: true })
    ).toHaveAttribute("src", placeholderUrl);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await page.screenshot({ path: info.outputPath(`avatars-public-${width}.png`), fullPage: true });
  });
}
