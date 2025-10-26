export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";
const TAG_PREFIX = "player-rankings";

function resolveBackendBase() {
  const base =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;
  return base.replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  }

  const backendBase = resolveBackendBase();
  const params = new URLSearchParams();

  const type = (searchParams.get("type") ?? "geral").toLowerCase();
  if (type) params.set("type", type);

  const periodo = searchParams.get("periodo");
  if (periodo) params.set("periodo", periodo);

  const ano = searchParams.get("ano");
  if (ano) params.set("ano", ano);

  const limit = searchParams.get("limit");
  if (limit) params.set("limit", limit);

  const position = searchParams.get("position");
  if (position) params.set("position", position);

  const tenantId = searchParams.get("tenantId");
  if (tenantId) params.set("tenantId", tenantId);

  const backendUrl = `${backendBase}/public/${encodeURIComponent(slug)}/player-rankings${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        "content-type": "application/json",
      },
      next: {
        revalidate: 300,
        tags: [`${TAG_PREFIX}:${slug}:${type}`],
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload.error === "string" && payload.error) ||
        `backend_error_${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "unexpected_error",
        fallback: true,
        results: [],
        slug,
      },
      { status: 200 },
    );
  }
}
