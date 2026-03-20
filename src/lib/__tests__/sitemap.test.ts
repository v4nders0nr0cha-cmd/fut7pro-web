import { isValidTenantSlug, resolveSitemapTenantSlugs } from "@/lib/seo/sitemap";

describe("sitemap tenant slugs", () => {
  const originalFetch = global.fetch;
  const originalSitemapEndpoint = process.env.SITEMAP_BACKEND_SLUGS_ENDPOINT;
  const originalPublicTenantSlugs = process.env.SITEMAP_PUBLIC_TENANT_SLUGS;
  const originalTenantSlugs = process.env.SITEMAP_TENANT_SLUGS;

  afterEach(() => {
    global.fetch = originalFetch;

    if (originalSitemapEndpoint === undefined) {
      delete process.env.SITEMAP_BACKEND_SLUGS_ENDPOINT;
    } else {
      process.env.SITEMAP_BACKEND_SLUGS_ENDPOINT = originalSitemapEndpoint;
    }

    if (originalPublicTenantSlugs === undefined) {
      delete process.env.SITEMAP_PUBLIC_TENANT_SLUGS;
    } else {
      process.env.SITEMAP_PUBLIC_TENANT_SLUGS = originalPublicTenantSlugs;
    }

    if (originalTenantSlugs === undefined) {
      delete process.env.SITEMAP_TENANT_SLUGS;
    } else {
      process.env.SITEMAP_TENANT_SLUGS = originalTenantSlugs;
    }
  });

  it("rejeita slugs de QA na validacao de tenant", () => {
    expect(isValidTenantSlug("qa-fluxo-01")).toBeNull();
    expect(isValidTenantSlug("qa_pr66")).toBeNull();
    expect(isValidTenantSlug("sertao")).toBe("sertao");
  });

  it("remove slugs de QA retornados pelo backend para o sitemap index", async () => {
    process.env.SITEMAP_BACKEND_SLUGS_ENDPOINT = "https://sitemap.example.test/slugs";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        slugs: ["sertao", "qa-fluxo-01", "qa_pr66", "nome-do-racha"],
      }),
    }) as unknown as typeof fetch;

    const slugs = await resolveSitemapTenantSlugs("https://api.example.test");
    expect(slugs).toEqual(["sertao", "nome-do-racha"]);
  });

  it("remove slugs de QA configurados em variavel manual", async () => {
    delete process.env.SITEMAP_BACKEND_SLUGS_ENDPOINT;
    process.env.SITEMAP_PUBLIC_TENANT_SLUGS = "sertao, qa-fluxo-01, qa_pr66, nome-do-racha";
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;

    const slugs = await resolveSitemapTenantSlugs("https://api.example.test");
    expect(slugs).toEqual(["sertao", "nome-do-racha"]);
  });
});
