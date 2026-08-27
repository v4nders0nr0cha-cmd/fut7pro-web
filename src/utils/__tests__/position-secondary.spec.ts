import {
  getValidSecondaryCanonicalOptions,
  getValidSecondaryDisplayOptions,
  isGoalkeeperPosition,
  isLinePosition,
  isSecondaryRequired,
  normalizeSecondaryCanonical,
} from "../position-secondary";

describe("position-secondary helpers", () => {
  it("inicia sem opcoes quando a posicao principal ainda nao foi escolhida", () => {
    expect(getValidSecondaryCanonicalOptions("")).toEqual([]);
    expect(getValidSecondaryDisplayOptions("")).toEqual([]);
  });

  it.each([
    ["zagueiro", ["meia", "atacante"]],
    ["meia", ["zagueiro", "atacante"]],
    ["atacante", ["zagueiro", "meia"]],
  ])("%s nao permite secundaria igual nem goleiro", (posicao, expected) => {
    expect(getValidSecondaryCanonicalOptions(posicao)).toEqual(expected);
    expect(getValidSecondaryCanonicalOptions(posicao)).not.toContain(posicao);
    expect(getValidSecondaryCanonicalOptions(posicao)).not.toContain("goleiro");
  });

  it.each([
    ["Zagueiro", ["Meia", "Atacante"]],
    ["Meia", ["Zagueiro", "Atacante"]],
    ["Atacante", ["Zagueiro", "Meia"]],
  ])("%s filtra opcoes visuais do formulario", (posicao, expected) => {
    expect(getValidSecondaryDisplayOptions(posicao)).toEqual(expected);
    expect(getValidSecondaryDisplayOptions(posicao)).not.toContain(posicao);
    expect(getValidSecondaryDisplayOptions(posicao)).not.toContain("Goleiro");
  });

  it("goleiro nao exige nem aceita posicao secundaria", () => {
    expect(isGoalkeeperPosition("goleiro")).toBe(true);
    expect(isGoalkeeperPosition("Goleiro")).toBe(true);
    expect(isGoalkeeperPosition("GOL")).toBe(true);
    expect(isSecondaryRequired("goleiro")).toBe(false);
    expect(getValidSecondaryCanonicalOptions("goleiro")).toEqual([]);
    expect(getValidSecondaryDisplayOptions("Goleiro")).toEqual([]);
  });

  it("jogador de linha exige secundaria valida", () => {
    expect(isLinePosition("Zagueiro")).toBe(true);
    expect(isSecondaryRequired("Zagueiro")).toBe(true);
    expect(normalizeSecondaryCanonical("Zagueiro", "Meia")).toBe("meia");
    expect(normalizeSecondaryCanonical("Zagueiro", "Zagueiro")).toBe("");
    expect(normalizeSecondaryCanonical("Zagueiro", "Goleiro")).toBe("");
  });
});
