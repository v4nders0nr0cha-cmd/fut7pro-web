"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import SubscriptionStatusCard from "@/components/billing/SubscriptionStatusCard";
import BillingAPI, { type Plan } from "@/lib/api/billing";
import useSubscription from "@/hooks/useSubscription";

export default function PlanosLimitesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const tenantId = user?.tenantId;
  const payerEmail = user?.email;
  const payerName = user?.name || payerEmail || "Administrador";

  const { subscription, plans, planMeta, subscriptionStatus, loading, error, refreshSubscription } =
    useSubscription(tenantId);

  const [planoAtivo, setPlanoAtivo] = useState<"mensal" | "anual">("mensal");
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  const planosDisponiveis = useMemo(() => {
    return [...plans]
      .filter((plan) => plan.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [plans]);

  const planoAtual = useMemo(
    () => plans.find((plan) => plan.key === subscription?.planKey),
    [plans, subscription?.planKey]
  );
  const annualNoteLabel =
    planMeta && planMeta.annualNote !== undefined ? planMeta.annualNote : "2 meses gratis";

  useEffect(() => {
    if (subscription?.planKey) {
      const isAnual =
        subscription.planKey.includes("yearly") || subscription.planKey.includes("anual");
      setPlanoAtivo(isAnual ? "anual" : "mensal");
    }
  }, [subscription]);

  const handleAssinarPlano = async (plan: Plan) => {
    if (!tenantId || !payerEmail) {
      alert("Dados da conta ausentes. Refaca login ou complete seu perfil para assinar.");
      return;
    }

    try {
      if (plan.ctaType === "contact") {
        const email = plan.contactEmail || "social@fut7pro.com.br";
        const subject = `Solicitar ${plan.label} - ${tenantId || "Fut7Pro"}`;
        const body =
          `Ola, quero solicitar o plano ${plan.label} para o racha ${tenantId || ""}.` +
          `\n\nNome: ${payerName || "Administrador"}` +
          `\nE-mail: ${payerEmail}`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return;
      }

      if (plan.requiresUpfront && plan.key !== "monthly_enterprise") {
        alert("Este plano exige contato comercial para ativacao.");
        return;
      }

      setIsCreatingSubscription(true);

      if (plan.requiresUpfront && plan.key === "monthly_enterprise") {
        const result = await BillingAPI.startEnterpriseMonthly({
          tenantId,
          payerEmail,
          payerName,
        });

        window.open(result.preapproval?.url, "_blank");
        alert(`PIX gerado! QR Code: ${result.pix.qrCode}`);
      } else {
        const result = await BillingAPI.createSubscription({
          tenantId,
          planKey: plan.key,
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
        {planMeta?.bannerTitle && (
          <div className="mb-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-4 text-yellow-100">
            <p className="text-sm md:text-base font-semibold">{planMeta.bannerTitle}</p>
            {planMeta.bannerSubtitle && (
              <p className="text-xs text-yellow-100/70 mt-1">{planMeta.bannerSubtitle}</p>
            )}
          </div>
        )}

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
              planLabel={planoAtual?.label}
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
            Pagamento Anual{" "}
            {annualNoteLabel ? <span className="ml-1 text-xs">({annualNoteLabel})</span> : null}
          </button>
        </div>

        {!loading && !error && planosDisponiveis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {planosDisponiveis
              .filter((plan) =>
                planoAtivo === "anual" ? plan.interval === "year" : plan.interval === "month"
              )
              .map((plan) => {
                const isCurrentPlan = subscription?.planKey === plan.key;
                const features = plan.features?.length ? plan.features : [];
                const limits = plan.limits?.length ? plan.limits : ["Limites conforme contrato"];
                const isHighlight = Boolean(plan.highlight);
                const isContact = plan.ctaType === "contact";
                const buttonLabel =
                  plan.ctaLabel ||
                  (plan.interval === "year" ? "Assinar plano anual" : "Assinar plano mensal");

                return (
                  <div
                    key={plan.key}
                    className={`relative rounded-2xl p-8 flex flex-col shadow-xl border-2 transition ${isHighlight ? "bg-yellow-400 text-black border-yellow-400" : "bg-neutral-900 text-white border-neutral-800 hover:border-yellow-300"}`}
                  >
                    {plan.badge && (
                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${isHighlight ? "bg-black text-yellow-300" : "bg-yellow-300 text-black"}`}
                      >
                        {plan.badge}
                      </span>
                    )}
                    <div className="text-2xl font-extrabold mb-1">{plan.label}</div>
                    <div className="text-xl font-bold mb-1">
                      {plan.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 2,
                      })}
                      <span className="text-sm text-neutral-400">
                        /{plan.interval === "year" ? "ano" : "mes"}
                      </span>
                    </div>
                    {plan.paymentNote && (
                      <p
                        className={`mb-3 text-xs ${isHighlight ? "text-black/70" : "text-neutral-400"}`}
                      >
                        {plan.paymentNote}
                      </p>
                    )}
                    {plan.description && (
                      <p
                        className={`mb-4 text-sm ${isHighlight ? "text-black/80" : "text-neutral-300"}`}
                      >
                        {plan.description}
                      </p>
                    )}
                    <ul className="mb-4 space-y-1">
                      {features.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-base">
                          <span
                            className={`font-bold ${isHighlight ? "text-yellow-900" : "text-yellow-400"}`}
                          >
                            V
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {limits.map((limite, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${isHighlight ? "bg-yellow-300 text-black" : "bg-neutral-700 text-yellow-200"}`}
                        >
                          {limite}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAssinarPlano(plan)}
                      disabled={isCreatingSubscription || isCurrentPlan}
                      className={`mt-auto px-6 py-2 rounded-xl font-bold ${
                        isCurrentPlan
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : isHighlight
                            ? "bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black border-2 border-black"
                            : isContact
                              ? "bg-neutral-800 text-yellow-200 hover:bg-neutral-700 border border-yellow-400"
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
                        buttonLabel
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
