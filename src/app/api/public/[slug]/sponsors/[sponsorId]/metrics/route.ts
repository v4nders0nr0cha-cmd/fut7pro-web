import { NextRequest, NextResponse } from "next/server";

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

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string; sponsorId: string } }
) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  const url = new URL(
    `${backendBase.replace(/\/+$/, "")}/public/${encodeURIComponent(
      params.slug
    )}/sponsors/${encodeURIComponent(params.sponsorId)}/metrics`
  );

  try {
    const body = await req.text();
    const res = await fetch(url.toString(), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/json",
      },
      body,
    });

    const responseBody = await res.text();
    if (!res.ok) {
      return json(
        {
          error: "Falha ao registrar metrica do patrocinador",
          status: res.status,
          body: responseBody,
        },
        { status: res.status }
      );
    }

    return new NextResponse(responseBody, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json(
      { error: "Falha ao registrar metrica do patrocinador", details: message },
      { status: 500 }
    );
  }
}
