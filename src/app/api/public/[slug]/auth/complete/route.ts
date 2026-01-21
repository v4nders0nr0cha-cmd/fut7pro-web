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

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  const user = await requireUser();
  if (!user?.accessToken) {
    return json({ error: "Nao autenticado" }, { status: 401 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Payload invalido" }, { status: 400 });
  }

  const slug = params.slug?.trim().toLowerCase();
  if (!slug) {
    return json({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }
  if (slug === "vitrine") {
    return json({ error: "Cadastro de atletas desabilitado no racha vitrine." }, { status: 403 });
  }

  try {
    const res = await fetch(`${backendBase}/auth/athlete/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.accessToken}`,
        "x-tenant-slug": slug,
      },
      body: JSON.stringify({ ...payload, rachaSlug: slug }),
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      return json(
        typeof parsed === "object" && parsed ? parsed : { error: text || "Erro ao completar" },
        { status: res.status }
      );
    }

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json({ error: "Falha ao completar cadastro", details: message }, { status: 500 });
  }
}
