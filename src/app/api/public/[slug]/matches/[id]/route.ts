import { NextRequest, NextResponse } from "next/server";
import { getVitrineMatchResponse, isPublicVitrineSlug } from "@/lib/public-vitrine-demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase =
  process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  if (isPublicVitrineSlug(params.slug)) {
    const body = getVitrineMatchResponse(params.id);
    return body.result ? json(body) : json(body, { status: 404 });
  }

  if (!backendBase) {
    return json({ error: "Não foi possível conectar ao Fut7Pro agora." }, { status: 500 });
  }

  const url = new URL(
    `${backendBase.replace(/\/+$/, "")}/public/${encodeURIComponent(params.slug)}/matches/${encodeURIComponent(params.id)}`
  );

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = await res.text();

    if (!res.ok) {
      return json(
        { error: "Falha ao consultar partida publica", status: res.status, body },
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
    return json({ error: "Falha ao consultar partida publica", details: message }, { status: 500 });
  }
}
