import { test, expect } from "@playwright/test";

test.describe("SEO Headers", () => {
  test("home não deve ter X-Robots-Tag", async ({ request }) => {
    const res = await request.get("https://app.fut7pro.com.br/");
    expect(res.headers()["x-robots-tag"]).toBeUndefined();
  });

  test("admin deve ter noindex,nofollow", async ({ request }) => {
    const res = await request.get("https://app.fut7pro.com.br/admin/login");
    expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  });

  test("superadmin deve ter noindex,nofollow", async ({ request }) => {
    const res = await request.get("https://app.fut7pro.com.br/superadmin/login");
    expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  });

  test("robots.txt deve ser acessível", async ({ request }) => {
    const res = await request.get("https://app.fut7pro.com.br/robots.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
  });

  test("sitemap.xml deve ser acessível", async ({ request }) => {
    const res = await request.get("https://app.fut7pro.com.br/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/xml");
  });

  test("páginas públicas não devem ter X-Robots-Tag", async ({ request }) => {
    const publicPages = [
      "https://app.fut7pro.com.br/estatisticas/classificacao-dos-times",
      "https://app.fut7pro.com.br/partidas/historico",
      "https://app.fut7pro.com.br/os-campeoes",
      "https://app.fut7pro.com.br/atletas",
    ];

    for (const url of publicPages) {
      const res = await request.get(url);
      expect(res.headers()["x-robots-tag"]).toBeUndefined();
    }
  });
});
