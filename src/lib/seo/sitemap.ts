import { resolvePublicTenantSlug } from "@/utils/public-links";

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFrequency;
  priority?: number;
};

type SitemapIndexEntry = {
  loc: string;
  lastmod?: string;
};

type TenantPathEntry = {
  path: string;
  changefreq: ChangeFrequency;
  priority: number;
};

const FALLBACK_TENANT_SLUG = "vitrine";
const TENANT_SLUG_REGEX = /^[a-z0-9-]{3,30}$/;
const MAX_ATHLETE_SLUGS = 300;
const MAX_TOURNAMENT_SLUGS = 200;

const TENANT_STATIC_PATHS: TenantPathEntry[] = [
  { path: "", changefreq: "daily", priority: 1.0 },
  { path: "/partidas", changefreq: "daily", priority: 0.9 },
  { path: "/partidas/historico", changefreq: "daily", priority: 0.9 },
  { path: "/partidas/times-do-dia", changefreq: "daily", priority: 0.9 },
  { path: "/estatisticas", changefreq: "daily", priority: 0.9 },
  { path: "/estatisticas/ranking-geral", changefreq: "daily", priority: 0.9 },
  { path: "/estatisticas/ranking-quadrimestral", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/ranking-anual", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/artilheiros", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/assistencias", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/classificacao-dos-times", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/melhores-por-posicao", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/melhores-por-posicao/atacantes", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/melhores-por-posicao/meias", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/melhores-por-posicao/zagueiros", changefreq: "weekly", priority: 0.8 },
  { path: "/estatisticas/melhores-por-posicao/goleiros", changefreq: "weekly", priority: 0.8 },
  { path: "/os-campeoes", changefreq: "weekly", priority: 0.9 },
  { path: "/atletas", changefreq: "weekly", priority: 0.8 },
  { path: "/grandes-torneios", changefreq: "weekly", priority: 0.8 },
  { path: "/sorteio-inteligente", changefreq: "weekly", priority: 0.7 },
  { path: "/sobre-nos", changefreq: "monthly", priority: 0.7 },
  { path: "/sobre-nos/nossa-historia", changefreq: "monthly", priority: 0.6 },
  { path: "/sobre-nos/estatuto", changefreq: "monthly", priority: 0.6 },
  { path: "/sobre-nos/aniversariantes", changefreq: "weekly", priority: 0.6 },
  { path: "/sobre-nos/nossos-parceiros", changefreq: "weekly", priority: 0.7 },
  { path: "/sobre-nos/prestacao-de-contas", changefreq: "monthly", priority: 0.6 },
  { path: "/contato", changefreq: "monthly", priority: 0.5 },
  { path: "/privacidade", changefreq: "monthly", priority: 0.4 },
  { path: "/termos", changefreq: "monthly", priority: 0.4 },
];

function trimBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, "");
}

function normalizeTenantSlug(input?: string | null) {
  const slug = (input || "").trim().toLowerCase();
  if (!slug) return null;
  if (!TENANT_SLUG_REGEX.test(slug)) return null;
  if (resolvePublicTenantSlug(`/${slug}`) !== slug) return null;
  return slug;
}

function normalizePathSegment(input?: string | null) {
  const segment = (input || "").trim();
  if (!segment) return null;
  if (segment.includes("/") || segment.includes("?") || segment.includes("#")) return null;
  return segment;
}

function parseCsv(raw?: string | null) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupeSlugs(slugs: string[]) {
  const unique = new Set<string>();
  for (const slug of slugs) {
    const normalized = normalizeTenantSlug(slug);
    if (normalized) unique.add(normalized);
  }
  return Array.from(unique);
}

function collectConfiguredTenantSlugs() {
  const multiValueVars = [
    process.env.SITEMAP_PUBLIC_TENANT_SLUGS,
    process.env.SITEMAP_TENANT_SLUGS,
    process.env.VITRINE_TENANT_SLUGS,
  ];
  const singleValueVars = [
    process.env.NEXT_PUBLIC_DEFAULT_RACHA_SLUG,
    process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG,
  ];

  const fromCsv = multiValueVars.flatMap((value) => parseCsv(value));
  const fromSingle = singleValueVars.flatMap((value) => (value ? [value] : []));

  return dedupeSlugs([...fromCsv, ...fromSingle]);
}

function extractSlugCandidates(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (typeof item === "string") return item;
        if (
          item &&
          typeof item === "object" &&
          typeof (item as { slug?: unknown }).slug === "string"
        ) {
          return (item as { slug: string }).slug;
        }
        return null;
      })
      .filter((value): value is string => Boolean(value));
  }

  if (!payload || typeof payload !== "object") return [];

  const data = payload as {
    slugs?: unknown;
    results?: unknown;
    items?: unknown;
    data?: unknown;
  };

  return [
    ...extractSlugCandidates(data.slugs),
    ...extractSlugCandidates(data.results),
    ...extractSlugCandidates(data.items),
    ...extractSlugCandidates(data.data),
  ];
}

