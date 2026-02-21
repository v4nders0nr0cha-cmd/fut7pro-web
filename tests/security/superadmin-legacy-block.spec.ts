import { expect, test } from "@playwright/test";

const legacyRoutes = [
  "/superadmin/automacoes",
  "/superadmin/marketing",
  "/superadmin/monitoramento",
  "/superadmin/integracoes",
  "/superadmin/metricas/localizacao",
  "/superadmin/comunicacao/ajuda",
  "/superadmin/comunicacao/sugestoes",
];

test.describe("SuperAdmin Legacy Guard", () => {
  test.setTimeout(180000);

  test("rotas legacy retornam 404 quando o modo legacy esta desativado", async ({ request }) => {
    test.skip(
      process.env.SUPERADMIN_ENABLE_LEGACY_ROUTES === "true",
      "Flag legacy habilitada explicitamente neste ambiente."
    );

    for (const route of legacyRoutes) {
      const response = await request.get(route, { maxRedirects: 0 });
      expect(response.status(), `Rota ${route} deve estar bloqueada`).toBe(404);
    }
  });
});
