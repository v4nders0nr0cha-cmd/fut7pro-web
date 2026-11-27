const { createHash } = require("node:crypto");
const severityOrder = ["info", "low", "moderate", "high", "critical"];

function validateExceptions(payload, now = new Date()) {
  if (!payload || !Array.isArray(payload.exceptions))
    throw new Error("exceptions must be an array");
  const today = Date.parse(now.toISOString().slice(0, 10));
  const keys = new Set();
  for (const entry of payload.exceptions) {
    if (typeof entry.lockfileSha256 !== "string" || !/^[a-f0-9]{64}$/.test(entry.lockfileSha256))
      throw new Error("Exception requires the reviewed lockfile fingerprint");
    for (const field of ["advisoryId", "packageName", "owner", "justification", "scope"]) {
      if (typeof entry?.[field] !== "string" || !entry[field].trim())
        throw new Error(`Exception requires ${field}`);
    }
    if (!/^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(entry.advisoryId))
      throw new Error("Exception requires a specific GHSA identifier");
    if (
      !Array.isArray(entry.versions) ||
      !entry.versions.length ||
      entry.versions.some(
        (v) => typeof v !== "string" || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(v)
      )
    )
      throw new Error("Exception requires exact versions, without ranges");
    if (
      !Array.isArray(entry.dependencyPaths) ||
      !entry.dependencyPaths.length ||
      entry.dependencyPaths.some(
        (p) => typeof p !== "string" || !/^\.>[a-zA-Z0-9@/_.>+-]+$/.test(p)
      )
    )
      throw new Error("Exception requires exact dependency paths, without wildcards");
    if (
      !Array.isArray(entry.evidence) ||
      !entry.evidence.length ||
      entry.evidence.some((e) => typeof e !== "string" || !e.trim())
    )
      throw new Error("Exception requires source evidence");
    const date = entry.expiresOn;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new Error("Exception requires expiresOn in YYYY-MM-DD format");
    const expires = Date.parse(`${date}T00:00:00.000Z`);
    if (
      !Number.isFinite(expires) ||
      new Date(expires).toISOString().slice(0, 10) !== date ||
      expires < today ||
      expires - today > 30 * 86400000
    )
      throw new Error("Exception expiry must be a valid date within 30 days");
    for (const version of entry.versions)
      for (const path of entry.dependencyPaths) {
        if (!path.endsWith(`>${entry.packageName}`))
          throw new Error("Exception path must end with its package");
        const key = [entry.advisoryId, entry.packageName, version, path].join("|");
        if (keys.has(key)) throw new Error("Duplicate exception");
        keys.add(key);
      }
  }
  return payload.exceptions;
}

function normalizeAudit(report) {
  const counts = report?.metadata?.vulnerabilities;
  if (
    report?.error ||
    !counts ||
    !report.advisories ||
    Array.isArray(report.advisories) ||
    typeof report.advisories !== "object" ||
    !Number.isInteger(counts.high) ||
    !Number.isInteger(counts.critical) ||
    counts.high < 0 ||
    counts.critical < 0
  )
    throw new Error("Audit unavailable or unsupported: refusing to approve missing evidence");
  if (report.muted?.length) throw new Error("Muted audit findings are not permitted");
  const findings = new Map();
  for (const advisory of Object.values(report.advisories)) {
    const severity = advisory.severity;
    if (
      !severityOrder.includes(severity) ||
      !advisory.module_name ||
      !advisory.id ||
      !Array.isArray(advisory.findings) ||
      !advisory.findings.length
    )
      throw new Error("Malformed audit advisory");
    for (const affected of advisory.findings) {
      if (!affected.version || !Array.isArray(affected.paths) || !affected.paths.length)
        throw new Error("Audit finding is missing version or paths");
      for (const path of affected.paths) {
        if (typeof path !== "string" || !path.startsWith(".>"))
          throw new Error("Unsupported dependency path");
        const finding = {
          advisoryId: advisory.github_advisory_id || `npm:${advisory.id}`,
          packageName: advisory.module_name,
          version: affected.version,
          dependencyPath: path,
          severity,
          title: advisory.title,
          patchedVersions: advisory.patched_versions,
          url: advisory.url,
        };
        const key = [finding.advisoryId, finding.packageName, finding.version, path].join("|");
        const prior = findings.get(key);
        if (!prior || severityOrder.indexOf(severity) > severityOrder.indexOf(prior.severity))
          findings.set(key, finding);
      }
    }
  }
  const result = [...findings.values()].sort((a, b) =>
    [a.packageName, a.advisoryId, a.version, a.dependencyPath]
      .join("|")
      .localeCompare([b.packageName, b.advisoryId, b.version, b.dependencyPath].join("|"))
  );
  for (const severity of ["high", "critical"])
    if (counts[severity] > 0 && !result.some((f) => f.severity === severity))
      throw new Error(`Audit reports ${severity} findings without their details`);
  return result;
}

function evaluateAudit(report, payload, now = new Date()) {
  const exceptions = validateExceptions(payload, now);
  const used = new Set();
  const findings = normalizeAudit(report).map((finding) => {
    if (!["high", "critical"].includes(finding.severity))
      return { ...finding, decision: "informational" };
    const index = exceptions.findIndex(
      (e) =>
        e.advisoryId === finding.advisoryId &&
        e.packageName === finding.packageName &&
        e.versions.includes(finding.version) &&
        e.dependencyPaths.includes(finding.dependencyPath)
    );
    if (finding.severity === "high" && index !== -1) {
      used.add(index);
      return { ...finding, decision: "temporary-exception", exception: exceptions[index] };
    }
    return { ...finding, decision: "block" };
  });
  const staleExceptions = exceptions.filter((_entry, i) => !used.has(i));
  const blocked = findings.filter((f) => f.decision === "block");
  return {
    passed: blocked.length === 0 && staleExceptions.length === 0,
    checkedOn: now.toISOString(),
    metadata: report.metadata,
    findings,
    blocked,
    staleExceptions,
  };
}

function validateLockBinding(payload, lockfile) {
  const canonical = lockfile.toString().replace(/\r\n/g, "\n");
  const fingerprint = createHash("sha256").update(canonical).digest("hex");
  if (payload.exceptions.some((entry) => entry.lockfileSha256 !== fingerprint))
    throw new Error("The dependency graph changed: review temporary exceptions for this lockfile");
  return fingerprint;
}

module.exports = { validateExceptions, normalizeAudit, evaluateAudit, validateLockBinding };
