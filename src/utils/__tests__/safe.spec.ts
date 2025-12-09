import { asArray, get, pick } from "@/utils/safe";

describe("safe utils", () => {
  it("asArray normaliza valores para array", () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray<number | null>(null)).toEqual([]);
  });

  it("get retorna fallback quando valor e nulo", () => {
    expect(get<string, string>(null, "fallback")).toBe("fallback");
    expect(get("valor")).toBe("valor");
  });

  it("pick acessa chave com fallback seguro", () => {
    const obj = { nome: "Racha Top", cidade: "BH" };
    expect(pick(obj, "nome")).toBe("Racha Top");
    expect(pick(null, "nome", "Default")).toBe("Default");
  });
});
