import { buildPublicHref, resolvePublicTenantSlug } from "../public-links";

describe("rota pessoal pública", () => {
  it("mantém o grupo ativo sem confundir a rota pessoal com um slug de grupo", () => {
    expect(buildPublicHref("/minha-conta", "racha-azul")).toBe("/racha-azul/minha-conta");
    expect(resolvePublicTenantSlug("/racha-azul/minha-conta")).toBe("racha-azul");
    expect(resolvePublicTenantSlug("/minha-conta")).toBeNull();
    expect(buildPublicHref("/perfil", "racha-azul")).toBe("/racha-azul/perfil");
  });
});
