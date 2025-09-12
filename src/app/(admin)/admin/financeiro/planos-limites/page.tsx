"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import useSubscription from "@/hooks/useSubscription";
import SubscriptionStatusCard from "@/components/billing/SubscriptionStatusCard";
import BillingAPI from "@/lib/api/billing";
import config from "@/config/env";

// Não altere nada nos planos! Apenas use o mock fiel fornecido:
const ARMAZENAMENTO =
  "Armazenamento ilimitado: todos os dados, rankings, atletas e partidas ficam salvos para sempre, sem custo extra e sem limite de memória. Nunca perca seu histórico e nunca precisará migrar de plano por falta de memória!";
const PERSONALIZACAO_VISUAL =
  "Personalização Visual: escolha entre diversos temas de cores e deixe seu racha com a identidade visual que mais combina com o grupo.";

const PLANOS = {
  mensal: [
    {
      nome: "Mensal Essencial",
      preco: "R$ 150/mês",
      destaque: true,
      badge: "Mais escolhido",
      descricao:
        "Ideal para grupos que querem controle total, profissionalização e monetização do racha com um valor acessível.",
      recursos: [
        "Acesso completo ao sistema Fut7Pro (todas as funcionalidades)",
        PERSONALIZACAO_VISUAL,
        ARMAZENAMENTO,
        "Teste grátis por 30 dias – experimente sem compromisso",
        "Cadastro ilimitado de atletas e jogos",
        "Gestão financeira completa do racha (opcionalmente visível no site para transparência ou privado para admins)",
        "Página dedicada e carrossel no rodapé exclusivo para patrocinadores – gere receita e valorize seus apoiadores",
        "Sorteio inteligente de times, ranking automático, feed de conquistas, estatísticas, tira-teima e mais",
        'Manual de Monetização: "Aprenda como fechar patrocínio, deixe o patrocinador pagar pelo Fut7Pro e ainda coloque dinheiro no caixa do seu racha."',
        "Até 4 administradores (presidente, vice-presidente, diretor de futebol e diretor financeiro)",
        "Suporte básico por e-mail",
        "Painel administrativo completo",
        "Feed de notificações e conquistas",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Mensal Essencial",
    },
    {
      nome: "Mensal + Marketing",
      preco: "R$ 220/mês",
      badge: "Plano com Marketing",
      descricao:
        "Para rachas que querem crescer, atrair patrocinadores e se destacar nas redes sociais.",
      recursos: [
        "Tudo do Mensal Essencial",
        "Designer dedicado para criação de kit patrocinador personalizado",
        "Especialista para estruturar e turbinar o Instagram do racha",
        "Seu site pronto entregue com layout, logo, textos, imagens e vídeos",
        "Suporte prioritário via WhatsApp",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Mensal + Marketing",
    },
    {
      nome: "Enterprise (Pagamento Mensal)",
      preco: "R$ 700/mês + PIX R$ 3.480",
      badge: "Exclusivo",
      descricao:
        "Solução completa para rachas profissionais, empresas e grupos que precisam de recursos avançados, suporte prioritário e personalização total.",
      recursos: [
        "Tudo do Plano Anual + Marketing",
        "Suporte prioritário 24/7 (WhatsApp, e-mail e telefone)",
        "Personalização completa da identidade visual (logo, cores, fontes, layout)",
        "Página personalizada do racha (domínio próprio opcional)",
        "Integração com sistemas externos (APIs personalizadas)",
        "Relatórios avançados e analytics detalhados",
        "Treinamento personalizado para administradores",
        "Consultoria especializada em monetização",
        "Backup e segurança de nível empresarial",
        "SLA de 99.9% de disponibilidade",
        "Até 10 administradores",
        "Suporte para múltiplos rachas (até 5)",
        "Funcionalidades exclusivas e em desenvolvimento",
      ],
      limites: ["Até 5 rachas por assinatura", "Domínio próprio opcional"],
      botao: "Assinar Enterprise",
    },
  ],
  anual: [
    {
      nome: "Anual Essencial",
      preco: "R$ 1.500/ano",
      destaque: true,
      badge: "Mais vantajoso",
      descricao:
        "Todos os recursos do plano Mensal Essencial, com economia máxima e acesso anual sem preocupação.",
      recursos: [
        "Acesso completo ao Fut7Pro (todas as funcionalidades)",
        PERSONALIZACAO_VISUAL,
        ARMAZENAMENTO,
        "1 mês de teste grátis na primeira assinatura + 2 meses grátis todo ano (economize R$ 450,00 no primeiro ano e R$ 300,00 nos anos seguintes)",
        "Cadastro ilimitado de atletas e jogos",
        "Gestão financeira completa do racha (controle de visibilidade público ou privado)",
        "Página dedicada e carrossel no rodapé exclusivo para patrocinadores – gere receita e valorize seus apoiadores",
        'Manual de Monetização: "Aprenda como fechar patrocínio, deixe o patrocinador pagar pelo Fut7Pro e ainda coloque dinheiro no caixa do seu racha."',
        "Painel administrativo, ranking, sorteios, feed de conquistas e muito mais",
        "Até 4 administradores (presidente, vice-presidente, diretor de futebol e diretor financeiro)",
        "Suporte básico por e-mail",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Anual Essencial",
    },
    {
      nome: "Anual + Marketing",
      preco: "R$ 2.200/ano",
      badge: "Plano mais completo",
      descricao:
        "Plano premium para grupos que querem profissionalizar, atrair patrocinadores e crescer rápido.",
      recursos: [
        "Tudo do Anual Essencial",
        "Designer dedicado para criação de kit patrocinador personalizado",
        "Especialista em Instagram",
        "Site pronto entregue com layout, logo, textos, imagens e vídeos",
        "Bônus: 1 hora de consultoria com especialista em monetização de rachas",
        "Suporte prioritário via WhatsApp",
      ],
      limites: ["1 racha por assinatura"],
      botao: "Assinar Anual + Marketing",
    },
    {
      nome: "Enterprise White Label",
      preco: "R$ 9.900/ano",
      badge: "Exclusivo",
      descricao:
        "Plano para clubes, ligas e grandes organizações que exigem exclusividade total. Nenhuma referência ao Fut7Pro, sistema 100% com sua marca, domínio próprio, PDFs e e-mails personalizados, suporte premium e limites ampliados.",
      recursos: [
        "Nenhuma referência ao Fut7Pro (logo, frase, links, PDF, e-mails, favicon, etc)",
        ARMAZENAMENTO,
        "Domínio próprio e e-mails personalizados",
        "Design, cores, frases e ícones com personalização exclusiva",
        "PDFs e relatórios com a marca do cliente",
        "Powered by exclusivo para sua marca",
        "Sem teste grátis. 2 meses grátis todo ano no plano anual (R$ 1.980,00/ano de economia). Onboarding e setup personalizado inclusos.",
        "Suporte premium e SLA diferenciado",
        "Consultoria e onboarding exclusivo",
        "Limites ampliados (administradores, uploads)",
        "Contrato, nota fiscal e recursos especiais sob demanda",
        "Acesso antecipado a novas funcionalidades",
      ],
      limites: ["Racha, liga ou clube ilimitado"],
      botao: "Solicitar Enterprise",
    },
  ],
};

// Mock do plano ativo e ciclo (pode evoluir depois para contexto ou API)
const PLANO_ATUAL = {
  nome: "Mensal Essencial",
  tipo: "mensal", // ou "anual"
  diasRestantes: 5,
  renovacao: "21/07/2025",
};

export default function PlanosLimitesPage() {
  // Mock tenantId - em produção, viria do contexto de autenticação
  const tenantId = config.demoTenantId;

  const {
    subscription,
    plans,
    subscriptionStatus,
    loading,
    error,
    refreshSubscription,
    refreshPlans,
  } = useSubscription(tenantId);

  const [planoAtivo, setPlanoAtivo] = useState<"mensal" | "anual">("mensal");
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  // Determinar o tipo de plano baseado na assinatura atual
  useEffect(() => {
    if (subscription?.planKey) {
      const isAnual =
        subscription.planKey.includes("yearly") || subscription.planKey.includes("anual");
      setPlanoAtivo(isAnual ? "anual" : "mensal");
    }
  }, [subscription]);

  const handleAssinarPlano = async (planKey: string) => {
    if (!tenantId) {
      alert("Tenant ID não encontrado");
      return;
    }

    try {
      setIsCreatingSubscription(true);

      if (planKey === "monthly_enterprise") {
        // Fluxo especial para Enterprise
        const result = await BillingAPI.startEnterpriseMonthly({
          tenantId,
          payerEmail: "admin@exemplo.com", // Em produção, viria do usuário logado
          payerName: "Administrador", // Em produção, viria do usuário logado
        });

        // Abrir URL de autorização em nova aba
        window.open(result.preapprovalUrl, "_blank");

        // Mostrar QR Code do PIX
        alert(`PIX de R$ 3.480 gerado! QR Code: ${result.pix.qrCode}`);
      } else {
        // Fluxo normal para outros planos
        const result = await BillingAPI.createSubscription({
          tenantId,
          planKey,
          payerEmail: "admin@exemplo.com", // Em produção, viria do usuário logado
        });

        // Redirecionar para checkout
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      console.error("Erro ao criar assinatura:", err);
      alert("Erro ao criar assinatura. Tente novamente.");
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  return (
    <>
      <Head>
        <title>Planos & Limites | Fut7Pro</title>
        <meta
          name="description"
          content="Compare os planos Fut7Pro e escolha o melhor para seu racha. Controle, estatísticas, gestão financeira, patrocinadores, marketing, painel completo e suporte especializado."
        />
        <meta
          name="keywords"
          content="planos, limites, Fut7, racha, SaaS, futebol, gestão, assinatura, clube, admin, painel"
        />
      </Head>
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3">Planos & Limites</h1>
        <p className="text-base text-neutral-300 mb-6 max-w-xl">
          Compare recursos, limites e vantagens dos planos Fut7Pro. Tenha sempre o melhor para o seu
          racha!
        </p>

        {/* Card de Status da Assinatura Atual */}
        {subscription && (
          <div className="mb-8">
            <SubscriptionStatusCard
              subscription={subscription}
              status={subscriptionStatus}
              onRefresh={refreshSubscription}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-2xl text-yellow-400 mr-3" />
            <span className="text-lg text-gray-300">Carregando planos...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600/90 text-white font-semibold rounded-xl px-6 py-3 shadow-lg text-lg text-center w-full md:w-auto">
              Erro ao carregar dados: {error}
            </div>
          </div>
        )}

        {/* Botões de seleção de planos */}
        <div className="flex justify-center mb-10">
          <button
            className={`px-6 py-2 rounded-l-xl font-bold transition border ${planoAtivo === "mensal" ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-700 hover:bg-yellow-400 hover:text-black"}`}
            onClick={() => setPlanoAtivo("mensal")}
          >
            Pagamento Mensal
          </button>
          <button
            className={`px-6 py-2 rounded-r-xl font-bold transition border-t border-b border-r ${planoAtivo === "anual" ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-700 hover:bg-yellow-400 hover:text-black"}`}
            onClick={() => setPlanoAtivo("anual")}
          >
            Pagamento Anual <span className="ml-1 text-xs">(2 meses grátis)</span>
          </button>
        </div>

        {/* Grid de planos */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PLANOS[planoAtivo].map((plano, idx) => {
              // Mapear planos estáticos para chaves do MP
              const getPlanKey = (plano: any) => {
                if (plano.nome.includes("Mensal Essencial")) return "monthly_essential";
                if (plano.nome.includes("Mensal + Marketing")) return "monthly_marketing";
                if (plano.nome.includes("Enterprise")) return "monthly_enterprise";
                if (plano.nome.includes("Anual Essencial")) return "yearly_essential";
                if (plano.nome.includes("Anual + Marketing")) return "yearly_marketing";
                if (plano.nome.includes("Enterprise White Label")) return "yearly_enterprise";
                return "";
              };

              const planKey = getPlanKey(plano);
              const isCurrentPlan = subscription?.planKey === planKey;

              return (
                <div
                  key={plano.nome}
                  className={`relative rounded-2xl p-8 flex flex-col shadow-xl border-2 transition ${plano.destaque ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-800 hover:border-yellow-300"}`}
                >
                  {/* Badge do plano */}
                  {plano.badge && (
                    <span
                      className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${plano.destaque ? "bg-black text-yellow-300" : "bg-yellow-300 text-black"}`}
                    >
                      {plano.badge}
                    </span>
                  )}
                  {/* Nome e Preço */}
                  <div className="text-2xl font-extrabold mb-1">{plano.nome}</div>
                  <div className="text-xl font-bold mb-2">{plano.preco}</div>
                  {/* Descrição curta */}
                  <div
                    className={`mb-4 text-base ${plano.destaque ? "text-black/80" : "text-neutral-300"}`}
                  >
                    {plano.descricao}
                  </div>
                  {/* Recursos */}
                  <ul className="mb-4 space-y-1">
                    {plano.recursos.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-base">
                        <span
                          className={`font-bold ${plano.destaque ? "text-yellow-900" : "text-yellow-400"}`}
                        >
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Limites */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {plano.limites.map((limite, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${plano.destaque ? "bg-yellow-300 text-black" : "bg-neutral-700 text-yellow-200"}`}
                      >
                        {limite}
                      </span>
                    ))}
                    {/* Badge verde específico */}
                    {plano.nome === "Enterprise White Label" ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-400 text-black">
                        Admins ilimitados
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-400 text-black">
                        4 administradores
                      </span>
                    )}
                  </div>
                  {/* Botão de ação */}
                  <button
                    onClick={() => handleAssinarPlano(planKey)}
                    disabled={isCreatingSubscription || isCurrentPlan}
                    className={`mt-auto px-6 py-2 rounded-xl font-bold ${
                      isCurrentPlan
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : plano.destaque
                          ? "bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black border-2 border-black"
                          : "bg-yellow-400 text-black hover:bg-yellow-500"
                    } transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCreatingSubscription ? (
                      <>
                        <FaSpinner className="animate-spin inline mr-2" />
                        Processando...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <FaCheckCircle className="inline mr-2" />
                        Plano Atual
                      </>
                    ) : (
                      plano.botao
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
