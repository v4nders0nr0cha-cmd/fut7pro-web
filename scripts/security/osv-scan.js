const fs = require("node:fs");

function collectPackages(roots) {
  if (!Array.isArray(roots) || !roots.length) throw new Error("Missing installed dependency tree");
  const packages = new Map();
  function visit(dependencies) {
    for (const [name, entry] of Object.entries(dependencies || {})) {
      const version = entry.version;
      if (typeof version !== "string" || !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(version))
        throw new Error(`Unsupported dependency version: ${name}`);
      packages.set(`${name}@${version}`, { package: { name, ecosystem: "npm" }, version });
      visit(entry.dependencies);
      visit(entry.optionalDependencies);
    }
  }
  for (const root of roots) {
    visit(root.dependencies);
    visit(root.optionalDependencies);
  }
  if (!packages.size) throw new Error("Installed production tree is empty");
  return [...packages.values()].sort((a, b) =>
    `${a.package.name}@${a.version}`.localeCompare(`${b.package.name}@${b.version}`)
  );
}

async function scan(packages, request = fetch) {
  const findings = [];
  for (let offset = 0; offset < packages.length; offset += 100) {
    const queries = packages.slice(offset, offset + 100);
    const reply = await request("https://api.osv.dev/v1/querybatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queries }),
      signal: AbortSignal.timeout(30000),
    });
    if (!reply.ok) throw new Error(`OSV returned HTTP ${reply.status}`);
    const body = await reply.json();
    if (!Array.isArray(body.results) || body.results.length !== queries.length)
      throw new Error("OSV returned an incomplete response");
    body.results.forEach((result, i) => {
      if (!result || (result.vulns !== undefined && !Array.isArray(result.vulns)))
        throw new Error("OSV returned an unsupported result");
      for (const vulnerability of result.vulns || []) {
        if (typeof vulnerability.id !== "string")
          throw new Error("OSV advisory is missing its identifier");
        findings.push({ ...queries[i], id: vulnerability.id, modified: vulnerability.modified });
      }
    });
  }
  return {
    status: "completed",
    source: "https://api.osv.dev/v1/querybatch",
    checkedOn: new Date().toISOString(),
    queriedPackages: packages.length,
    findings,
  };
}

if (require.main === module) {
  const input = process.argv[2] || "dependency-tree.json";
  const output = process.argv[3] || "security-osv.json";
  Promise.resolve()
    .then(async () => {
      const tree = JSON.parse(fs.readFileSync(input, "utf8").replace(/^\uFEFF/, ""));
      const result = await scan(collectPackages(tree));
      fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
      console.log(
        `OSV completed: ${result.queriedPackages} package versions, ${result.findings.length} findings. Additional informational source; not a Snyk execution.`
      );
    })
    .catch((error) => {
      fs.writeFileSync(
        output,
        JSON.stringify({ status: "unavailable", error: error.message }, null, 2) + "\n"
      );
      console.error(`OSV was not completed: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = { collectPackages, scan };
