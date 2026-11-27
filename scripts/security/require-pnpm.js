function isSupportedAgent(agent) {
  return /^pnpm\/10\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:\s|$)/.test(agent || "");
}

if (require.main === module && !isSupportedAgent(process.env.npm_config_user_agent)) {
  console.error(
    "Use pnpm 10.19.0 com pnpm-lock.yaml. O frontend nao utiliza npm install ou yarn para resolver dependencias."
  );
  process.exitCode = 1;
}
module.exports = { isSupportedAgent };
