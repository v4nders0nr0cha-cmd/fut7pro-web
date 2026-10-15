import { resolveAdminLoginCallbackUrl } from "../AdminLoginClient";

describe("resolveAdminLoginCallbackUrl", () => {
  it("preserva o retorno local da transferência sem exigir contexto de tenant", () => {
    expect(resolveAdminLoginCallbackUrl("/transferencia-presidencia/confirmar")).toBe(
      "/transferencia-presidencia/confirmar"
    );
  });

  it.each(["https://evil.test/callback", "//evil.test/callback", "\\evil.test\\callback", ""])(
    "recusa callback externo ou inválido: %s",
    (callbackUrl) => {
      expect(resolveAdminLoginCallbackUrl(callbackUrl)).toBe("/admin/selecionar-racha");
    }
  );
});
