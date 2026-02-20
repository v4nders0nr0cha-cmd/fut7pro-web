import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase =
  process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
const TENANT_SCOPE_QUERY_KEYS = new Set(["slug", "tenant", "tenantid", "tenantslug", "rachaid"]);
const BLOCKED_QUERY_KEYS = new Set([
  "include",
  "select",
  "where",
  "expand",
  "populate",
  "fields",
  "projection",
  "relations",
  "join",
  "orderby",
  "$where",
  "$select",
  "$expand",
]);
const ALLOWED_QUERY_KEYS = new Set([
  "page",
  "pagesize",
  "limit",
  "offset",
  "cursor",
  "q",
  "search",
  "query",
  "status",
  "category",
  "tier",
  "plan",
  "active",
  "showonfooter",
  "from",
  "to",
  "sort",
  "order",
  "view",
]);

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function appendSafeQueryParams(source: URLSearchParams, target: URL) {
  source.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (TENANT_SCOPE_QUERY_KEYS.has(normalizedKey)) return;
    if (BLOCKED_QUERY_KEYS.has(normalizedKey)) return;
    if (!ALLOWED_QUERY_KEYS.has(normalizedKey)) return;
    target.searchParams.set(key, value);
  });
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  const url = new URL(`${backendBase.replace(/\/+$/, "")}/sponsors/public`);
  url.searchParams.set("slug", params.slug);
  appendSafeQueryParams(req.nextUrl.searchParams, url);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = await res.text();

    if (!res.ok) {
      return json(
        { error: "Falha ao consultar patrocinadores publicos", status: res.status, body },
        { status: res.status }
      );
    }

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json(
      { error: "Falha ao consultar patrocinadores publicos", details: message },
      { status: 500 }
    );
  }
}
