const assert = require("assert/strict");
const {
  evaluateChangelogRequirement,
  parseChangelogPrReference,
  validateBackendChangelogPr,
} = require("./check-changelog-required.cjs");

const owner = "v4nders0nr0cha-cmd";
const headSha = "a".repeat(40);
const editorialOwner = {
  headSha,
  authorLogin: owner,
  authorType: "User",
  eventActorLogin: owner,
  eventActorType: "User",
  repositoryOwner: owner,
  authorizedOwner: owner,
};
const editorialDeclaration =
  "- [x] Correção exclusivamente editorial, sem mudança funcional e sem anúncio de produto.";
const editorialReason =
  "Corrige somente orientações existentes da Central de Ajuda, sem alterar ações ou regras.";
const confirmation = (sha = headSha) =>
  `Confirmação editorial do responsável: @${owner} revisou o diff do commit ${sha} e confirma que não há mudanças funcionais.`;
const editorialBody = (sha = headSha) =>
  `${editorialDeclaration}\nMotivo do editorial-no-changelog: ${editorialReason}\n${confirmation(sha)}`;
const source = (versions) =>
  `export const CANONICAL_CHANGELOG_ENTRIES = [\n${versions.map((version) => `  { version: "${version}", title: "Título", summary: "Resumo", releaseDate: "2026-11-11T20:20:32.000Z", evidence: ["web#1"], items: [{ type: ChangelogItemType.MELHORIA, description: "Descrição" }] },`).join("\n")}\n];`;
const replaceInOldVersion = (before, after) => {
  const published = source(["new", "old"]);
  const position = published.lastIndexOf(before);
  assert.notEqual(position, -1);
  return published.slice(0, position) + after + published.slice(position + before.length);
};
const publishedSource = async (sha) => source(sha === "base" ? ["old"] : ["new", "old"]);
const evaluateEditorial = (options = {}) =>
  evaluateChangelogRequirement({
    changedFiles: ["src/lib/help-center-defaults.ts"],
    labels: ["editorial-no-changelog"],
    body: editorialBody(),
    editorialOwner,
    validateReference: async () => ({ ok: false, reason: "unexpected backend lookup" }),
    ...options,
  });

