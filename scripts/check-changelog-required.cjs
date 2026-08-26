const fs = require("fs");

const BACKEND_CHANGELOG_REPO =
  process.env.BACKEND_CHANGELOG_REPO || "v4nders0nr0cha-cmd/fut7pro-backend";
const BACKEND_CHANGELOG_PATH =
  process.env.BACKEND_CHANGELOG_PATH || "src/modules/changelog/changelog.entries.ts";

function parseLabels(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((label) => String(label).trim()).filter(Boolean);
    }
  } catch (_error) {
    return String(raw)
      .split(/[\n,]/)
      .map((label) => label.trim())
      .filter(Boolean);
  }
  return [];
}

function parseChangedFiles(raw) {
  return String(raw || "")
    .split(/\r?\n/)
    .map((file) => file.trim().replace(/\\/g, "/"))
    .filter(Boolean);
}

function hasNoChangelogJustification(body) {
  return /motivo\s+do\s+no-changelog\s*:\s*\S.{10,}/i.test(String(body || ""));
}

function parseChangelogPrReference(body, defaultRepo = BACKEND_CHANGELOG_REPO) {
  const source = String(body || "");
  const line = source.match(/^Changelog PR:\s*(.+)$/im)?.[1]?.trim();
  if (!line) return null;

  const urlMatch = line.match(/github\.com\/([^/\s]+\/[^/\s]+)\/pull\/(\d+)/i);
  if (urlMatch) {
    return { repo: urlMatch[1], number: Number(urlMatch[2]) };
  }

  const shorthandMatch = line.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)?#(\d+)\b/);
  if (shorthandMatch) {
    return { repo: shorthandMatch[1] || defaultRepo, number: Number(shorthandMatch[2]) };
  }

  const backendAliasMatch = line.match(/^backend#(\d+)\b/i);
  if (backendAliasMatch) {
    return { repo: defaultRepo, number: Number(backendAliasMatch[1]) };
  }

  return null;
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} ao consultar ${url}`);
  }

  return response.json();
}

async function validateBackendChangelogPr(reference, options = {}) {
  if (!reference || !Number.isInteger(reference.number) || reference.number <= 0) {
    return { ok: false, reason: "Changelog PR invalido ou ausente." };
  }

  const repo = reference.repo;
  const token = options.token ?? process.env.GITHUB_TOKEN;
  const expectedRepo = options.expectedRepo ?? BACKEND_CHANGELOG_REPO;
  const expectedPath = options.expectedPath ?? BACKEND_CHANGELOG_PATH;
  const fetchPr =
    options.fetchPr ||
    ((ref) => fetchJson(`https://api.github.com/repos/${ref.repo}/pulls/${ref.number}`, token));
  const fetchFiles =
    options.fetchFiles ||
    ((ref) =>
      fetchJson(
        `https://api.github.com/repos/${ref.repo}/pulls/${ref.number}/files?per_page=100`,
        token
      ));

  if (repo.toLowerCase() !== expectedRepo.toLowerCase()) {
    return {
      ok: false,
      reason: `Changelog PR precisa apontar para ${expectedRepo}. Recebido: ${repo}.`,
    };
  }

  try {
    const [pr, files] = await Promise.all([fetchPr(reference), fetchFiles(reference)]);
    const touchesCanonicalSource = Array.isArray(files)
      ? files.some((file) => String(file.filename || "").replace(/\\/g, "/") === expectedPath)
      : false;

    if (!pr?.number || !touchesCanonicalSource) {
      return {
        ok: false,
        reason: `Changelog PR #${reference.number} nao altera ${expectedPath}.`,
      };
    }

    return {
      ok: true,
      reason: pr.merged_at
        ? `Changelog PR #${reference.number} ja foi mergeado e altera a fonte canonica.`
        : `Changelog PR #${reference.number} existe e altera a fonte canonica.`,
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Falha ao validar Changelog PR.",
    };
  }
}

async function evaluateChangelogRequirement({
  changedFiles,
  labels,
  body,
  validateReference = validateBackendChangelogPr,
}) {
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  const hasNoChangelog = normalizedLabels.includes("no-changelog");

  if (hasNoChangelog) {
    if (hasNoChangelogJustification(body)) {
      return { ok: true, reason: "no-changelog aplicado com justificativa." };
    }
    return {
      ok: false,
      reason: "PR tem label no-changelog, mas nao informa 'Motivo do no-changelog: ...'.",
    };
  }

  const reference = parseChangelogPrReference(body);
  if (!reference) {
    return {
      ok: false,
      reason:
        "Informe um Changelog PR valido do backend ou aplique no-changelog com justificativa.",
    };
  }

  return validateReference(reference, { changedFiles });
}

function readChangedFilesFromDisk() {
  const filePath = process.env.CHANGED_FILES_PATH;
  if (filePath && fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }
  return process.env.CHANGED_FILES || "";
}

async function main() {
  const result = await evaluateChangelogRequirement({
    changedFiles: parseChangedFiles(readChangedFilesFromDisk()),
    labels: parseLabels(process.env.PR_LABELS_JSON || process.env.PR_LABELS || ""),
    body: process.env.PR_BODY || "",
  });

  if (!result.ok) {
    console.error(result.reason);
    process.exit(1);
  }

  console.log(result.reason);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

module.exports = {
  evaluateChangelogRequirement,
  hasNoChangelogJustification,
  parseChangedFiles,
  parseChangelogPrReference,
  parseLabels,
  validateBackendChangelogPr,
};
