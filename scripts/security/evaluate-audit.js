const fs = require("node:fs");
const { evaluateAudit, validateLockBinding } = require("./audit-policy");

const input = process.argv[2] || "security-audit.json";
const output = process.argv[3] || "security-triage.json";
try {
  const audit = JSON.parse(fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
  const exceptions = JSON.parse(fs.readFileSync("security/sca-allowlist.json", "utf8"));
  const result = evaluateAudit(audit, exceptions);
  result.lockfileSha256 = validateLockBinding(exceptions, fs.readFileSync("pnpm-lock.yaml"));
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
  const temporary = result.findings.filter((f) => f.decision === "temporary-exception");
  const message = `SCA: ${result.blocked.length} blocked, ${temporary.length} temporary exceptions, ${result.staleExceptions.length} stale exceptions.`;
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Dependency risk assessment\n\n${message}\n\nCritical findings always block. High findings require an exact, evidenced, unexpired exception. A passed policy does not mean the audit has no findings.\n`
    );
  }
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  fs.writeFileSync(output, JSON.stringify({ passed: false, error: error.message }, null, 2) + "\n");
  console.error(`SCA failed: ${error.message}`);
  process.exitCode = 1;
}
