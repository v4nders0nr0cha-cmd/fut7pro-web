// Uso:
//   BASE_URL=http://localhost:3000 SLUG=demo-rachao npx tsx scripts/smoke-campeoes.ts
// Saída com contagem e falha (exit 1) se algo estiver inconsistente.

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SLUG = process.env.SLUG || "demo-rachao";

async function main() {
  console.log(`[smoke] BASE_URL=${BASE_URL} SLUG=${SLUG}`);

  const rachaRes = await fetch(`${BASE_URL}/api/public/rachas/${encodeURIComponent(SLUG)}`);
  if (!rachaRes.ok) {
    console.error(`[smoke] Falha ao obter racha. HTTP ${rachaRes.status}`);
    process.exit(1);
  }
  const racha = await rachaRes.json();
  if (!racha?.id) {
    console.error("[smoke] Resposta de racha inválida, faltando id");
    process.exit(1);
  }
  console.log(`[smoke] rachaId=${racha.id}`);

  const campRes = await fetch(`${BASE_URL}/api/campeoes?rachaId=${encodeURIComponent(racha.id)}`);
  if (!campRes.ok) {
    console.error(`[smoke] Falha ao obter campeões. HTTP ${campRes.status}`);
    process.exit(1);
  }
  const campeoes = await campRes.json();
  const total = Array.isArray(campeoes) ? campeoes.length : 0;
  console.log(`[smoke] campeões retornados=${total}`);

  if (total <= 0) {
    console.error("[smoke] Nenhum campeão retornado. Verifique seed e migration.");
    process.exit(2);
  }

  console.log("[smoke] OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
