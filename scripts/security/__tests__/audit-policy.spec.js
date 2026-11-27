const {
  normalizeAudit,
  evaluateAudit,
  validateExceptions,
  validateLockBinding,
} = require("../audit-policy");
const lockfileSha256 = require("node:crypto")
  .createHash("sha256")
  .update("reviewed\nlockfile\n")
  .digest("hex");
const now = new Date("2026-11-27T12:00:00Z");
function report(severity = "high", path = ".>parent>package", version = "1.2.3") {
  return {
    metadata: {
      vulnerabilities: {
        high: severity === "high" ? 1 : 0,
        critical: severity === "critical" ? 1 : 0,
      },
    },
    advisories: {
      1: {
        id: 1,
        github_advisory_id: "GHSA-abcd-1234-efgh",
        module_name: "package",
        severity,
        findings: [{ version, paths: [path] }],
      },
    },
    muted: [],
  };
}
function exception() {
  return {
    lockfileSha256,
    advisoryId: "GHSA-abcd-1234-efgh",
    packageName: "package",
    versions: ["1.2.3"],
    dependencyPaths: [".>parent>package"],
    owner: "Security",
    justification: "Reviewed current call sites",
    scope: "trusted-config",
    evidence: ["source.ts"],
    expiresOn: "2026-12-11",
  };
}
describe("dependency risk policy", () => {
  it("requires another review after a parent or any dependency changes", () => {
    const payload = { exceptions: [exception()] };
    expect(validateLockBinding(payload, "reviewed\nlockfile\n")).toBe(lockfileSha256);
    expect(validateLockBinding(payload, "reviewed\r\nlockfile\r\n")).toBe(lockfileSha256);
    expect(() => validateLockBinding(payload, "changed dependency graph")).toThrow();
  });
  it("blocks an unreviewed high even if it is the only finding", () => {
    expect(evaluateAudit(report(), { exceptions: [] }, now).passed).toBe(false);
  });
  it("never exempts a critical finding", () => {
    expect(
      evaluateAudit(report("critical"), { exceptions: [exception()] }, now).blocked
    ).toHaveLength(1);
  });
  it("matches the advisory, version and path exactly", () => {
    expect(evaluateAudit(report(), { exceptions: [exception()] }, now).passed).toBe(true);
    expect(
      evaluateAudit(report("high", ".>other>package"), { exceptions: [exception()] }, now).passed
    ).toBe(false);
    expect(
      evaluateAudit(report("high", ".>parent>package", "1.2.4"), { exceptions: [exception()] }, now)
        .passed
    ).toBe(false);
    const input = report();
    input.advisories[1].github_advisory_id = "GHSA-abcd-1234-ijkl";
    expect(evaluateAudit(input, { exceptions: [exception()] }, now).passed).toBe(false);
  });
  it("deduplicates paths without hiding a different installed version", () => {
    const input = report();
    input.advisories[2] = { ...input.advisories[1], id: 2 };
    input.advisories[3] = {
      ...input.advisories[1],
      id: 3,
      findings: [{ version: "1.2.4", paths: [".>parent>package"] }],
    };
    expect(normalizeAudit(input)).toHaveLength(2);
  });
  it("keeps the highest severity when duplicates disagree", () => {
    const input = report("moderate");
    input.advisories[2] = { ...input.advisories[1], id: 2, severity: "critical" };
    input.metadata.vulnerabilities.critical = 1;
    expect(evaluateAudit(input, { exceptions: [] }, now).blocked[0].severity).toBe("critical");
  });
  it("does not block by raw moderate or low counts", () => {
    expect(evaluateAudit(report("moderate"), { exceptions: [] }, now).passed).toBe(true);
    expect(evaluateAudit(report("low"), { exceptions: [] }, now).passed).toBe(true);
  });
  it.each(["2026-11-26", "2026-12-28", "2026-02-31", "invalid"])(
    "rejects invalid expiry %s",
    (expiresOn) => {
      expect(() =>
        validateExceptions({ exceptions: [{ ...exception(), expiresOn }] }, now)
      ).toThrow();
    }
  );
  it("rejects ranges, wildcard paths, missing evidence and duplicate exceptions", () => {
    expect(() =>
      validateExceptions({ exceptions: [{ ...exception(), versions: ["^1.2.3"] }] }, now)
    ).toThrow();
    expect(() =>
      validateExceptions(
        { exceptions: [{ ...exception(), dependencyPaths: [".>*>package"] }] },
        now
      )
    ).toThrow();
    expect(() =>
      validateExceptions({ exceptions: [{ ...exception(), evidence: [] }] }, now)
    ).toThrow();
    expect(() => validateExceptions({ exceptions: [exception(), exception()] }, now)).toThrow();
  });
  it("rejects stale exceptions after the package is fixed", () => {
    const input = report();
    input.advisories = {};
    input.metadata.vulnerabilities.high = 0;
    expect(evaluateAudit(input, { exceptions: [exception()] }, now).passed).toBe(false);
  });
  it("fails closed for errors, missing details, muted results and unsupported formats", () => {
    expect(() => normalizeAudit({ error: { code: "REGISTRY_UNAVAILABLE" } })).toThrow();
    expect(() => normalizeAudit({ ...report(), advisories: {} })).toThrow();
    expect(() => normalizeAudit({ ...report(), muted: [1] })).toThrow();
    expect(() => normalizeAudit({ ...report(), advisories: [] })).toThrow();
    const input = report();
    input.advisories[1].findings = [];
    expect(() => normalizeAudit(input)).toThrow();
  });
});
