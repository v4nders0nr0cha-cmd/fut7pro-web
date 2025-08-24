import fs from "node:fs";

const matrix = JSON.parse(fs.readFileSync("scripts/ci/env-matrix.json", "utf8"));
const repo = process.env.ENV_GROUP; // "web", "backend" ou "site"

if (!repo || !matrix[repo]) {
  console.error("Defina ENV_GROUP como web, backend ou site");
  process.exit(1);
}

const req = matrix[repo].required;
const missing = req.filter(v => !process.env[v] || String(process.env[v]).trim() === "");

if (missing.length) {
  console.error(`[ENV][${repo}] faltando: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`[ENV][${repo}] OK`);
