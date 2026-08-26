const assert = require("assert/strict");
const {
  evaluateChangelogRequirement,
  parseChangelogPrReference,
  validateBackendChangelogPr,
} = require("./check-changelog-required.cjs");

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
      fetchPr: async () => ({ number: 201, state: "open", merged_at: null }),
      fetchFilesPage: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
    }
  );
  assert.equal(result.ok, true, "valida PR existente que altera a fonte canonica");

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
      fetchPr: async () => ({ number: 204, state: "open", merged_at: null }),
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

  console.log("Changelog Required web tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
