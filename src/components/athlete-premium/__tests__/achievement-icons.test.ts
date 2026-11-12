import { resolveIconValue } from "@/components/atletas/ConquistasDoAtleta";

describe("ícones das conquistas preservadas no perfil premium", () => {
  it("mantém o ícone cadastrado ou o equivalente das categorias antigas", () => {
    expect(resolveIconValue("/images/icons/premio.png", "Prêmio", "grandes")).toBe(
      "/images/icons/premio.png"
    );
    expect(resolveIconValue("bola-de-ouro", "Artilheiro", "anual")).toBe(
      "/images/icons/bola-de-ouro.png"
    );
    expect(resolveIconValue(null, "Luva do quadrimestre", "quadrimestral")).toBe(
      "/images/icons/luva-de-prata.png"
    );
  });
});
