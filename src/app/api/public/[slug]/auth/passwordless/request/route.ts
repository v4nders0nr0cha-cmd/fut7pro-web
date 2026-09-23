import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { normalizePasswordlessStartResponse } from "@/utils/public-auth-normalizers";

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

export async function POST(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  if (!backendBase) {
    return json({ error: "Não foi possível conectar ao Fut7Pro agora." }, { status: 500 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json(
      { error: "Não foi possível concluir a solicitação. Confira os dados e tente novamente." },
      { status: 400 }
    );
  }

  const slug = params.slug?.trim().toLowerCase();
  if (!slug) {
    return json(
      { error: "Não encontramos este racha. Confira o link e tente novamente." },
      { status: 400 }
    );
  }
  if (slug === "vitrine") {
    return json({ error: "Login de atletas desabilitado no racha vitrine." }, { status: 403 });
  }

  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const turnstileToken =
    typeof payload?.turnstileToken === "string" ? payload.turnstileToken.trim() : "";
  const turnstileProof =
    typeof payload?.turnstileProof === "string" ? payload.turnstileProof.trim() : "";
  if (!email) {
    return json({ error: "Informe um e-mail válido para continuar." }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendBase}/auth/passwordless/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        rachaSlug: slug,
        turnstileToken: turnstileToken || undefined,
        turnstileProof: turnstileProof || undefined,
      }),
    });
    const parsed = await response.json().catch(() => null);
    const parsedRecord =
      typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>) : null;

    if (!response.ok) {
      const code = typeof parsedRecord?.code === "string" ? parsedRecord.code : "";
      if (
        code === "CAPTCHA_REQUIRED" ||
        code === "CAPTCHA_INVALID" ||
        code === "TURNSTILE_REQUIRED" ||
        code === "TURNSTILE_INVALID" ||
        code === "TURNSTILE_UNAVAILABLE"
      ) {
        return json(
          {
            code,
            message:
              typeof parsedRecord?.message === "string"
                ? parsedRecord.message
                : "Não foi possível validar a verificação de segurança.",
            requiresCaptcha: true,
          },
          { status: response.status || 429 }
        );
      }

      if (response.status >= 500) {
        return json(
          { error: "Não foi possível enviar o código agora. Tente novamente em instantes." },
          { status: 502 }
        );
      }

      return json(normalizePasswordlessStartResponse(parsed), { status: 200 });
    }

    return json(normalizePasswordlessStartResponse(parsed), { status: 200 });
  } catch {
    return json(
      {
        error: "Não foi possível enviar o código agora. Verifique sua internet e tente novamente.",
      },
      { status: 502 }
    );
  }
}
