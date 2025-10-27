// tests/seeds/seed-campeoes.ts
// NO-OP: aceita --slug=<slug> ou slug posicional

(() => {
  const argv = process.argv.slice(2);

  function argVal(flag: string): string | undefined {
    const i = argv.indexOf(flag);
    if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("-")) return argv[i + 1];
    const eq = argv.find((a) => a.startsWith(flag + "="));
    if (eq) return eq.split("=")[1];
    return undefined;
  }

  const slug = argVal("--slug") ?? (argv[0] && !argv[0].startsWith("-") ? argv[0] : "demo-rachao");

  console.log(`[seed-campeoes] OK (slug=${slug})`);
  process.exit(0);
})();

export {};
