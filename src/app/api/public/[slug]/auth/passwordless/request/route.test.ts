import { normalizePasswordlessStartResponse } from "@/utils/public-auth-normalizers";

describe("api/public/[slug]/auth/passwordless/request proxy", () => {
  it("mantem o mesmo shape observavel para conta existente e inexistente no contrato atual", () => {
    const existingAccount = normalizePasswordlessStartResponse({
      ok: true,
      message: "Se estiver tudo certo, enviamos seu codigo.",
      resendCooldownSeconds: 60,
      turnstileProof: "proof-existing",
    });
    const missingAccount = normalizePasswordlessStartResponse({
      ok: true,
      message: "Se estiver tudo certo, enviamos seu codigo.",
      resendCooldownSeconds: 60,
      turnstileProof: "proof-missing",
    });

    expect(Object.keys(existingAccount).sort()).toEqual(Object.keys(missingAccount).sort());
    expect(existingAccount).toMatchObject({
      ok: true,
      message: "Se estiver tudo certo, enviaremos seu código.",
      resendCooldownSeconds: 60,
    });
    expect(missingAccount).toMatchObject({
      ok: true,
      message: "Se estiver tudo certo, enviaremos seu código.",
      resendCooldownSeconds: 60,
    });
    expect(typeof existingAccount.turnstileProof).toBe("string");
    expect(typeof missingAccount.turnstileProof).toBe("string");
  });

  it("mantem ausencia uniforme de proof quando Turnstile proof nao vem do backend", () => {
    const existingAccount = normalizePasswordlessStartResponse({
      ok: true,
      resendCooldownSeconds: 60,
    });
    const missingAccount = normalizePasswordlessStartResponse({
      ok: true,
      resendCooldownSeconds: 60,
    });

    expect(existingAccount).toEqual(missingAccount);
    expect(existingAccount).not.toHaveProperty("turnstileProof");
  });

  it("preserva apenas campos seguros do inicio passwordless", () => {
    const result = normalizePasswordlessStartResponse({
      ok: true,
      resendCooldownSeconds: 30,
      turnstileProof: "proof",
      nextAction: "REQUEST_JOIN",
      membershipStatus: "NONE",
      userExists: true,
    });

    expect(result).toEqual({
      ok: true,
      message: "Se estiver tudo certo, enviaremos seu código.",
      resendCooldownSeconds: 30,
      turnstileProof: "proof",
    });
    expect(result).not.toHaveProperty("nextAction");
    expect(result).not.toHaveProperty("membershipStatus");
    expect(result).not.toHaveProperty("userExists");
  });
});
