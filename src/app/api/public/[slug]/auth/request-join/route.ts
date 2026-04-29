import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { requireUser } from "@/app/api/_proxy/helpers";
import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";
import { sanitizePublicAuthErrorPayload } from "../route-errors";

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
    return json({ error: "Não foi possível conectar ao Fut7Pro agora." }, { status: 500 });
  }

  const user = await requireUser({ scope: "athlete" });
  if (!user?.accessToken) {
    return json({ error: "Sua sessão expirou. Entre novamente para continuar." }, { status: 401 });
  }

  const slug = params.slug?.trim().toLowerCase();
  if (!slug) {
    return json(
      { error: "Não encontramos este racha. Confira o link e tente novamente." },
      { status: 400 }
    );
  }
  if (slug === "vitrine") {
    return json({ error: "Cadastro de atletas desabilitado no racha vitrine." }, { status: 403 });
  }

  try {
    const res = await fetch(`${backendBase}/auth/athlete/request-join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.accessToken}`,
        "x-tenant-slug": slug,
      },
      body: JSON.stringify({ rachaSlug: slug }),
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
        sanitizePublicAuthErrorPayload(
          parsed,
          "Não foi possível solicitar entrada neste racha agora. Tente novamente em instantes."
        ),
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
    return json(
      {
        error: getHumanAuthErrorMessage(
          error,
          "Não foi possível solicitar entrada neste racha agora. Verifique sua internet e tente novamente."
        ),
      },
      { status: 500 }
    );
  }
}
