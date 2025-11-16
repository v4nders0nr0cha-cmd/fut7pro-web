import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { slug?: string } }) {
  const slug = params.slug;
  if (!slug || slug.length === 0) {
    return NextResponse.json({ error: "slug obrigatorio" }, { status: 400 });
  }

  const target = `${getApiBase()}/api/public/rachas/${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(target, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Falha ao buscar racha publico",
          details: text || `HTTP ${response.status}`,
        },
        { status: response.status }
      );
    }

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, {
        status: response.status,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") ?? "application/json",
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao contactar backend", details: message },
      { status: 500 }
    );
  }
}
