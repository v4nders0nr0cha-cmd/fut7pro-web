import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const slug = search.get("slug");

  if (!slug) {
    return jsonResponse({ error: "slug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = new URL(`${base}/public/${encodeURIComponent(slug)}/matches`);

  search.forEach((value, key) => {
    if (key !== "slug") {
      url.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json().catch(() => null) : await response.text();

    if (!response.ok) {
      return jsonResponse(
        { error: (body as any)?.error ?? `Falha ao buscar partidas`, status: response.status },
        { status: response.status },
      );
    }

    return jsonResponse(body, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao consultar partidas", details: message }, { status: 500 });
  }
}
