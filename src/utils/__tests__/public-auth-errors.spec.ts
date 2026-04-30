import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

describe("getHumanAuthErrorMessage", () => {
  it("nao vaza erro tecnico de reset de senha", () => {
    expect(getHumanAuthErrorMessage(new Error("Bad Request"))).toBe(
      "Não foi possível concluir a solicitação. Confira os dados e tente novamente."
    );
  });

  it("explica token invalido sem mostrar mensagem bruta", () => {
    expect(getHumanAuthErrorMessage("invalid token")).toBe(
      "Este link não é mais válido. Solicite um novo link para continuar."
    );
  });

  it("explica sessao expirada sem mostrar Unauthorized", () => {
    expect(getHumanAuthErrorMessage({ message: "Unauthorized" })).toBe(
      "Sua sessão expirou. Entre novamente para continuar."
    );
  });

  it("usa fallback humano para erro desconhecido", () => {
    expect(getHumanAuthErrorMessage("Request failed with status 418")).toBe(
      "Não foi possível concluir esta ação agora. Tente novamente em alguns instantes."
    );
  });
});
