export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { classificacaoTimes as mockClassificacaoTimes } from "@/components/lists/mockClassificacaoTimes";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";
const TAG_PREFIX = "team-rankings";

function resolveBackendBase() {
  const candidate =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;
  return candidate.replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  }

  const periodo = searchParams.get("periodo");
  const ano = searchParams.get("ano");

  const params = new URLSearchParams();
  if (periodo) params.set("periodo", periodo);
  if (ano) params.set("ano", ano);

  const backendUrl = `${resolveBackendBase()}/public/${encodeURIComponent(
    slug,
  )}/team-rankings${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        "content-type": "application/json",
      },
      next: {
        revalidate: 300,
        tags: [`${TAG_PREFIX}:${slug}`],
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
    const fallbackResponse = {
      slug,
      periodo: periodo ?? "historico",
      ano: ano ? Number(ano) : null,
      results: mockClassificacaoTimes,
      fallback: true,
      updatedAt: null,
      availableYears: [],
      error: error instanceof Error ? error.message : "unknown_error",
    };
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}
