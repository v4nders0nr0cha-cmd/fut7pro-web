import { NextRequest } from "next/server";
import { diagHeaders } from "@/lib/api-headers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";
const FALLBACK_RESPONSE = {
  slug: "",
  type: "geral",
  results: [],
  total: 0,
  availableYears: [],
  appliedPeriod: { mode: "all" as const },
};

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function GET(req: NextRequest) {
  let baseUrl: string;
  try {
    baseUrl = getApiBase();
  } catch (error) {
    return json({ ...FALLBACK_RESPONSE, error: "API base ausente" }, { status: 503 });
  }

  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();
  const type = (url.searchParams.get("type") ?? "geral").trim().toLowerCase();
  const limit = (url.searchParams.get("limit") ?? "").trim();
  const position = (url.searchParams.get("position") ?? "").trim();
  const period = (url.searchParams.get("period") ?? "").trim().toLowerCase();
  const year = (url.searchParams.get("year") ?? "").trim();
  const quarter = (url.searchParams.get("quarter") ?? "").trim();
  const start = (url.searchParams.get("start") ?? "").trim();
  const end = (url.searchParams.get("end") ?? "").trim();

  if (!slug) {
    return json({ error: "slug obrigatorio" }, { status: 400 });
  }

  const search = new URLSearchParams();
  if (type) search.set("type", type);
  if (limit) search.set("limit", limit);
  if (position) search.set("position", position);
  if (period) search.set("period", period);
  if (year) search.set("year", year);
  if (quarter) search.set("quarter", quarter);
  if (start) search.set("start", start);
  if (end) search.set("end", end);

  const upstream = `${baseUrl}/public/${encodeURIComponent(slug)}/player-rankings${
    search.toString() ? `?${search.toString()}` : ""
  }`;

  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        accept: JSON_CT,
      },
      cache: "no-store",
    });

    const bodyText = await response.text();
    if (!response.ok) {
      return json(
        {
          ...FALLBACK_RESPONSE,
          slug,
          type,
          error: `Upstream ${response.status}`,
          status: response.status,
          body: bodyText.slice(0, 300),
        },
        { status: response.status }
      );
    }

    return new Response(bodyText, {
      status: 200,
      headers: {
        ...diagHeaders("backend"),
        "Content-Type": response.headers.get("content-type") ?? JSON_CT,
      },
    });
  } catch (error) {
    return json(
      {
        ...FALLBACK_RESPONSE,
        slug,
        type,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 502 }
    );
  }
}
