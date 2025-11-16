import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

function resolveTenantSlug(params: URLSearchParams, body?: Record<string, unknown>): string | null {
  const querySlug = params.get("slug");
  if (querySlug && querySlug.trim().length > 0) {
    return querySlug.trim();
  }

  const bodySlug =
    typeof body?.slug === "string" && body.slug.trim().length > 0 ? body.slug.trim() : null;
  if (bodySlug) {
    return bodySlug;
  }

  const envSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? process.env.DEFAULT_TENANT_SLUG;
  return envSlug?.trim() ?? null;
}

function normalizePayload(raw: Record<string, unknown>) {
  const payload = {
    nome: typeof raw.nome === "string" ? raw.nome.trim() : "",
    nickname:
      typeof raw.nickname === "string" && raw.nickname.trim().length > 0
        ? raw.nickname.trim()
        : undefined,
    email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "",
    posicao: typeof raw.posicao === "string" ? raw.posicao.trim() : "",
    mensagem:
      typeof raw.mensagem === "string" && raw.mensagem.trim().length > 0
        ? raw.mensagem.trim()
        : undefined,
    photoUrl:
      typeof raw.photoUrl === "string" && raw.photoUrl.trim().length > 0
        ? raw.photoUrl.trim()
        : undefined,
  };

  if (!payload.nome || !payload.email || !payload.posicao) {
    return null;
  }

  return payload;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> | null = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  if (!body) {
    return NextResponse.json({ message: "Corpo da requisicao obrigatorio." }, { status: 400 });
  }

  const slug = resolveTenantSlug(req.nextUrl.searchParams, body);
  if (!slug) {
    return NextResponse.json({ message: "Slug do racha nao informado." }, { status: 400 });
  }

  const payload = normalizePayload(body);
  if (!payload) {
    return NextResponse.json(
      { message: "Nome, e-mail e posicao sao obrigatorios." },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await fetch(
      `${getApiBase()}/public/${encodeURIComponent(slug)}/athlete-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const contentType = backendResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const json = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(json, { status: backendResponse.status });
    }

    const text = await backendResponse.text();
    return new NextResponse(text, {
      status: backendResponse.status,
      headers: {
        "Content-Type": contentType ?? "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { message: "Erro ao registrar solicitacao de atleta.", details: message },
      { status: 500 }
    );
  }
}
