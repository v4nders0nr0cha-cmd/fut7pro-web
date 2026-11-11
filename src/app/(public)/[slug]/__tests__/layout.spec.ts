jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    cache: (fn: unknown) => fn,
  };
});

import { isPrestacaoDeContasPathForSlug } from "../layout-path-utils";
import { resolvePublicPageSeo } from "@/lib/seo/public-page-seo";

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

  it.each(["Pelada da Sexta", "Baba dos Amigos", "Racha de Domingo", "Futebol dos Parceiros"])(
    "usa o nome integral do grupo sem pressupor gênero: %s",
    (tenantName) => {
      const home = resolvePublicPageSeo("/grupo", tenantName);
      const history = resolvePublicPageSeo("/grupo/sobre-nos/nossa-historia", tenantName);

      expect(home.title).toContain(tenantName);
      expect(home.description).toContain(`${tenantName}:`);
      expect(history.description).toContain(`${tenantName}:`);
      expect(home.description).not.toContain(`do grupo ${tenantName}`);
      expect(home).not.toHaveProperty("noindex");
    }
  );

  it("mantém as páginas de acesso fora da indexação", () => {
    expect(resolvePublicPageSeo("/grupo/login", "Pelada da Sexta").noindex).toBe(true);
    expect(resolvePublicPageSeo("/grupo/register", "Pelada da Sexta").noindex).toBe(true);
  });
});
