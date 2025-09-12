// Script para testar a integração de billing
const config = require("../src/config/env.ts").default;

console.log("🔧 Configuração de Ambiente:");
console.log("============================");
console.log(`API URL: ${config.apiUrl}`);
console.log(`MP Public Key: ${config.mpPublicKey || "Não configurado"}`);
console.log(`Demo Tenant ID: ${config.demoTenantId}`);
console.log(`Environment: ${config.isDevelopment ? "Development" : "Production"}`);
console.log("");

// Teste de conectividade com a API
async function testAPI() {
  try {
    console.log("🌐 Testando conectividade com a API...");
    const response = await fetch(`${config.apiUrl}/billing/plans`);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API conectada com sucesso!");
      console.log(`📋 Planos encontrados: ${data.plans?.length || 0}`);

      if (data.plans?.length > 0) {
        console.log("📝 Planos disponíveis:");
        data.plans.forEach((plan) => {
          console.log(`  - ${plan.label}: R$ ${plan.amount} (${plan.interval})`);
        });
      }
    } else {
      console.log(`❌ Erro na API: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Erro de conectividade: ${error.message}`);
  }
}

// Teste de assinatura
async function testSubscription() {
  try {
    console.log("🔍 Testando busca de assinatura...");
    const response = await fetch(
      `${config.apiUrl}/billing/subscription/tenant/${config.demoTenantId}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Assinatura encontrada!");
      console.log(`📋 Plano: ${data.planKey}`);
      console.log(`📊 Status: ${data.status}`);
    } else if (response.status === 404) {
      console.log("ℹ️  Nenhuma assinatura encontrada (normal para demo)");
    } else {
      console.log(`❌ Erro na busca: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Erro na busca: ${error.message}`);
  }
}

// Executar testes
async function runTests() {
  console.log("🚀 Iniciando testes de integração...");
  console.log("");

  await testAPI();
  console.log("");
  await testSubscription();
  console.log("");

  console.log("✅ Testes concluídos!");
}

runTests();
