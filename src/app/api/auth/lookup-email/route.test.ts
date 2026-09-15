import { normalizeLookupSuccess } from "@/utils/public-auth-normalizers";

describe("api/auth/lookup-email proxy", () => {
  it("descarta campos sensiveis mesmo quando o upstream os envia", () => {
    const result = normalizeLookupSuccess({
      ok: true,
      message: "mensagem upstream",
      userExists: true,
      providers: ["credentials"],
      availableAuthMethods: ["password"],
      hasPassword: true,
      nextAction: "REQUEST_JOIN",
      membershipStatus: "NONE",
      requiresCaptcha: true,
      turnstileProof: "proof",
      turnstileProofExpiresAt: 123,
    });

    expect(result).toEqual({
      ok: true,
      message: "Se estiver tudo certo, enviamos seu codigo.",
      requiresCaptcha: true,
      turnstileProof: "proof",
      turnstileProofExpiresAt: 123,
    });
    expect(result).not.toHaveProperty("userExists");
    expect(result).not.toHaveProperty("providers");
    expect(result).not.toHaveProperty("availableAuthMethods");
    expect(result).not.toHaveProperty("hasPassword");
    expect(result).not.toHaveProperty("nextAction");
    expect(result).not.toHaveProperty("membershipStatus");
  });
});
