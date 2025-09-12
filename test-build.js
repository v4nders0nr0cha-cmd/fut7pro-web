// Teste simples para verificar se o problema é com o Next.js 15
const { execSync } = require("child_process");

console.log("Testando build com Next.js 15...");

try {
  // Tentar build com apenas uma página
  execSync("npx next build --debug", { stdio: "inherit" });
  console.log("✅ Build bem-sucedido!");
} catch (error) {
  console.log("❌ Build falhou:", error.message);
}
