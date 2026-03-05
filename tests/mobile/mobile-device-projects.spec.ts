import { expect, test } from "@playwright/test";

const MOBILE_PROJECTS = new Set(["mobile-iphone", "mobile-pixel"]);

const ROUTES = ["/", "/admin/login", "/superadmin/login"];

test.describe("mobile device projects smoke", () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      !MOBILE_PROJECTS.has(testInfo.project.name),
      "Este smoke roda apenas nos projetos mobile dedicados."
    );
  });

  for (const route of ROUTES) {
    test(`rota ${route} responde com sucesso`, async ({ page }) => {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      });

      expect(response?.status(), `HTTP inesperado para ${route}`).toBeLessThan(400);
    });
  }
});
