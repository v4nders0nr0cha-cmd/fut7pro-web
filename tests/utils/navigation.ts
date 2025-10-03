// tests/utils/navigation.ts
import type { Page } from "@playwright/test";

export function baseUrl(): string {
  return process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
}

export function rachaPrefix(): string {
  const path = (process.env.RACHA_PATH || "").trim();
  if (path) return path.startsWith("/") ? path : `/${path}`;
  const slug = (process.env.SLUG || "").trim();
  if (slug) return `/rachas/${encodeURIComponent(slug)}`;
  return "";
}

function targetUrl(pathname: string): string {
  const prefixed = `${rachaPrefix()}${pathname}`.replace(/\/{2,}/g, "/");
  const normalized = prefixed.startsWith("/") ? prefixed : `/${prefixed}`;
  return new URL(normalized, baseUrl()).toString();
}

/**
 * Navegação resiliente para dev (Next.js com HMR):
 * - controla orçamento total
 * - tolera erros transitórios (ERR_ABORTED, frame detach, timeouts)
 * - evita travar em networkidle
 */
export async function gotoAndIdle(
  page: Page,
  pathname: string,
  opts: { timeoutMs?: number } = {}
): Promise<void> {
  const url = targetUrl(pathname);
  // orçamento padrão maior para cobrir a 1ª compilação da rota
  const budget = Math.max(2_000, opts.timeoutMs ?? 10_000);
  const deadline = Date.now() + budget;
  const transient =
    /Timeout \d+ms exceeded|ERR_ABORTED|frame was detached|Navigation failed|Target closed|context was destroyed/i;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        // permite uma navegação de até 12s se ainda houver orçamento
        timeout: Math.min(12_000, Math.max(1_000, remaining)),
      });

      // apenas um pequeno "idle" — não dependa disso em HMR
      try {
        await page.waitForLoadState("networkidle", { timeout: 1_000 });
      } catch {
        /* ignore */
      }

      await page
        .locator("main,body")
        .first()
        .waitFor({ state: "attached", timeout: 1_500 })
        .catch(() => {});

      if (!page.isClosed()) return;
      throw new Error("Page closed right after goto()");
    } catch (error) {
      if (page.isClosed()) throw error;
      const msg = String((error as Error)?.message ?? "");
      if (!transient.test(msg) || attempt === 2) throw error;

      // pequeno backoff antes do retry dentro do orçamento
      const settle = Math.min(500, Math.max(100, deadline - Date.now()));
      if (settle > 0) await page.waitForTimeout(settle).catch(() => {});
    }
  }

  if (!page.isClosed()) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
  }
}

/** Helpers */
export const paths = {
  timesDoDia: () => "/partidas/times-do-dia",
  historico: () => "/partidas/historico",
  rankingGeral: () => "/estatisticas/ranking-geral",
  artilheiros: () => "/estatisticas/artilheiros",
  assistencias: () => "/estatisticas/assistencias",
  classificacaoTimes: () => "/estatisticas/classificacao-dos-times",
  osCampeoes: () => "/os-campeoes",
} as const;
