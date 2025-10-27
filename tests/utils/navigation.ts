import type { Page } from "@playwright/test";

const FALLBACK_BASE_URL = "http://127.0.0.1:3000";
const LOCAL_BASE_RE = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]):3000/i;

/** Prefixo de rota do racha (via SLUG ou caminho fixo) */
function rachaPrefix(): string {
  const path = (process.env.RACHA_PATH || "").trim();
  if (path) return path.startsWith("/") ? path : `/${path}`;

  const slug = (process.env.SLUG || "").trim();
  if (slug) return `/rachas/${encodeURIComponent(slug)}`;

  return "";
}

/** Garante que o caminho seja relativo + com prefixo do racha quando configurado */
function resolveRelative(pathOrUrl: string): string {
  const prefixed = `${rachaPrefix()}${pathOrUrl}`.replace(/\/{2,}/g, "/");
  return prefixed.startsWith("/") ? prefixed : `/${prefixed}`;
}

/** Descobre o baseURL: prioridade context -> E2E_BASE_URL -> FALLBACK_BASE_URL */
function resolveBaseURL(page: Page): string {
  // @ts-expect-error acesso interno do Playwright é suficiente para testes
  const contextBaseURL = page.context()?._options?.baseURL as string | undefined;
  return contextBaseURL || (process.env.E2E_BASE_URL || "").trim() || FALLBACK_BASE_URL;
}

/** Normaliza URLs absolutas antigas (localhost:3000) para o baseURL atual */
function replaceLocalWithBase(url: string, baseURL: string): string {
  return url.replace(LOCAL_BASE_RE, baseURL);
}

/** Monta a URL final (absoluta) a partir de um caminho ou URL absoluta */
function buildUrl(page: Page, pathOrUrl: string): string {
  const baseURL = resolveBaseURL(page);

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return replaceLocalWithBase(pathOrUrl, baseURL);
  }
  // caminho relativo
  return new URL(resolveRelative(pathOrUrl), baseURL).toString();
}

/**
 * Navega e espera DOM pronto. Tenta rapidamente atingir estado de 'networkidle'
 * sem travar caso a página mantenha conexões longas (catch silencioso).
 */
export async function gotoAndIdle(page: Page, pathOrUrl: string) {
  const url = buildUrl(page, pathOrUrl);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 12_000,
  });

  // Tentativa best-effort de estabilizar rede; ignora timeout curto
  await page.waitForLoadState("networkidle", { timeout: 2_000 }).catch(() => {});
}

export const paths = {
  timesDoDia: () => "/partidas/times-do-dia",
  historico: () => "/partidas/historico",
  rankingGeral: () => "/estatisticas/ranking-geral",
  artilheiros: () => "/estatisticas/artilheiros",
  assistencias: () => "/estatisticas/assistencias",
  classificacaoTimes: () => "/estatisticas/classificacao-dos-times",
  osCampeoes: () => "/os-campeoes",
} as const;
