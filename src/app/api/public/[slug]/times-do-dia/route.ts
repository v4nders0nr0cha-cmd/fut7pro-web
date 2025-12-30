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

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  const url = new URL(
    `${backendBase.replace(/\/+$/, "")}/public/${encodeURIComponent(params.slug)}/times-do-dia`
  );

  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = await res.text();

    if (!res.ok) {
      return json(
        { error: "Falha ao consultar times do dia", status: res.status, body },
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
    return json({ error: "Falha ao consultar times do dia", details: message }, { status: 500 });
  }
}
