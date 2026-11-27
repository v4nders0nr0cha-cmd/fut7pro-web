const fs = require("node:fs");
const { validateExceptions } = require("./audit-policy");

try {
  const payload = JSON.parse(fs.readFileSync("security/sca-allowlist.json", "utf8"));
  const entries = validateExceptions(payload);
  console.log(`SCA allowlist valida (${entries.length} excecao(oes)).`);
} catch (error) {
  console.error(`SCA allowlist invalida: ${error.message}`);
  process.exitCode = 1;
}
