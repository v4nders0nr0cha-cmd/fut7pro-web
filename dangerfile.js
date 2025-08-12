// PR Guard — protege a UI do Fut7Pro Web
// Regras:
// - Alterou UI? precisa label `ui-change` (estrutura) OU `ui-enhancement` (efeito/estilo) + screenshots no PR.
// - Se houver "mudança estrutural" (remoção de JSX/className/atributos data-testid),
//   falha sem `ui-change` + evidências.
// - Para emergências, só passa com label `override: ui-allow` (e ainda exige screenshots).

const { danger, fail, warn, markdown } = require("danger");

const PR = danger.github.pr;
const labels = (danger.github.issue.labels || []).map(l => l.name);
const body = PR.body || "";

// Paths considerados UI
const UI_DIRS = [
  "app/", "src/app/",
  "components/", "src/components/",
  "styles/", "src/styles/"
];

// Se o arquivo começa com algum desses diretórios
const isUIPath = (f) => UI_DIRS.some(base => f.startsWith(base));

// Arquivos alterados no PR
const changed = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
  ...danger.git.deleted_files,
];

// Filtra somente UI
const uiFiles = changed.filter(isUIPath);

// Se não tocou UI, nada a fazer
if (uiFiles.length === 0) {
  markdown("🧪 PR não altera UI — guard OK.");
} else {
  // Heurística de "mudança estrutural" em TSX/JSX
  const uiCodeFiles = uiFiles.filter(f => /\.(tsx|jsx|ts|js)$/.test(f));
  const uiStyleOnly = uiFiles.every(f => /\.(css|scss|sass)$/.test(f) || f.endsWith(".module.css") || f.endsWith(".module.scss"));

  // Flags de controle
  let structuralChangeDetected = false;

  // Agenda análise assíncrona dos diffs
  schedule(async () => {
    for (const file of uiCodeFiles) {
      const diff = await danger.git.diffForFile(file); // string com patch unificado
      if (!diff) continue;

      const removedTag = /(^|\n)-\s*<\w+/m.test(diff) || /(^|\n)-\s*<\/\w+/m.test(diff);
      const removedClass = /(^|\n)-.*class(Name)?\s*=/.test(diff);
      const removedTestId = /(^|\n)-.*data-testid\s*=/.test(diff);

      if (removedTag || removedClass || removedTestId) {
        structuralChangeDetected = true;
        warn(`🔎 Possível mudança estrutural em \`${file}\` (remoção de JSX/className/data-testid).`);
      }
    }

    const hasUIChange = labels.includes("ui-change");
    const hasUIEnhancement = labels.includes("ui-enhancement");
    const hasOverride = labels.includes("override: ui-allow");

    // Verifica se PR body tem screenshots (imagem markdown ou palavra-chave)
    const hasScreens =
      /!\[.*\]\(.*\)/i.test(body) || /screenshot|print|evid(ê|e)ncias/i.test(body);

    // Regras de decisão
    if (uiStyleOnly) {
      // Só CSS/SCSS/module.css — melhoria visual
      if (!hasUIEnhancement && !hasUIChange && !hasOverride) {
        fail("🛑 Alterações de UI (estilo) exigem **label** `ui-enhancement` e **screenshots** no PR.");
      } else if (!hasScreens) {
        fail("🛑 Inclua **screenshots/evidências** no corpo do PR para alterações de UI.");
      } else {
        markdown("🎨 UI (estilo) com `ui-enhancement` + evidências — permitido.");
      }
      return;
    }

    // Há arquivos de código em UI
    if (structuralChangeDetected) {
      if (!hasOverride && !hasUIChange) {
        fail("🛑 Mudança **estrutural** de UI detectada. Adicione `ui-change` **ou** `override: ui-allow` **e** inclua screenshots.");
      } else if (!hasScreens) {
        fail("🛑 Mudança estrutural sem evidências. Inclua **screenshots** no PR.");
      } else {
        markdown("🧩 Mudança estrutural permitida com label apropriado + evidências. Será necessária sua review (CODEOWNERS).");
      }
    } else {
      // Não parece estrutural → tratar como melhoria
      if (!hasUIEnhancement && !hasUIChange && !hasOverride) {
        fail("🛑 Alterações em arquivos de UI exigem `ui-enhancement` (melhoria) **ou** `ui-change` (estrutura) + screenshots.");
      } else if (!hasScreens) {
        fail("🛑 Inclua **screenshots** no PR para alterações em UI.");
      } else {
        markdown("✅ Alteração em UI sem remoções — tratada como melhoria com evidências.");
      }
    }

    // Sumário dos arquivos UI alterados
    if (uiFiles.length) {
      markdown(`**Arquivos de UI alterados (${uiFiles.length})**:\n\n${uiFiles.map(f => `- \`${f}\``).join("\n")}`);
    }
  });
}
