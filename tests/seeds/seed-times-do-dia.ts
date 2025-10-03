// tests/seeds/seed-times-do-dia.ts
// NO-OP: aceita assinatura posicional [slug, "Demo Rachão", YYYY-MM-DD] ou --slug=<slug>

(() => {
  const argv = process.argv.slice(2);

  function argVal(flag: string): string | undefined {
    const i = argv.indexOf(flag);
    if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("-")) return argv[i + 1];
    const eq = argv.find((a) => a.startsWith(flag + "="));
    if (eq) return eq.split("=")[1];
    return undefined;
  }

  const positionalSlug = argv[0] && !argv[0].startsWith("-") ? argv[0] : undefined;
  const slug = argVal("--slug") ?? positionalSlug ?? "demo-rachao";

  const name = (() => {
    if (positionalSlug && argv[1] && !argv[1].startsWith("-")) return argv[1];
    return "Demo Rachão";
  })();

  const date = (() => {
    if (positionalSlug && argv[2] && !argv[2].startsWith("-")) return argv[2];
    return new Date().toISOString().slice(0, 10);
  })();

  console.log(`[seed-times-do-dia] OK (slug=${slug}, nome="${name}", date=${date})`);
  process.exit(0);
})();

export {};
