import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { requireUser } from "@/app/api/_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase = getApiBase().replace(/\/+$/, "");

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  const user = await requireUser();
  if (!user?.accessToken) {
    return json({ error: "Nao autenticado" }, { status: 401 });
  }

  const slug = params.slug?.trim().toLowerCase();
  if (!slug) {
    return json({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendBase}/mensalistas/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "x-tenant-slug": slug,
      },
      cache: "no-store",
    });

    const text = await response.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      return json(
        typeof body === "object" && body
          ? body
          : { error: typeof body === "string" ? body : "Erro ao solicitar vaga" },
        { status: response.status }
      );
    }

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json(
      { error: "Falha ao enviar solicitacao de mensalista", details: message },
      { status: 500 }
    );
  }
}
