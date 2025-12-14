"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import SubscriptionStatusCard from "@/components/billing/SubscriptionStatusCard";
import BillingAPI from "@/lib/api/billing";
import useSubscription from "@/hooks/useSubscription";

const FEATURE_MAP: Record<
  string,
  { recursos: string[]; limites: string[]; badge?: string; destaque?: boolean }
> = {
  monthly_essential: {
    destaque: true,
    badge: "Mais escolhido",
    recursos: [
      "Acesso completo ao sistema Fut7Pro (todas as funcionalidades)",
      "Personalizacao Visual (cores/temas)",
      "Armazenamento ilimitado e historico preservado",
      "Teste gratis por 30 dias",
      "Cadastro ilimitado de atletas e jogos",
      "Gestao financeira (publica ou privada)",
      "Carrossel e pagina de patrocinadores",
      "Sorteio inteligente, ranking automatico e feed de conquistas",
      "Manual de monetizacao incluso",
    ],
    limites: ["1 racha por assinatura", "Ate 4 administradores"],
  },
  monthly_marketing: {
    badge: "Plano com Marketing",
    recursos: [
      "Tudo do Mensal Essencial",
      "Designer dedicado para kit patrocinador",
      "Especialista para turbinar Instagram",
      "Site pronto com layout/texto/imagem",
      "Suporte prioritario via WhatsApp",
    ],
    limites: ["1 racha por assinatura"],
  },
  monthly_enterprise: {
    badge: "Exclusivo",
    recursos: [
      "Suporte prioritario 24/7",
      "Personalizacao completa (logo, cores, fontes)",
      "Integracoes externas e relatorios avancados",
      "Treinamento e consultoria de monetizacao",
      "Ate 10 administradores e multiplos rachas",
    ],
    limites: ["Ate 5 rachas por assinatura", "Dominio proprio opcional"],
  },
  yearly_essential: {
    destaque: true,
    badge: "Mais vantajoso",
    recursos: [
      "Tudo do Mensal Essencial",
      "1 mes de teste gratis + 2 meses por ano",
      "Gestao financeira com controle de visibilidade",
      "Ranking, sorteios e feed de conquistas",
      "Suporte por e-mail",
    ],
    limites: ["1 racha por assinatura"],
  },
  yearly_marketing: {
    badge: "Plano completo",
    recursos: [
      "Tudo do Anual Essencial",
      "Designer dedicado para patrocinadores",
      "Consultoria de marketing e monetizacao",
      "Suporte prioritario via WhatsApp",
    ],
    limites: ["1 racha por assinatura"],
  },
  yearly_enterprise: {
    badge: "White Label",
    recursos: [
      "Branding 100% white-label (logo/links/PDFs/e-mails)",
      "Dominio proprio e e-mails personalizados",
      "SLA diferenciado e suporte premium",
      "Limites ampliados e acesso antecipado a features",
    ],
    limites: ["Racha/ligas ilimitados"],
  },
};

