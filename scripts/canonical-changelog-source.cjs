const ts = require("typescript");

function property(object, name) {
  return object.properties.find(
    (member) =>
      ts.isPropertyAssignment(member) && member.name.getText(object.getSourceFile()) === name
  )?.initializer;
}

function readCanonical(source) {
  const file = ts.createSourceFile(
    "changelog.entries.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  if (file.parseDiagnostics.length) throw new Error("Fonte canônica com sintaxe inválida.");
  const declarations = file.statements.flatMap((statement) =>
    ts.isVariableStatement(statement) ? [...statement.declarationList.declarations] : []
  );
  const declaration = declarations.find(
    (candidate) =>
      ts.isIdentifier(candidate.name) && candidate.name.text === "CANONICAL_CHANGELOG_ENTRIES"
  );
  if (!declaration || !ts.isArrayLiteralExpression(declaration.initializer)) {
    throw new Error("Lista canônica de atualizações não encontrada.");
  }
  const entries = declaration.initializer.elements.map((element) => {
    if (!ts.isObjectLiteralExpression(element)) throw new Error("Entrada canônica inválida.");
    const version = property(element, "version");
    const releaseDate = property(element, "releaseDate");
    const items = property(element, "items");
    const evidence = property(element, "evidence");
    if (
      !version ||
      !ts.isStringLiteralLike(version) ||
      !releaseDate ||
      !ts.isStringLiteralLike(releaseDate) ||
      !items ||
      !ts.isArrayLiteralExpression(items) ||
      !evidence ||
      !ts.isArrayLiteralExpression(evidence)
    )
      throw new Error("Entrada publicada sem versão, data, evidências ou itens literais.");
    return { version: version.text, shape: shape(element) };
  });
  const versions = entries.map((entry) => entry.version);
  if (new Set(versions).size !== versions.length) throw new Error("Versão canônica duplicada.");
  return {
    entries,
    outside:
      source.slice(0, declaration.initializer.getStart(file)) +
      source.slice(declaration.initializer.end),
  };
}

function shape(node) {
  if (ts.isObjectLiteralExpression(node)) {
    return node.properties.map((member) => {
      if (!ts.isPropertyAssignment(member) || !ts.isIdentifier(member.name)) {
        throw new Error("Entrada canônica deve conter apenas propriedades literais.");
      }
      const name = member.name.text;
      if (["title", "summary", "description"].includes(name)) {
        if (!ts.isStringLiteralLike(member.initializer)) {
          throw new Error(`Texto editorial ${name} deve ser literal.`);
        }
        return [name, "<texto>"];
      }
      return [name, shape(member.initializer)];
    });
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(shape);
  if (ts.isStringLiteralLike(node)) return node.text;
  return node.getText().replace(/\s+/g, "");
}

function classifyCanonicalChange(beforeSource, afterSource) {
  const before = readCanonical(beforeSource);
  const after = readCanonical(afterSource);
  const oldVersions = new Set(before.entries.map((entry) => entry.version));
  const newVersions = new Set(after.entries.map((entry) => entry.version));
  const removed = [...oldVersions].filter((version) => !newVersions.has(version));
  if (removed.length) throw new Error(`Versões publicadas removidas: ${removed.join(", ")}.`);
  const added = [...newVersions].filter((version) => !oldVersions.has(version));
  if (added.length) return { kind: "release", versions: added };
  if (
    before.outside.replace(/\r\n/g, "\n") !== after.outside.replace(/\r\n/g, "\n") ||
    JSON.stringify(before.entries) !== JSON.stringify(after.entries)
  ) {
    throw new Error(
      "Sem nova versão, apenas título, resumo e descrições de entradas publicadas podem mudar."
    );
  }
  if (beforeSource.replace(/\r\n/g, "\n") === afterSource.replace(/\r\n/g, "\n")) {
    throw new Error("A fonte canônica não mudou.");
  }
  return { kind: "editorial", versions: [] };
}

module.exports = { readCanonical, classifyCanonicalChange };