async function fetchTenantSlugsFromBackend(apiBase: string) {
  const customEndpoint = process.env.SITEMAP_BACKEND_SLUGS_ENDPOINT?.trim();
  const endpoint = customEndpoint || `${trimBaseUrl(apiBase)}/public/sitemap/slugs`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json().catch(() => null)) as unknown;
    return dedupeSlugs(extractSlugCandidates(payload));
  } catch {
    return [];
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createSitemapUrl(baseUrl: string, slug: string, path = "") {
  const normalizedBase = trimBaseUrl(baseUrl);
  const normalizedPath = path ? path : "";
  return `${normalizedBase}/${encodeURIComponent(slug)}${normalizedPath}`;
}

async function fetchAthletePaths(apiBase: string, slug: string) {
  const url = `${trimBaseUrl(apiBase)}/public/${encodeURIComponent(slug)}/athletes`;
  const paths = new Set<string>();

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return paths;

    const payload = (await response.json().catch(() => null)) as {
      results?: Array<{ slug?: string | null }>;
    } | null;
    const athletes = Array.isArray(payload?.results) ? payload.results : [];

    for (const athlete of athletes) {
      const athleteSlug = normalizePathSegment(athlete?.slug);
      if (!athleteSlug) continue;

      const encodedAthleteSlug = encodeURIComponent(athleteSlug);
      paths.add(`/atletas/${encodedAthleteSlug}`);
      paths.add(`/atletas/${encodedAthleteSlug}/historico`);
      paths.add(`/atletas/${encodedAthleteSlug}/conquistas`);

      if (paths.size >= MAX_ATHLETE_SLUGS * 3) break;
    }
  } catch {
    return paths;
  }

  return paths;
}

async function fetchTournamentPaths(apiBase: string, slug: string) {
  const url = `${trimBaseUrl(apiBase)}/public/${encodeURIComponent(slug)}/torneios`;
  const paths = new Set<string>();

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return paths;

    const payload = (await response.json().catch(() => null)) as {
      results?: Array<{ slug?: string | null }>;
    } | null;
    const tournaments = Array.isArray(payload?.results) ? payload.results : [];

    for (const tournament of tournaments) {
      const tournamentSlug = normalizePathSegment(tournament?.slug);
      if (!tournamentSlug) continue;

      paths.add(`/grandes-torneios/${encodeURIComponent(tournamentSlug)}`);
      if (paths.size >= MAX_TOURNAMENT_SLUGS) break;
    }
  } catch {
    return paths;
  }

  return paths;
}

export function resolveAppBaseUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br";
  return trimBaseUrl(base);
}

export function isValidTenantSlug(slug?: string | null) {
  return normalizeTenantSlug(slug);
}

export async function resolveSitemapTenantSlugs(apiBase: string) {
  const configured = collectConfiguredTenantSlugs();
  if (configured.length > 0) return configured;

  const fromBackend = await fetchTenantSlugsFromBackend(apiBase);
  if (fromBackend.length > 0) return fromBackend;

  const fallback = normalizeTenantSlug(FALLBACK_TENANT_SLUG);
  return fallback ? [fallback] : [];
}

export async function resolveTenantSitemapEntries(baseUrl: string, apiBase: string, slug: string) {
  const nowIso = new Date().toISOString();
  const entries: SitemapUrlEntry[] = TENANT_STATIC_PATHS.map((item) => ({
    loc: createSitemapUrl(baseUrl, slug, item.path),
    changefreq: item.changefreq,
    priority: item.priority,
    lastmod: nowIso,
  }));

  const [athletePaths, tournamentPaths] = await Promise.all([
    fetchAthletePaths(apiBase, slug),
    fetchTournamentPaths(apiBase, slug),
  ]);

  for (const path of athletePaths) {
    entries.push({
      loc: createSitemapUrl(baseUrl, slug, path),
      changefreq: "weekly",
      priority: 0.6,
      lastmod: nowIso,
    });
  }

  for (const path of tournamentPaths) {
    entries.push({
      loc: createSitemapUrl(baseUrl, slug, path),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: nowIso,
    });
  }

  const uniqueByLoc = new Map<string, SitemapUrlEntry>();
  for (const entry of entries) {
    uniqueByLoc.set(entry.loc, entry);
  }

  return Array.from(uniqueByLoc.values());
}

export function renderSitemapIndexXml(entries: SitemapIndexEntry[]) {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      return `<sitemap><loc>${escapeXml(entry.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export function renderSitemapUrlSetXml(entries: SitemapUrlEntry[]) {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      const changefreq = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "";
      const priority =
        typeof entry.priority === "number"
          ? `<priority>${entry.priority.toFixed(1)}</priority>`
          : "";

      return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}
