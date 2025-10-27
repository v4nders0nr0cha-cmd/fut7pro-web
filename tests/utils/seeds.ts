// tests/utils/seeds.ts
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

let seeded = false;

function resolveNpx() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function tryLoadDatabaseUrlFromEnvFiles() {
  if (process.env.DATABASE_URL) return;
  const root = process.cwd();
  for (const file of [".env.test", ".env.local", ".env"]) {
    const p = path.join(root, file);
    if (!fs.existsSync(p)) continue;
    const txt = fs.readFileSync(p, "utf-8");
    for (const line of txt.split(/\r?\n/)) {
      const s = line.trim();
      if (!s || s.startsWith("#") || !s.includes("=")) continue;
      const i = s.indexOf("=");
      const k = s.slice(0, i).trim();
      const v = s
        .slice(i + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (!(k in process.env)) process.env[k] = v;
    }
    if (process.env.DATABASE_URL) {
      console.log(`[ensureSeedData] DATABASE_URL carregada de ${file}`);
      return;
    }
  }
}

function findSeedFile(prefer: string[], fallback: string[]): string {
  const search = [...prefer, ...fallback];
  for (const rel of search) {
    const abs = path.resolve(process.cwd(), rel);
    if (fs.existsSync(abs)) return abs;
  }
  throw new Error(`[seeds] Arquivo de seed não encontrado. Procurado em: ${search.join(", ")}`);
}

function runSeed(label: string, fileAbs: string, args: string[], env: NodeJS.ProcessEnv) {
  const npx = resolveNpx();
  const res = spawnSync(npx, ["-y", "tsx", fileAbs, ...args], {
    cwd: process.cwd(),
    env,
    stdio: "pipe",
    encoding: "utf-8",
    windowsHide: true,
    shell: process.platform === "win32",
  });

  if (res.status !== 0) {
    const stderr = res.stderr ?? "";
    const stdout = res.stdout ?? "";
    throw new Error(
      `[seeds] ${label} failed (exit=${res.status}).\nstdout:\n${stdout}\nstderr:\n${stderr}`
    );
  }
}

export async function ensureSeedData(slug?: string) {
  if (seeded) return;

  tryLoadDatabaseUrlFromEnvFiles();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[ensureSeedData] DATABASE_URL não definido. Seeds não foram executados.");
    seeded = true;
    return;
  }

  const resolvedSlug = slug || process.env.SEED_SLUG || "demo-rachao";
  const env = { ...process.env, DATABASE_URL: databaseUrl };
  const today = new Date().toISOString().slice(0, 10);

  // 🔥 Prioriza tests/seeds (no-op) para não depender do Prisma
  const timesFile = findSeedFile(
    ["tests/seeds/seed-times-do-dia.ts"], // prefer
    ["scripts/seed-times-do-dia.ts", "prisma/seeds/seed-times-do-dia.ts"] // fallback
  );
  const campeoesFile = findSeedFile(
    ["tests/seeds/seed-campeoes.ts"],
    ["scripts/seed-campeoes.ts", "prisma/seeds/seed-campeoes.ts"]
  );
  const backfillFile = findSeedFile(
    ["tests/seeds/backfill-gols-assists.ts"],
    ["scripts/backfill-gols-assists.ts", "prisma/seeds/backfill-gols-assists.ts"]
  );

  // 1) seed-times-do-dia: [slug, "Demo Rachão", YYYY-MM-DD]
  runSeed("seed-times-do-dia", timesFile, [resolvedSlug, "Demo Rachão", today], env);
  // 2) seed-campeoes: --slug=<slug>
  runSeed("seed-campeoes", campeoesFile, [`--slug=${resolvedSlug}`], env);
  // 3) backfill-gols-assists: --slug <slug> --days 14 --force
  runSeed(
    "backfill-gols-assists",
    backfillFile,
    ["--slug", resolvedSlug, "--days", "14", "--force"],
    env
  );

  seeded = true;
  console.log("[ensureSeedData] OK (no-op seeds)");
}
