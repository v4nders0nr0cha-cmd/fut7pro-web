const BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:3333';
const TARGET = (BASE.endsWith('/') ? BASE.slice(0, -1) : BASE) + '/health';

async function waitForApiReady(timeoutMs = 30000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(TARGET);
      if (r.ok) return;
      lastErr = `${r.status} ${r.statusText}`;
    } catch (e) {
      lastErr = e;
    }
    await new Promise(r => setTimeout(r, 800));
  }
  throw new Error(`API não respondeu OK em ${timeoutMs}ms: ${TARGET} (${String(lastErr)})`);
}

module.exports = { waitForApiReady };

