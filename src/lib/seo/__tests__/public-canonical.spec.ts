import { resolveCanonicalPathForPublicSlug } from "@/lib/seo/public-canonical";

describe("resolveCanonicalPathForPublicSlug", () => {
  it("retorna fallback para raiz slugada quando nao ha header util", () => {
    const result = resolveCanonicalPathForPublicSlug("vitrine", [null, undefined, ""]);
    expect(result).toBe("/vitrine");
  });

  it("aceita pathname com query/hash e remove sufixos", () => {
    const result = resolveCanonicalPathForPublicSlug("vitrine", [
      "/vitrine/partidas/times-do-dia?tab=hoje#ancora",
    ]);
    expect(result).toBe("/vitrine/partidas/times-do-dia");
  });

  it("aceita url absoluta e preserva rota slugada", () => {
    const result = resolveCanonicalPathForPublicSlug("vitrine", [
      "https://app.fut7pro.com.br/vitrine/atletas/alan",
    ]);
    expect(result).toBe("/vitrine/atletas/alan");
  });

  it("ignora path de outro slug", () => {
    const result = resolveCanonicalPathForPublicSlug("vitrine", [
      "/sertao/partidas",
      "/api/public/vitrine/tenant",
    ]);
    expect(result).toBe("/vitrine");
  });
});
