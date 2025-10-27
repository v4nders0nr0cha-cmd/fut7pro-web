/* scripts/run-e2e.ts
   Carrega .env.e2e, espera /health da API, e roda Playwright.
   Se a API não responder, sai com código 1 (sem prosseguir).
*/
/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function waitForApiReady(timeoutMs = 30000) {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:3333';
  const url = (base.endsWith('/') ? base.slice(0, -1) : base) + '/health';
  const start = Date.now();
  let lastErr: unknown;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastErr = `${res.status} ${res.statusText}`;
    } catch (e) {
      lastErr = e;
    }
    await new Promise(r => setTimeout(r, 800));
  }
  throw new Error(`API não respondeu OK em ${timeoutMs}ms: ${url} (${String(lastErr)})`);
}

async function main() {
  // 1) carregar .env.e2e
  const envFile = resolve(process.cwd(), '.env.e2e');
  loadEnvFile(envFile);

  // 2) esperar API
  console.log('⏳ Aguardando API /health…');
  await waitForApiReady(30000).catch((e) => {
    console.error('❌ API não está pronta:', e?.message ?? e);
    process.exit(1);
  });
  console.log('✅ API OK');

  // 3) Rodar Playwright com baseURL do env e config CJS
  const isWin = process.platform === 'win32';
  const cmdStr = 'npx playwright test -c playwright.config.cjs --project=chromium';
  const pw = spawn(isWin ? 'cmd' : (process.env.SHELL || '/bin/sh'),
    isWin ? ['/c', cmdStr] : ['-lc', cmdStr],
    { stdio: 'inherit', env: process.env, shell: false });
  pw.on('exit', (code) => process.exit(code ?? 1));
}

main();
