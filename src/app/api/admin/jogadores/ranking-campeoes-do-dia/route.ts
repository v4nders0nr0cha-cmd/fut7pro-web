import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";
import {
  buildRankingCampeoesDoDia,
  resolveCampeoesPeriodoRange,
  type RankingCampeoesPeriodo,
} from "@/lib/campeoes-do-dia-ranking";
import type { PublicMatchesResponse } from "@/types/partida";
import type { DestaqueDiaResponse } from "@/types/destaques";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PERIODOS = new Set(["mes", "quadrimestre", "ano", "todos"]);

function normalizePeriodo(value: string | null): RankingCampeoesPeriodo {
  return PERIODOS.has(value || "") ? (value as RankingCampeoesPeriodo) : "ano";
}

function uniqueDates(matches: PublicMatchesResponse["results"]) {
  return Array.from(
    new Set(
      matches
        .map((match) => match.date?.slice(0, 10))
        .filter((date): date is string => Boolean(date))
    )
  ).sort();
}

export async function GET(req: NextRequest) {
  const user = await requireUser({ scope: "adminOrSuperadmin" });
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const periodo = normalizePeriodo(req.nextUrl.searchParams.get("periodo"));
  const range = resolveCampeoesPeriodoRange(periodo);
  const apiBase = getApiBase();
  const matchesUrl = new URL(`${apiBase}/public/${encodeURIComponent(tenantSlug)}/matches`);
  matchesUrl.searchParams.set("from", range.from);
  matchesUrl.searchParams.set("to", range.to);
  matchesUrl.searchParams.set("limit", "10000");

  const { response: matchesResponse, body: matchesBody } = await proxyBackend(
    matchesUrl.toString(),
    { method: "GET", cache: "no-store" }
  );

  if (!matchesResponse.ok) {
    return jsonResponse(
      {
        error: "Falha ao carregar partidas para Ranking Campeoes do Dia",
        status: matchesResponse.status,
      },
      { status: matchesResponse.status }
    );
  }

  const matches = (
    Array.isArray(matchesBody)
      ? matchesBody
      : Array.isArray(matchesBody?.results)
        ? matchesBody.results
        : []
  ) as PublicMatchesResponse["results"];

  const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
  const destaquesEntries = await Promise.all(
    uniqueDates(matches).map(async (date) => {
      const destaqueUrl = new URL(`${apiBase}/api/admin/destaques-do-dia`);
      destaqueUrl.searchParams.set("date", date);
      try {
        const { response, body } = await proxyBackend(destaqueUrl.toString(), {
          method: "GET",
          headers,
          cache: "no-store",
        });
        return [date, response.ok ? (body as DestaqueDiaResponse) : null] as const;
      } catch {
        return [date, null] as const;
      }
    })
  );

  const destaquesPorData = Object.fromEntries(destaquesEntries);
  const rankings = buildRankingCampeoesDoDia(matches, destaquesPorData);

  return jsonResponse({
    periodo,
    range,
    total: rankings.length,
    maiorNumeroCampeoesDaTemporada: rankings[0]?.campeoesDoDia ?? 0,
    rankings,
  });
}
