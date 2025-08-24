// Implementa teste simples de slugify usando uma função local de apoio
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

describe("slugify util", () => {
  it("gera slug esperado", () => {
    expect(slugify("Fut7 Pro — Ágil & Forte")).toBe("fut7-pro-agil-forte");
  });
});
