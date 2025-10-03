// tests/seeds/backfill-gols-assists.ts
// NO-OP: aceita --slug <slug> --days <n> --force (ou --slug=<slug>)

(() => {
  const argv = process.argv.slice(2);

  function argVal(flag: string): string | undefined {
    const i = argv.indexOf(flag);
    if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("-")) return argv[i + 1];
    const eq = argv.find((a) => a.startsWith(flag + "="));
    if (eq) return eq.split("=")[1];
    return undefined;
  }

  const slug = argVal("--slug") ?? "demo-rachao";
  const daysStr = argVal("--days") ?? "14";
  const days = Number.isFinite(Number(daysStr)) ? Number(daysStr) : 14;
  const force = argv.includes("--force");

  console.log(`[backfill-gols-assists] OK (slug=${slug}, days=${days}, force=${force})`);
  process.exit(0);
})();

export {};
