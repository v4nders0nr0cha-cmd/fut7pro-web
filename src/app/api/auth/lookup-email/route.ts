import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase = getApiBase().replace(/\/+$/, "");
const LOOKUP_UNIFORM_MESSAGE = "Se estiver tudo certo, enviaremos seu código.";

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function normalizeLookupSuccess(payload: unknown) {
  const body = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};
  const nextAction =
    typeof body.nextAction === "string" && body.nextAction.trim()
      ? body.nextAction.trim().toUpperCase()
      : null;
  const membershipStatus =
    typeof body.membershipStatus === "string" && body.membershipStatus.trim()
      ? body.membershipStatus.trim().toUpperCase()
      : null;
  const turnstileProof =
    typeof body.turnstileProof === "string" && body.turnstileProof.trim()
      ? body.turnstileProof.trim()
      : null;
  const turnstileProofExpiresAt =
    typeof body.turnstileProofExpiresAt === "number" &&
    Number.isFinite(body.turnstileProofExpiresAt)
      ? body.turnstileProofExpiresAt
      : null;

  return {
    ok: true,
    message: LOOKUP_UNIFORM_MESSAGE,
    ...(body.requiresCaptcha === true ? { requiresCaptcha: true } : {}),
    ...(nextAction ? { nextAction } : {}),
    ...(membershipStatus ? { membershipStatus } : {}),
    ...(turnstileProof ? { turnstileProof } : {}),
    ...(turnstileProofExpiresAt ? { turnstileProofExpiresAt } : {}),
  };
}

export async function POST(req: NextRequest) {
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

  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const rachaSlug = typeof payload?.rachaSlug === "string" ? payload.rachaSlug.trim() : "";
  const captchaToken = typeof payload?.captchaToken === "string" ? payload.captchaToken.trim() : "";
  const turnstileToken =
    typeof payload?.turnstileToken === "string" ? payload.turnstileToken.trim() : "";
  const turnstileProof =
    typeof payload?.turnstileProof === "string" ? payload.turnstileProof.trim() : "";

  if (!email) {
    return json({ error: "Informe um e-mail válido para continuar." }, { status: 400 });
  }

  if (rachaSlug.toLowerCase() === "vitrine") {
    return json(normalizeLookupSuccess(null), { status: 200 });
  }

  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const response = await fetch(`${backendBase}/auth/lookup-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        ...(realIp ? { "x-real-ip": realIp } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      body: JSON.stringify({
        email,
        rachaSlug: rachaSlug || undefined,
        captchaToken: captchaToken || undefined,
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

      if (code === "RACHA_NOT_FOUND") {
        return json(normalizeLookupSuccess(null), { status: 200 });
      }

      const status = response.status >= 500 ? 502 : response.status || 400;
      return json(
        {
          error: getHumanAuthErrorMessage(
            parsedRecord,
            "Não foi possível verificar seu e-mail agora. Tente novamente em instantes."
          ),
        },
        { status }
      );
    }

    return json(normalizeLookupSuccess(parsed), { status: 200 });
  } catch {
    return json(
      {
        error:
          "Não foi possível verificar seu e-mail agora. Verifique sua internet e tente novamente.",
      },
      { status: 502 }
    );
  }
}
