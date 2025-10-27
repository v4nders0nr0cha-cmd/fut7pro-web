import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const targets = [
  "src/app/(admin)",
  "src/components/admin",
  "src/app/(superadmin)",
  "src/components/superadmin",
];

function runLint(dir: string) {
  const fullPath = path.resolve(projectRoot, dir);
  if (!existsSync(fullPath)) {
    return;
  }

  console.log("\n>> Executando lint com --fix em " + dir);
  const result = spawnSync("npx", ["next", "lint", "--dir", dir, "--fix"], {
    stdio: "inherit",
    cwd: projectRoot,
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error("Lint finalizou com codigo " + result.status + " em " + dir);
  }
}

try {
  for (const target of targets) {
    runLint(target);
  }
  console.log("\nOK Lint administrativo concluido sem erros.");
} catch (error) {
  console.error("\nFalha ao executar lint administrativo.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
