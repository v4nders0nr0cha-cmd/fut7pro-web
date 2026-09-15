import { normalizePasswordlessStartResponse } from "@/utils/public-auth-normalizers";

describe("api/public/[slug]/auth/passwordless/request proxy", () => {
  it("normaliza resposta legada USER_NOT_FOUND para contrato neutro", () => {
    const result = normalizePasswordlessStartResponse({
      code: "USER_NOT_FOUND",
      message: "Você ainda não possui Conta Global Fut7Pro.",
    });

    expect(result).toEqual({
      ok: true,
      message: "Se estiver tudo certo, enviaremos seu código.",
      resendCooldownSeconds: 60,
    });
    expect(result).not.toHaveProperty("code");
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
