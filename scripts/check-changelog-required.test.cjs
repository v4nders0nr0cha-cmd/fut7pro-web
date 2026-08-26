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
      fetchPr: async () => ({ number: 201, merged_at: null }),
      fetchFiles: async () => [{ filename: "src/modules/changelog/changelog.entries.ts" }],
    }
  );
  assert.equal(result.ok, true, "valida PR existente que altera a fonte canonica");

  result = await validateBackendChangelogPr(
    { repo: "v4nders0nr0cha-cmd/fut7pro-backend", number: 202 },
    {
      fetchPr: async () => ({ number: 202, merged_at: "2026-08-25T20:37:22Z" }),
      fetchFiles: async () => [{ filename: "src/app.module.ts" }],
    }
  );
  assert.equal(result.ok, false, "falha se PR backend nao altera a fonte canonica");

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
