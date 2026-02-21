import { expect, test } from "@playwright/test";

test.describe("seo smoke", () => {
  test("robots.txt deve permitir rastreamento publico e anunciar sitemap", async ({
    request,
    baseURL,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.ok()).toBeTruthy();

    const body = await response.text();
    const expectedBase = (baseURL || "https://app.fut7pro.com.br").replace(/\/+$/, "");

    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /api");
    expect(body).toContain("Disallow: /admin/login");
    expect(body).toContain("Disallow: /superadmin/login");
    expect(body).toContain(`Sitemap: ${expectedBase}/sitemap.xml`);
  });

  test("sitemap index deve responder 200 e listar sitemaps por slug", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();

    const contentType = response.headers()["content-type"] || "";
    expect(contentType.toLowerCase()).toContain("xml");

    const xml = await response.text();
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("/sitemaps/");
  });
});