async function run() {
  assert.deepEqual(
    parseChangelogPrReference(
      "Changelog PR: https://github.com/v4nders0nr0cha-cmd/fut7pro-backend-repo/pull/123"
    ),
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend-repo", number: 123 }
  );

  let result = await evaluateChangelogRequirement({
    changedFiles: ["src/app/page.tsx"],
    labels: [],
    body: "",
    validateReference: async () => ({ ok: true, reason: "unused" }),
  });
  assert.equal(result.ok, false, "falha sem changelog e sem no-changelog");

  result = await evaluateChangelogRequirement({
    changedFiles: ["src/app/page.tsx"],
    labels: ["no-changelog"],
    body: "Motivo do no-changelog: refactor interno sem mudanca perceptivel ao usuario.",
    validateReference: async () => ({ ok: false, reason: "unused" }),
  });
  assert.equal(result.ok, true, "passa com no-changelog justificado");

  result = await evaluateChangelogRequirement({
    changedFiles: ["src/app/page.tsx"],
    labels: ["no-changelog"],
    body: "",
    validateReference: async () => ({ ok: true, reason: "unused" }),
  });
  assert.equal(result.ok, false, "falha com no-changelog sem justificativa");

  result = await evaluateChangelogRequirement({
    changedFiles: ["src/app/page.tsx"],
    labels: [],
    body: "Changelog PR: #200",
    validateReference: async (reference) => {
      assert.deepEqual(reference, {
        repo: "v4nders0nr0cha-cmd/fut7pro-backend",
        number: 200,
      });
      return { ok: true, reason: "validado" };
    },
  });
  assert.equal(result.ok, true, "passa com PR backend validado");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 201 },
    {
      fetchPr: async () => ({
        number: 201,
        state: "open",
        merged_at: null,
        base: { sha: "base" },
        head: { sha: "head" },
      }),
      fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
      fetchSource: publishedSource,
    }
  );
  assert.equal(result.ok, true, "valida PR que adiciona uma versão publicada");

  for (const [name, changedSource] of [
    ["título", replaceInOldVersion('title: "Título"', 'title: "Revisado"')],
    [
      "data",
      replaceInOldVersion(
        'releaseDate: "2026-11-11T20:20:32.000Z"',
        'releaseDate: "2030-01-01T00:00:00.000Z"'
      ),
    ],
    ["descrição", replaceInOldVersion('description: "Descrição"', 'description: "Alterada"')],
  ]) {
    result = await validateBackendChangelogPr(
      { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 201 },
      {
        fetchPr: async () => ({
          number: 201,
          state: "open",
          base: { sha: "base" },
          head: { sha: "head" },
        }),
        fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
        fetchSource: async (sha) => (sha === "base" ? source(["old"]) : changedSource),
      }
    );
    assert.equal(result.ok, false, `nova versão não permite mudar ${name} antigo`);
  }

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 201 },
    {
      fetchPr: async () => ({
        number: 201,
        state: "open",
        base: { sha: "base" },
        head: { sha: "head" },
      }),
      fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
      fetchSource: async () => source(["old"]),
    }
  );
  assert.equal(result.ok, false, "rejeita PR que só altera registro pendente");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 201 },
    {
      fetchPr: async () => ({
        number: 201,
        state: "open",
        base: { sha: "base" },
        head: { sha: "head" },
      }),
      fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
      fetchSource: async (sha) =>
        sha === "base"
          ? source(["old"])
          : source(["old"]).replace('title: "Título"', 'title: "Título revisado"'),
    }
  );
  assert.equal(result.ok, false, "correção editorial antiga não documenta entrega web nova");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 201 },
    {
      fetchPr: async () => ({
        number: 201,
        state: "open",
        base: { sha: "base" },
        head: { sha: "head" },
      }),
      fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
      fetchSource: async (sha) =>
        sha === "base" ? source(["old"]) : source(["old"]) + '\n// version: "new"',
    }
  );
  assert.equal(result.ok, false, "comentário com versão não conta como publicação");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 202 },
    {
      fetchPr: async () => ({
        number: 202,
        state: "closed",
        merged_at: "2026-08-25T20:37:22Z",
      }),
      fetchFilesPage: async () => [{ filename: "src/app.module.ts" }],
    }
  );
  assert.equal(result.ok, false, "falha se PR backend nao altera a fonte canonica");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 203 },
    {
      fetchPr: async () => ({ number: 203, state: "closed", merged_at: null }),
      fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
    }
  );
  assert.equal(result.ok, false, "falha se PR backend estiver fechado sem merge");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 204 },
    {
      fetchPr: async () => ({
        number: 204,
        state: "open",
        merged_at: null,
        base: { sha: "base" },
        head: { sha: "head" },
      }),
      fetchSource: publishedSource,
      fetchFilesPage: async (_reference, page) => {
        if (page === 1) {
          return Array.from({ length: 100 }, (_, index) => ({
            filename: `src/large-change/file-${index}.ts`,
          }));
        }
        return [{ filename: "src/modules/changelog/changelog.entries.ts" }];
      },
    }
  );
  assert.equal(result.ok, true, "valida changelog encontrado na segunda pagina de arquivos");

  assert.deepEqual(parseChangelogPrReference("Changelog PR: backend#129"), {
    repo: "v4nders0nr0cha-cmd/fut7pro-backend",
    number: 129,
  });

  const editorialCases = [
    ["dispensa editorial válida", {}, true],
    ["label ausente", { labels: [] }, false],
    ["classificação não marcada", { body: editorialBody().replace("[x]", "[ ]") }, false],
    [
      "justificativa ausente",
      { body: `${editorialDeclaration}\nMotivo do editorial-no-changelog:   \n${confirmation()}` },
      false,
    ],
    [
      "justificativa com menos de 40 caracteres úteis",
      {
        body: `${editorialDeclaration}\nMotivo do editorial-no-changelog: ${"a".repeat(39)}\n${confirmation()}`,
      },
      false,
    ],
    [
      "justificativa longa sem palavras úteis",
      {
        body: `${editorialDeclaration}\nMotivo do editorial-no-changelog: ${"a".repeat(40)}\n${confirmation()}`,
      },
      false,
    ],
    [
      "confirmação ausente",
      { body: `${editorialDeclaration}\nMotivo do editorial-no-changelog: ${editorialReason}` },
      false,
    ],
    ["SHA ausente", { editorialOwner: { ...editorialOwner, headSha: "" } }, false],
    ["SHA incompleto", { body: editorialBody("a".repeat(39)) }, false],
    ["SHA inválido", { body: editorialBody("g".repeat(40)) }, false],
    ["SHA antigo", { editorialOwner: { ...editorialOwner, headSha: "b".repeat(40) } }, false],
    [
      "proprietário divergente",
      { editorialOwner: { ...editorialOwner, repositoryOwner: "outro" } },
      false,
    ],
    [
      "autor não autorizado",
      { editorialOwner: { ...editorialOwner, authorLogin: "outro" } },
      false,
    ],
    [
      "ator não autorizado",
      { editorialOwner: { ...editorialOwner, eventActorLogin: "outro" } },
      false,
    ],
    ["autor bot", { editorialOwner: { ...editorialOwner, authorType: "Bot" } }, false],
    ["ator bot", { editorialOwner: { ...editorialOwner, eventActorType: "Bot" } }, false],
    ["labels contraditórias", { labels: ["editorial-no-changelog", "no-changelog"] }, false],
    [
      "funcionalidade contraditória",
      { body: `${editorialBody()}\n- [x] Funcionalidade nova ou melhoria funcional.` },
      false,
    ],
    [
      "declaração funcional anterior contraditória",
      { body: `${editorialBody()}\n- [x] Funcionalidade ou melhoria visível` },
      false,
    ],
    [
      "publicação contraditória",
      { body: `${editorialBody()}\n- [x] Publicação coordenada com changelog do backend.` },
      false,
    ],
    ["referência contraditória", { body: `${editorialBody()}\nChangelog PR: #200` }, false],
    [
      "changelog atualizado contradiz dispensa",
      { body: `${editorialBody()}\n- [x] Central de Atualizações atualizada` },
      false,
    ],
  ];
  for (const [name, options, expected] of editorialCases) {
    const evaluated = await evaluateEditorial(options);
    assert.equal(evaluated.ok, expected, name);
  }

  result = await evaluateEditorial({
    labels: ["no-changelog"],
    body: "Motivo do no-changelog: ajuste interno de testes sem mudança visível.",
  });
  assert.equal(result.ok, true, "preserva no-changelog técnico justificado");
  result = await evaluateEditorial({ labels: ["no-changelog"], body: "" });
  assert.equal(result.ok, false, "rejeita no-changelog sem justificativa");
  result = await evaluateEditorial({
    labels: ["no-changelog"],
    body: "Motivo do no-changelog:\n\n## Validação\n- [x] Testes",
  });
  assert.equal(result.ok, false, "seção seguinte não serve de justificativa técnica");
  result = await evaluateEditorial({
    labels: ["no-changelog"],
    body: "Motivo do no-changelog: ajuste interno de testes sem mudança visível.\n- [x] Funcionalidade nova ou melhoria funcional.",
  });
  assert.equal(result.ok, false, "não aplica no-changelog a funcionalidade declarada");
  result = await evaluateEditorial({ labels: [], body: "" });
  assert.equal(result.ok, false, "rejeita ausência de qualquer classificação válida");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 205 },
    {
      fetchPr: async () => ({
        number: 205,
        state: "closed",
        merged_at: "2026-10-20T00:00:00Z",
        base: { sha: "base" },
        head: { sha: "head" },
      }),
      fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
      fetchSource: publishedSource,
    }
  );
  assert.equal(result.ok, true, "preserva PR de changelog já integrado");
  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/outro-repo", number: 206 },
    {
      fetchPr: async () => {
        throw new Error("não deveria consultar repositório incorreto");
      },
    }
  );
  assert.equal(result.ok, false, "rejeita repositório incorreto");

  console.log(`Changelog Required web: ${editorialCases.length + 23} verificações aprovadas`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
