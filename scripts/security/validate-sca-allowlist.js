const fs = require("fs");
const path = require("path");

const allowlistPath = path.resolve(process.cwd(), "security", "sca-allowlist.json");
const maxExceptionDays = 30;

function fail(message) {
  console.error(`SCA allowlist invalida: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(allowlistPath)) {
  fail(`arquivo nao encontrado em ${allowlistPath}`);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
} catch (error) {
  fail(`json invalido: ${error.message}`);
}

const entries = Array.isArray(payload?.exceptions) ? payload.exceptions : null;
if (!entries) {
  fail("campo 'exceptions' deve ser um array.");
}

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

for (const [index, entry] of entries.entries()) {
  const prefix = `exceptions[${index}]`;
  const advisoryId = String(entry?.advisoryId || "").trim();
  const packageName = String(entry?.packageName || "").trim();
  const owner = String(entry?.owner || "").trim();
  const justification = String(entry?.justification || "").trim();
  const expiresOnRaw = String(entry?.expiresOn || "").trim();

  if (!advisoryId) fail(`${prefix}.advisoryId obrigatorio.`);
  if (!packageName) fail(`${prefix}.packageName obrigatorio.`);
  if (!owner) fail(`${prefix}.owner obrigatorio.`);
  if (!justification) fail(`${prefix}.justification obrigatorio.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresOnRaw)) {
    fail(`${prefix}.expiresOn deve usar formato YYYY-MM-DD.`);
  }

  const expiresOn = new Date(`${expiresOnRaw}T00:00:00.000Z`);
  if (Number.isNaN(expiresOn.getTime())) {
    fail(`${prefix}.expiresOn invalido.`);
  }

  const diffDays = Math.round((expiresOn.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) fail(`${prefix}.expiresOn expirado.`);
  if (diffDays > maxExceptionDays) {
    fail(`${prefix}.expiresOn excede janela maxima de ${maxExceptionDays} dias.`);
  }
}

console.log(`SCA allowlist valida (${entries.length} excecao(oes)).`);
