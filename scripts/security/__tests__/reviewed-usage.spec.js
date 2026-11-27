const { evaluateImports } = require("../check-reviewed-usage");
describe("temporary exception consumer boundaries", () => {
  it("allows the reviewed browser consumers", () => {
    expect(
      evaluateImports([
        { file: "src/lib/validation.ts", specifier: "zod" },
        { file: "src/hooks/useRacha.ts", specifier: "@/lib/validation" },
      ])
    ).toEqual([]);
  });
  it("rejects new API consumers through direct, aliased and relative imports", () => {
    for (const specifier of ["zod", "@/lib/validation", "../../../lib/validation"])
      expect(evaluateImports([{ file: "src/app/api/new/route.ts", specifier }])).toHaveLength(1);
  });
  it("does not permit hiding legacy Zod behind a newer package or exposing Prisma tooling", () => {
    for (const specifier of ["zod/v3", "prisma/config", "@prisma/config", "deepmerge-ts"])
      expect(evaluateImports([{ file: "src/app/api/new/route.ts", specifier }])).toHaveLength(1);
  });
});
