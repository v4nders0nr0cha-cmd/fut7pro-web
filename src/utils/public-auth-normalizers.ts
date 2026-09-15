export const LOOKUP_UNIFORM_MESSAGE = "Se estiver tudo certo, enviamos seu codigo.";
export const PASSWORDLESS_UNIFORM_MESSAGE = "Se estiver tudo certo, enviaremos seu código.";

export function normalizeLookupSuccess(payload: unknown) {
  const body = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};
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
    ...(turnstileProof ? { turnstileProof } : {}),
    ...(turnstileProofExpiresAt ? { turnstileProofExpiresAt } : {}),
  };
}

export function normalizePasswordlessStartResponse(payload: unknown) {
  const body = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};
  const resendCooldownSeconds =
    typeof body.resendCooldownSeconds === "number" && Number.isFinite(body.resendCooldownSeconds)
      ? Math.max(0, Math.floor(body.resendCooldownSeconds))
      : 60;
  const turnstileProof =
    typeof body.turnstileProof === "string" && body.turnstileProof.trim()
      ? body.turnstileProof.trim()
      : null;

  return {
    ok: true,
    message: PASSWORDLESS_UNIFORM_MESSAGE,
    ...(body.requiresCaptcha === true ? { requiresCaptcha: true } : {}),
    resendCooldownSeconds,
    ...(turnstileProof ? { turnstileProof } : {}),
  };
}
