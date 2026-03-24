jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    cache: (fn: unknown) => fn,
  };
});

import { isPrestacaoDeContasPathForSlug } from "../layout-path-utils";

describe("PublicSlugLayout helpers", () => {
  it("identifica rota de prestacao de contas para o slug informado", () => {
    expect(
      isPrestacaoDeContasPathForSlug(
        "/nome-do-racha/sobre-nos/prestacao-de-contas",
        "nome-do-racha"
      )
    ).toBe(true);
    expect(
      isPrestacaoDeContasPathForSlug(
        "https://app.fut7pro.com.br/nome-do-racha/sobre-nos/prestacao-de-contas?foo=bar",
        "nome-do-racha"
      )
    ).toBe(true);
  });

  it("nao permite rotas diferentes ou slug diferente", () => {
    expect(isPrestacaoDeContasPathForSlug("/nome-do-racha/sobre-nos", "nome-do-racha")).toBe(false);
    expect(
      isPrestacaoDeContasPathForSlug("/outro-racha/sobre-nos/prestacao-de-contas", "nome-do-racha")
    ).toBe(false);
  });
});
