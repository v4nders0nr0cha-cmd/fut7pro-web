const fs = require("fs");

const BACKEND_CHANGELOG_REPO =
  process.env.BACKEND_CHANGELOG_REPO || "v4nders0nr0cha-cmd/fut7pro-backend";
const BACKEND_CHANGELOG_PATH =
  process.env.BACKEND_CHANGELOG_PATH || "src/modules/changelog/changelog.entries.ts";
const EDITORIAL_LABEL = "editorial-no-changelog";

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
  const reason = String(body || "")
    .match(/^Motivo do no-changelog:[ \t]*(.*)$/im)?.[1]
    ?.trim();
  return Boolean(reason && reason.length >= 11);
}

function hasEditorialDeclaration(body) {
  return /^\s*-\s*\[[xX]\]\s*Correção exclusivamente editorial, sem mudança funcional e sem anúncio de produto\.\s*$/im.test(
    String(body || "")
  );
}

function hasFunctionalDeclaration(body) {
  return /^\s*-\s*\[[xX]\]\s*(?:Funcionalidade nova ou melhoria funcional|Funcionalidade ou melhoria visível)\.?\s*$/im.test(
    String(body || "")
  );
}

function hasCoordinatedPublicationDeclaration(body) {
  return /^\s*-\s*\[[xX]\]\s*Publicação coordenada com changelog do backend\.\s*$/im.test(
    String(body || "")
  );
}

function hasChangelogUpdatedDeclaration(body) {
  return /^\s*-\s*\[[xX]\]\s*Central de Atualizações atualizada\s*$/im.test(String(body || ""));
}

function hasChangelogReferenceLine(body) {
  return /^Changelog PR:[ \t]*\S[^\r\n]*$/im.test(String(body || ""));
}

function hasEditorialJustification(body) {
  const reason = String(body || "").match(/^Motivo do editorial-no-changelog:[ \t]*(.*)$/im)?.[1];
  if (!reason || /^(?:todo|pendente|a definir|n\/a)$/i.test(reason.trim())) return false;
  const words = reason.match(/[\p{L}\p{N}]+/gu) || [];
  return (
    words.join("").length >= 40 &&
    words.length >= 5 &&
    new Set(words.map((word) => word.toLowerCase())).size >= 4
  );
}

function hasOwnerEditorialConfirmation(body, owner = {}) {
  const {
    headSha,
    authorLogin,
    authorType,
    eventActorLogin,
    eventActorType,
    repositoryOwner,
    authorizedOwner,
  } = owner;
  if (
    !/^[0-9a-f]{40}$/i.test(headSha || "") ||
    !authorizedOwner ||
    !repositoryOwner ||
    authorType !== "User" ||
    eventActorType !== "User" ||
    !authorLogin ||
    !eventActorLogin ||
    repositoryOwner.toLowerCase() !== authorizedOwner.toLowerCase() ||
    authorLogin.toLowerCase() !== authorizedOwner.toLowerCase() ||
    eventActorLogin.toLowerCase() !== authorizedOwner.toLowerCase()
  ) {
    return false;
  }

  const confirmation = String(body || "").match(
    /^Confirmação editorial do responsável:[ \t]*@([A-Za-z0-9-]+)[ \t]+revisou o diff do commit[ \t]+([0-9a-f]{40})[ \t]+e confirma que não há mudanças funcionais\.[ \t]*$/im
  );
  return Boolean(
    confirmation &&
      confirmation[1].toLowerCase() === authorizedOwner.toLowerCase() &&
      confirmation[2].toLowerCase() === headSha.toLowerCase()
  );
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
  const fetchFilesPage =
    options.fetchFilesPage ||
    ((ref, page) =>
      fetchJson(
        `https://api.github.com/repos/${ref.repo}/pulls/${ref.number}/files?per_page=100&page=${page}`,
        token
      ));

  if (repo.toLowerCase() !== expectedRepo.toLowerCase()) {
    return {
      ok: false,
      reason: `Changelog PR precisa apontar para ${expectedRepo}. Recebido: ${repo}.`,
    };
  }

  try {
    const pr = await fetchPr(reference);
    const isUsablePr = pr?.state === "open" || Boolean(pr?.merged_at);

    if (!pr?.number || !isUsablePr) {
      return {
        ok: false,
        reason: `Changelog PR #${reference.number} precisa estar aberto ou mergeado.`,
      };
    }

    let touchesCanonicalSource = false;
    for (let page = 1; page <= 10; page += 1) {
      const files = await fetchFilesPage(reference, page);
      const pageFiles = Array.isArray(files) ? files : [];
      touchesCanonicalSource = pageFiles.some(
        (file) => String(file.filename || "").replace(/\\/g, "/") === expectedPath
      );
      if (touchesCanonicalSource || pageFiles.length < 100) {
        break;
      }
    }

    if (!touchesCanonicalSource) {
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
  editorialOwner,
}) {
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  const hasNoChangelog = normalizedLabels.includes("no-changelog");
  const hasEditorialNoChangelog = normalizedLabels.includes(EDITORIAL_LABEL);
  const editorialDeclared = hasEditorialDeclaration(body);

  if (hasEditorialNoChangelog) {
    if (
      hasNoChangelog ||
      hasFunctionalDeclaration(body) ||
      hasCoordinatedPublicationDeclaration(body) ||
      hasChangelogUpdatedDeclaration(body) ||
      hasChangelogReferenceLine(body)
    ) {
      return { ok: false, reason: "Classificações de changelog contraditórias no PR." };
    }
    if (!editorialDeclared) {
      return {
        ok: false,
        reason: "Marque a declaração de correção exclusivamente editorial no corpo do PR.",
      };
    }
    if (!hasEditorialJustification(body)) {
      return {
        ok: false,
        reason: "Informe 'Motivo do editorial-no-changelog:' com ao menos 40 caracteres úteis.",
      };
    }
    if (!hasOwnerEditorialConfirmation(body, editorialOwner)) {
      return {
        ok: false,
        reason: "A dispensa editorial exige confirmação do responsável com o SHA atual do PR.",
      };
    }
    return { ok: true, reason: "Dispensa editorial justificada e confirmada pelo responsável." };
  }

  if (editorialDeclared) {
    return { ok: false, reason: `A declaração editorial exige a label ${EDITORIAL_LABEL}.` };
  }

  if (hasNoChangelog) {
    if (hasFunctionalDeclaration(body) || hasCoordinatedPublicationDeclaration(body)) {
      return { ok: false, reason: "Classificações de changelog contraditórias no PR." };
    }
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
    editorialOwner: {
      headSha: process.env.PR_HEAD_SHA,
      authorLogin: process.env.PR_AUTHOR_LOGIN,
      authorType: process.env.PR_AUTHOR_TYPE,
      eventActorLogin: process.env.PR_EVENT_ACTOR_LOGIN,
      eventActorType: process.env.PR_EVENT_ACTOR_TYPE,
      repositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
      authorizedOwner: process.env.AUTHORIZED_EDITORIAL_OWNER,
    },
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
  hasEditorialDeclaration,
  hasEditorialJustification,
  hasOwnerEditorialConfirmation,
  parseChangedFiles,
  parseChangelogPrReference,
  parseLabels,
  validateBackendChangelogPr,
};
