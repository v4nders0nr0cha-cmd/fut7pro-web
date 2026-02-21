import { expect, test } from "@playwright/test";

type SitemapSlugPayload = {
  results?: Array<{ slug?: string | null }>;
};

const API_SLUGS_ENDPOINT = "https://api.fut7pro.com.br/public/sitemap/slugs";
const FORBIDDEN_MARKERS = ["Jogador 1", "placeholder-", "your-google-verification-code"];
const PUBLIC_PATHS = [
  "",
  "/partidas",
  "/partidas/times-do-dia",
  "/estatisticas",
  "/os-campeoes",
  "/sobre-nos/nossos-parceiros",
  "/contato",
  "/privacidade",
  "/termos",
];

function parseEnvSlugs() {
  return (process.env.E2E_PUBLIC_SMOKE_SLUGS || process.env.E2E_PUBLIC_SLUG || "")
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean);
}

function parsePayloadSlugs(payload: SitemapSlugPayload | null) {
  if (!payload || !Array.isArray(payload.results)) return [];
  return payload.results
    .map((item) =>
      String(item?.slug || "")
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);
}

test.describe("public functional smoke", () => {
  let slugs: string[] = [];

  test.beforeAll(async ({ request }) => {
    const envSlugs = parseEnvSlugs();
    if (envSlugs.length > 0) {
      slugs = envSlugs;
      return;
    }

    const response = await request.get(API_SLUGS_ENDPOINT);
    if (!response.ok()) return;

    const payload = (await response.json().catch(() => null)) as SitemapSlugPayload | null;
    slugs = parsePayloadSlugs(payload);
  });

  test("slug routes principais respondem 200 e sem sinais de mock", async ({ page }) => {
    test.skip(slugs.length === 0, "Nenhum slug público ativo encontrado para smoke.");

    for (const slug of slugs) {
      for (const path of PUBLIC_PATHS) {
        const url = `/${slug}${path}`;
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });

        expect(response, `Sem resposta ao acessar ${url}`).not.toBeNull();
        expect(response!.status(), `Status inválido para ${url}`).toBeLessThan(400);
        expect(page.url(), `URL final inválida para ${url}`).toContain(`/${slug}`);

        await expect(page.locator("body"), `Página sem conteúdo em ${url}`).toBeVisible();
        const bodyText = (await page.locator("body").innerText()).trim();

        expect(/Racha n(ã|a)o encontrado/i.test(bodyText), `NotFound inesperado em ${url}`).toBe(
          false
        );

        for (const marker of FORBIDDEN_MARKERS) {
          expect(
            bodyText.includes(marker),
            `Marcador proibido "${marker}" encontrado em ${url}`
          ).toBe(false);
        }
      }
    }
  });
});
