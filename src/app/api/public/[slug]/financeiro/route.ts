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

function parseErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const code = (payload as Record<string, unknown>).code;
  return typeof code === "string" && code.trim() ? code.trim() : null;
}

function parseErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const rawMessage = (payload as Record<string, unknown>).message;
  if (typeof rawMessage === "string" && rawMessage.trim()) return rawMessage.trim();

  const nestedError = (payload as Record<string, unknown>).error;
  if (typeof nestedError === "string" && nestedError.trim()) return nestedError.trim();
  return null;
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  const url = new URL(
    `${backendBase.replace(/\/+$/, "")}/public/${encodeURIComponent(params.slug)}/financeiro`
  );

  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const bodyText = await res.text();
    let bodyJson: unknown = null;
    if (bodyText) {
      try {
        bodyJson = JSON.parse(bodyText);
      } catch {
        bodyJson = null;
      }
    }

    if (!res.ok) {
      const backendCode = parseErrorCode(bodyJson);
      const backendMessage = parseErrorMessage(bodyJson);

      if (res.status === 404 && backendCode === "RACHA_NOT_FOUND") {
        return json(
          {
            code: "RACHA_NOT_FOUND",
            publicState: "SLUG_NOT_FOUND",
            message: "Racha não encontrado.",
          },
          { status: 404 }
        );
      }

      if (res.status === 403 && backendCode === "FINANCEIRO_MODULE_DISABLED") {
        return json(
          {
            code: "FINANCEIRO_MODULE_DISABLED",
            publicState: "MODULE_DISABLED",
            message:
              backendMessage ||
              "A administração deste racha não disponibilizou a prestação de contas pública.",
          },
          { status: 403 }
        );
      }

      if (res.status === 429 || res.status >= 500) {
        return json(
          {
            code: "FINANCEIRO_UNAVAILABLE",
            publicState: "UNAVAILABLE",
            message:
              "Prestação de contas temporariamente indisponível. Tente novamente em instantes.",
          },
          { status: 503 }
        );
      }

      return json(
        {
          code: "FINANCEIRO_UNAVAILABLE",
          publicState: "UNAVAILABLE",
          message: "Não foi possível carregar a prestação de contas no momento.",
        },
        { status: 502 }
      );
    }

    return json(bodyJson ?? {}, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json(
      {
        code: "FINANCEIRO_UNAVAILABLE",
        publicState: "UNAVAILABLE",
        message: "Falha ao consultar a prestação de contas.",
      },
      { status: 500 }
    );
  }
}
