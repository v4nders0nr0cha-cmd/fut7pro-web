#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const BASELINE_PATH = path.join(__dirname, "native-browser-dialogs-baseline.json");
const DIALOG_PATTERN = /\b(?:window\.)?(alert|confirm|prompt)\s*\(/g;
const TARGET_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

function normalizePath(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function normalizeContext(value) {
  return value.replace(/\s+/g, " ").replace(/["'`]/g, '"').trim();
}

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "coverage") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    const ext = path.extname(entry.name);
    if (TARGET_EXTENSIONS.has(ext) && !entry.name.endsWith(".d.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function scanFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const lines = source.split(/\r?\n/);
  const findings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    DIALOG_PATTERN.lastIndex = 0;
    let match;
    while ((match = DIALOG_PATTERN.exec(line))) {
      const context = lines.slice(index, Math.min(index + 5, lines.length)).join(" ");
      findings.push({
        file: normalizePath(filePath),
        line: index + 1,
        type: match[1],
        context: normalizeContext(context),
      });
    }
  }

  return findings;
}

function fingerprint(finding) {
  return `${finding.file}::${finding.type}::${finding.context}`;
}

function scanSource() {
  return collectFiles(SRC_DIR).flatMap(scanFile);
}

function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return new Set();
  const data = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  return new Set((data.allowed || []).map(fingerprint));
}

function writeBaseline(findings) {
  const payload = {
    generatedAt: new Date().toISOString(),
    note: "Baseline temporario dos usos legados de alert/confirm/prompt. Novos usos devem falhar no lint.",
    allowed: findings
      .map((finding) => ({
        file: finding.file,
        type: finding.type,
        context: finding.context,
      }))
      .sort((a, b) => `${a.file}:${a.context}`.localeCompare(`${b.file}:${b.context}`)),
  };

  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
}

const findings = scanSource();

if (process.argv.includes("--update-baseline")) {
  writeBaseline(findings);
  console.log(`Baseline atualizado com ${findings.length} uso(s) legado(s).`);
  process.exit(0);
}

const baseline = readBaseline();
const newFindings = findings.filter((finding) => !baseline.has(fingerprint(finding)));

if (newFindings.length > 0) {
  console.error("\nUso novo de alert/confirm/prompt bloqueado pelo padrão Fut7Pro:\n");
  for (const finding of newFindings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.type}()`);
    console.error(`  ${finding.context}`);
  }
  console.error(
    "\nUse Fut7ConfirmDialog, Fut7DestructiveDialog, Fut7PromptDialog, Fut7InlineFeedback ou showFut7Toast().\n"
  );
  process.exit(1);
}

console.log(
  `Nenhum uso novo de alert/confirm/prompt encontrado. Legados em baseline: ${baseline.size}.`
);