export default function PlanosLimitesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const tenantId = user?.tenantId;
  const payerEmail = user?.email;
  const payerName = user?.name || payerEmail || "Administrador";

  const { subscription, plans, subscriptionStatus, loading, error, refreshSubscription } =
    useSubscription(tenantId);

  const [planoAtivo, setPlanoAtivo] = useState<"mensal" | "anual">("mensal");
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  const planosDisponiveis = useMemo(() => {
    return plans.map((plan) => {
      const feature = FEATURE_MAP[plan.key] || { recursos: [], limites: [] };
      return {
        key: plan.key,
        nome: plan.label,
        preco: plan.amount / 100,
        intervalo: plan.interval,
        badge: feature.badge,
        destaque: feature.destaque,
        recursos: feature.recursos,
        limites: feature.limites.length ? feature.limites : ["Limites conforme contrato"],
        botao: plan.interval === "year" ? "Assinar plano anual" : "Assinar plano mensal",
      };
    });
  }, [plans]);

  useEffect(() => {
    if (subscription?.planKey) {
      const isAnual =
        subscription.planKey.includes("yearly") || subscription.planKey.includes("anual");
      setPlanoAtivo(isAnual ? "anual" : "mensal");
    }
  }, [subscription]);

  const handleAssinarPlano = async (planKey: string) => {
    if (!tenantId || !payerEmail) {
      alert("Dados da conta ausentes. Refaca login ou complete seu perfil para assinar.");
      return;
    }

    try {
      setIsCreatingSubscription(true);

      if (planKey === "monthly_enterprise") {
        const result = await BillingAPI.startEnterpriseMonthly({
          tenantId,
          payerEmail,
          payerName,
        });

        window.open(result.preapprovalUrl, "_blank");
        alert(`PIX gerado! QR Code: ${result.pix.qrCode}`);
      } else {
        const result = await BillingAPI.createSubscription({
          tenantId,
          planKey,
          payerEmail,
        });

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
          content="Compare os planos Fut7Pro e escolha o melhor para seu racha. Controle, estatisticas, gestao financeira, patrocinadores, marketing, painel completo e suporte especializado."
        />
        <meta
          name="keywords"
          content="planos, limites, Fut7, racha, SaaS, futebol, gestao, assinatura, clube, admin, painel"
        />
      </Head>
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3">Planos & Limites</h1>
        <p className="text-base text-neutral-300 mb-6 max-w-xl">
          Compare recursos, limites e vantagens dos planos Fut7Pro. Tenha sempre o melhor para o seu
          racha!
        </p>

        {!tenantId && (
          <div className="mb-6 rounded-xl border border-red-500 bg-red-500/10 px-4 py-3 text-red-100">
            Nao foi possivel identificar seu tenant. Refaça login para selecionar um plano.
          </div>
        )}

        {subscription && (
          <div className="mb-8">
            <SubscriptionStatusCard
              subscription={subscription}
              status={subscriptionStatus}
              onRefresh={refreshSubscription}
            />
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-2xl text-yellow-400 mr-3" />
            <span className="text-lg text-gray-300">Carregando planos...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex justify-center">
            <div className="bg-red-600/90 text-white font-semibold rounded-xl px-6 py-3 shadow-lg text-lg text-center w-full md:w-auto">
              Erro ao carregar dados: {error}
            </div>
          </div>
        )}

        {!loading && !error && planosDisponiveis.length === 0 && (
          <div className="mb-10 flex justify-center">
            <div className="bg-yellow-500/10 text-yellow-200 border border-yellow-500 px-6 py-4 rounded-xl text-center max-w-lg">
              Nenhum plano retornado pela API de billing. Tente novamente ou contate o suporte.
            </div>
          </div>
        )}

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
            Pagamento Anual <span className="ml-1 text-xs">(2 meses gratis)</span>
          </button>
        </div>

        {!loading && !error && planosDisponiveis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {planosDisponiveis
              .filter((plano) =>
                planoAtivo === "anual" ? plano.intervalo === "year" : plano.intervalo === "month"
              )
              .map((plano) => {
                const planKey = plano.key;
                const isCurrentPlan = subscription?.planKey === planKey;

                return (
                  <div
                    key={plano.nome}
                    className={`relative rounded-2xl p-8 flex flex-col shadow-xl border-2 transition ${plano.destaque ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-800 hover:border-yellow-300"}`}
                  >
                    {plano.badge && (
                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${plano.destaque ? "bg-black text-yellow-300" : "bg-yellow-300 text-black"}`}
                      >
                        {plano.badge}
                      </span>
                    )}
                    <div className="text-2xl font-extrabold mb-1">{plano.nome}</div>
                    <div className="text-xl font-bold mb-2">
                      {plano.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 2,
                      })}
                      <span className="text-sm text-neutral-400">
                        /{plano.intervalo === "year" ? "ano" : "mes"}
                      </span>
                    </div>
                    <ul className="mb-4 space-y-1">
                      {plano.recursos.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-base">
                          <span
                            className={`font-bold ${plano.destaque ? "text-yellow-900" : "text-yellow-400"}`}
                          >
                            V
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {plano.limites.map((limite, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${plano.destaque ? "bg-yellow-300 text-black" : "bg-neutral-700 text-yellow-200"}`}
                        >
                          {limite}
                        </span>
                      ))}
                    </div>
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
