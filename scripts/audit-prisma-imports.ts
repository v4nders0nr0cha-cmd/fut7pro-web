import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const allowedFiles = new Set(
  [
    "src/server/prisma.ts",
    "scripts/dev-migrate-seed.ps1",
    "scripts/backfill-gols-assists.ts",
    "scripts/seed-campeoes.ts",
    "scripts/seed-times-do-dia.ts",
    "scripts/smoke-campeoes.ts",
    "prisma/seed.ts",
  ].map((file) => path.resolve(projectRoot, file))
);

const ignoreDirs = new Set(["node_modules", ".git", ".next", "out", ".turbo", "coverage", "dist"]);

function shouldSkipFile(filePath: string): boolean {
  return filePath.endsWith(".d.ts");
}

async function walk(dir: string, bucket: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, bucket);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      bucket.push(fullPath);
    }
  }
  return bucket;
}

async function fileHasDirectPrismaImport(filePath: string): Promise<boolean> {
  if (shouldSkipFile(filePath)) {
    return false;
  }

  const source = await fs.readFile(filePath, "utf8");
  const importPattern = /from\s+['"]@prisma\/client['"]/;
  const importTypePattern = /import\s+type\s+.*from\s+['"]@prisma\/client['"]/;
  const requirePattern = /require\(['"]@prisma\/client['"]\)/;

  if (importTypePattern.test(source)) {
    return false;
  }

  return importPattern.test(source) || requirePattern.test(source);
}

async function main() {
  const files = await walk(projectRoot);
  const offenders: string[] = [];

  for (const file of files) {
    if (allowedFiles.has(file)) {
      continue;
    }
    if (await fileHasDirectPrismaImport(file)) {
      offenders.push(path.relative(projectRoot, file));
    }
  }

  if (offenders.length === 0) {
    console.log(
      "OK Nenhuma importacao direta de @prisma/client encontrada fora dos pontos permitidos."
    );
    return;
  }

  console.log("Aviso: arquivos com importacao direta de @prisma/client:");
  for (const offender of offenders) {
    console.log(" - " + offender);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("Erro ao auditar imports do Prisma:", error);
  process.exitCode = 1;
});
