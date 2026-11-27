const fs = require("node:fs");
const path = require("node:path");

const reviewed = {
  zod: [
    "src/lib/validation.ts",
    "src/lib/bounded-array.ts",
    "src/utils/schemas/nossaHistoria.schema.ts",
    "src/app/(superadmin)/superadmin/(protected)/(configuracoes)/config/page.tsx",
  ],
  "src/lib/validation": ["src/hooks/useRacha.ts", "src/hooks/useRachaPublic.ts"],
  "src/lib/bounded-array": ["src/utils/schemas/nossaHistoria.schema.ts"],
  "src/utils/schemas/nossaHistoria.schema": [
    "src/app/(admin)/admin/personalizacao/editar-paginas/nossa-historia/NossaHistoriaEditor.tsx",
    "src/app/(public)/sobre-nos/nossa-historia/page.tsx",
  ],
  "deepmerge-ts": [],
  "@prisma/config": [],
  "prisma/config": [],
};

function evaluateImports(imports) {
  const violations = [];
  for (const { file, specifier } of imports) {
    let target = specifier;
    if (specifier.startsWith("@/")) target = `src/${specifier.slice(2)}`;
    else if (specifier.startsWith("."))
      target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
    target = target.replace(/\.(?:tsx?|jsx?)$/, "");
    if (specifier.startsWith("zod/")) {
      violations.push({ file, specifier, reason: "Unreviewed Zod subpath" });
      continue;
    }
    if (Object.hasOwn(reviewed, target) && !reviewed[target].includes(file))
      violations.push({
        file,
        specifier,
        reason: "Consumer outside the temporary exception review",
      });
  }
  return violations;
}

function inventory() {
  const imports = [];
  let checkedFiles = 0;
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "__tests__") visit(filename);
        continue;
      }
      if (!/\.[jt]sx?$/.test(entry.name) || /\.(?:spec|test|d)\.[jt]sx?$/.test(entry.name))
        continue;
      checkedFiles++;
      const file = filename.split(path.sep).join("/");
      const source = fs.readFileSync(filename, "utf8");
      for (const match of source.matchAll(
        /\b(?:from\s+|require\s*\(\s*|import\s*\(\s*)["']([^"']+)["']/g
      ))
        imports.push({ file, specifier: match[1] });
    }
  }
  visit("src");
  return { checkedFiles, violations: evaluateImports(imports) };
}

if (require.main === module) {
  const result = inventory();
  fs.writeFileSync("security-usage.json", JSON.stringify(result, null, 2) + "\n");
  console.log(
    `Reviewed dependency consumers: ${result.checkedFiles} files, ${result.violations.length} violations. Literal import inventory; not general taint analysis.`
  );
  if (result.violations.length) process.exitCode = 1;
}
module.exports = { evaluateImports, inventory };
