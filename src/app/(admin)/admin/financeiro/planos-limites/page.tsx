"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import BillingAPI, {
  type ChargePricing,
  type Plan,
  type PixChargeResponse,
} from "@/lib/api/billing";
import useSubscription from "@/hooks/useSubscription";

function formatDate(value?: string | null) {
  if (!value) return "N/D";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "N/D";
  return dt.toLocaleDateString("pt-BR");
}

function formatCurrencyFromCents(value?: number | null) {
  if (value === null || value === undefined) return "N/D";
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function resolveIntervalLabel(planKey?: string | null, interval?: string | null) {
  if (interval === "year") return "Anual";
  if (interval === "month") return "Mensal";
  const key = (planKey || "").toLowerCase();
  if (key.includes("year") || key.includes("anual")) return "Anual";
  return "Mensal";
}

function resolveStatusMeta(status?: string | null) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "trialing") {
    return { label: "Teste ativo", className: "bg-blue-500/15 text-blue-200 border-blue-500/30" };
  }
  if (normalized === "active") {
    return { label: "Ativa", className: "bg-green-500/15 text-green-200 border-green-500/30" };
  }
  if (normalized === "past_due") {
    return {
      label: "Pagamento pendente",
      className: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30",
    };
  }
  if (normalized === "paused") {
    return { label: "Pausada", className: "bg-orange-500/15 text-orange-200 border-orange-500/30" };
  }
  if (normalized === "canceled") {
    return { label: "Cancelada", className: "bg-red-500/15 text-red-200 border-red-500/30" };
  }
  if (normalized === "expired") {
    return { label: "Expirada", className: "bg-red-500/15 text-red-200 border-red-500/30" };
  }
  return { label: "Indefinido", className: "bg-zinc-500/20 text-zinc-200 border-zinc-500/30" };
}

function calcDaysRemaining(target?: string | null) {
  if (!target) return null;
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function extractApiError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const raw = error.message?.trim();
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as { message?: string | string[]; error?: string };
    if (Array.isArray(parsed.message) && parsed.message.length > 0) {
      return parsed.message.join(" ");
    }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error;
    }
  } catch {
    // message ja esta em texto simples
  }

  return raw || fallback;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "0%";
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

function buildFallbackPricing(baseAmountCents?: number | null): ChargePricing | null {
  if (baseAmountCents === null || baseAmountCents === undefined) return null;
  return {
    isFirstPayment: false,
    firstPaymentDiscountApplied: false,
    baseAmountCents,
    discountPct: 0,
    discountCents: 0,
    totalCents: baseAmountCents,
  };
}

function buildPixPricingFromInvoice(
  pixCharge: PixChargeResponse | null,
  paymentPricing: ChargePricing | null
): ChargePricing | null {
  if (pixCharge?.pricing) return pixCharge.pricing;

  const invoiceAmountCents = pixCharge?.invoice?.amount;
  if (invoiceAmountCents === null || invoiceAmountCents === undefined) {
    return paymentPricing;
  }

  const baseAmountCents = paymentPricing?.baseAmountCents ?? invoiceAmountCents;
  const totalCents = invoiceAmountCents;
  const discountCents = Math.max(baseAmountCents - totalCents, 0);
  const discountPct =
    baseAmountCents > 0 ? Number(((discountCents / baseAmountCents) * 100).toFixed(2)) : 0;

  return {
    isFirstPayment: paymentPricing?.isFirstPayment ?? false,
    firstPaymentDiscountApplied: paymentPricing?.firstPaymentDiscountApplied ?? discountCents > 0,
    baseAmountCents,
    discountPct: paymentPricing?.discountPct ?? discountPct,
    discountCents: paymentPricing?.discountCents ?? discountCents,
    totalCents,
  };
}

export default function PlanosLimitesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const tenantId = user?.tenantId;
  const payerEmail = user?.email;
  const payerName = user?.name || payerEmail || "Administrador";

  const { subscription, plans, planMeta, subscriptionStatus, loading, error, refreshSubscription } =
    useSubscription(tenantId);

  const [planoAtivo, setPlanoAtivo] = useState<"mensal" | "anual">("mensal");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"switch" | "payment" | "pix" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixCharge, setPixCharge] = useState<PixChargeResponse | null>(null);
  const [checkoutPricing, setCheckoutPricing] = useState<ChargePricing | null>(null);
  const [recurringAccepted, setRecurringAccepted] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("faturas") === "1") {
      setShowInvoicesModal(true);
    }
  }, []);

  const statusMeta = resolveStatusMeta(subscription?.status);
  const isTrial = subscription?.status === "trialing";
  const pendingPayment =
    subscription?.status === "past_due" ||
    subscriptionStatus?.preapproval === "pending" ||
    subscriptionStatus?.upfront === "pending";
  const now = new Date();
  const trialExpired =
    isTrial && subscription?.trialEnd ? new Date(subscription.trialEnd) < now : false;
  const periodExpired =
    !isTrial && subscription?.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd) < now
      : false;
  const billingBlocked =
    Boolean(subscription) &&
    (trialExpired ||
      periodExpired ||
      subscription?.status === "past_due" ||
      subscription?.status === "expired");
  const canSwitchPlan = subscription?.status === "trialing";

  const planLabel = planoAtual?.label || subscription?.planKey || "Plano nao definido";
  const intervalLabel = resolveIntervalLabel(subscription?.planKey, subscription?.interval);
  const canUsePix = Boolean(subscription?.id) && !subscription?.requiresUpfront;

  const periodStart = isTrial ? subscription?.trialStart : subscription?.currentPeriodStart;
  const periodEnd = isTrial
    ? subscription?.trialEnd
    : subscription?.currentPeriodEnd || subscription?.trialEnd;
  const periodLabel =
    periodStart && periodEnd ? `${formatDate(periodStart)} - ${formatDate(periodEnd)}` : "N/D";

  const cycleEnd = subscription?.currentPeriodEnd || subscription?.trialEnd || null;
  const daysRemaining = calcDaysRemaining(cycleEnd);
  const cycleLabel = daysRemaining !== null ? `${daysRemaining}` : "--";

  const invoices = subscription?.invoices ?? [];
  const paymentPricing =
    checkoutPricing || subscription?.pricingPreview || buildFallbackPricing(subscription?.amount);
  const pixPricing = useMemo(
    () => buildPixPricingFromInvoice(pixCharge, paymentPricing),
    [paymentPricing, pixCharge]
  );
  const hasFirstPaymentDiscount = Boolean(paymentPricing?.firstPaymentDiscountApplied);
  const hasCouponBenefits = Boolean(subscription?.couponCode && hasFirstPaymentDiscount);

  const openPaymentModal = () => {
    if (!subscription?.id) {
      setActionError("Assinatura nao encontrada para este racha.");
      return;
    }

    setActionError(null);
    setRecurringAccepted(false);
    setPixCopied(false);
    setPixCharge(null);
    setCheckoutPricing(subscription?.pricingPreview || null);
    setShowPixModal(false);
    setShowPaymentModal(true);
  };

  const handleRecurringPayment = async () => {
    if (!subscription?.id) {
      setActionError("Assinatura nao encontrada para este racha.");
      return;
    }

    setActionLoading("payment");
    setActionError(null);

    try {
      const backUrl = window.location.href;
      const result = await BillingAPI.activateSubscription(subscription.id, backUrl);
      if (result.pricing) {
        setCheckoutPricing(result.pricing);
      }
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setActionError("Nao foi possivel gerar o link de pagamento. Tente novamente.");
    } catch (err) {
      console.error(err);
      setActionError(extractApiError(err, "Erro ao atualizar pagamento. Tente novamente."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePixCharge = async () => {
    if (!subscription?.id) {
      setActionError("Assinatura nao encontrada para este racha.");
      return;
    }

    setActionLoading("pix");
    setActionError(null);
    setPixCopied(false);

    try {
      const result = await BillingAPI.createPixCharge(subscription.id, payerName);
      setPixCharge(result);
      if (result.pricing) {
        setCheckoutPricing(result.pricing);
      }
      setShowPaymentModal(false);
      setShowPixModal(true);
    } catch (err) {
      console.error(err);
      setActionError(extractApiError(err, "Erro ao gerar PIX. Tente novamente."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyPix = async () => {
    if (!pixCharge?.pix?.qrCode) return;
    try {
      await navigator.clipboard.writeText(pixCharge.pix.qrCode);
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 2000);
    } catch {
      setPixCopied(false);
    }
  };

  const handleOpenPlan = (plan: Plan) => {
    setActionError(null);
    setSelectedPlan(plan);
    if (plan.ctaType === "contact") {
      setShowEnterpriseModal(true);
      return;
    }
    setShowSwitchModal(true);
  };

  const handleConfirmSwitch = async () => {
    if (!subscription?.id || !selectedPlan) {
      setActionError("Assinatura nao encontrada para esta troca.");
      return;
    }

    if (!canSwitchPlan) {
      setActionError("Troca automatica disponivel apenas durante o periodo de teste.");
      return;
    }

    setActionLoading("switch");
    setActionError(null);

    try {
      await BillingAPI.changeSubscriptionPlan(subscription.id, selectedPlan.key);
      await refreshSubscription();
      setShowSwitchModal(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      setActionError(extractApiError(err, "Nao foi possivel trocar o plano. Tente novamente."));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Head>
        <title>Planos & Limites | Fut7Pro</title>
        <meta
          name="description"
          content="Central de assinatura do Fut7Pro. Acompanhe seu plano atual, ciclo, pagamentos e atualize quando precisar."
        />
        <meta
          name="keywords"
          content="assinatura fut7, planos fut7pro, ciclo, faturas, pagamento, admin racha"
        />
      </Head>
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3">Planos & Limites</h1>
        <p className="text-base text-neutral-300 mb-6 max-w-2xl">
          Central de assinatura do seu racha. Confira o plano atual, ciclo, pagamentos e troque
          quando quiser.
        </p>

        {!tenantId && (
          <div className="mb-6 rounded-xl border border-red-500 bg-red-500/10 px-4 py-3 text-red-100">
            Nao foi possivel identificar seu tenant. Refaca login para visualizar a assinatura.
          </div>
        )}

        {actionError && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100">
            {actionError}
          </div>
        )}

        {billingBlocked && (
          <div className="mb-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-4 text-yellow-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Acesso ao painel bloqueado por pagamento.</p>
              <p className="text-xs text-yellow-100/80">
                Regularize o pagamento para liberar todas as funcionalidades do painel.
              </p>
            </div>
            <button
              type="button"
              onClick={openPaymentModal}
              className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
            >
              Regularizar pagamento
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#23272F] rounded-2xl border border-[#2b2b2b] p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Status da Assinatura</h2>
                <p className="text-sm text-gray-400">
                  O plano escolhido define o valor após o teste e mantem o painel ativo.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.className}`}
              >
                {statusMeta.label}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <span className="text-xs text-gray-500">Plano atual</span>
                <p className="text-base font-semibold text-white">
                  {planLabel} · {intervalLabel}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Periodo</span>
                <p className="text-base font-semibold text-white">{periodLabel}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Valor de referencia</span>
                <p className="text-base font-semibold text-white">
                  {formatCurrencyFromCents(subscription?.amount)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Status do pagamento</span>
                <p className="text-base font-semibold text-white">
                  {pendingPayment ? "Pendente" : "Em dia"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openPaymentModal}
                disabled={actionLoading !== null}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading === "payment" ? "Atualizando..." : "Atualizar pagamento"}
              </button>
              <button
                type="button"
                onClick={() => setShowInvoicesModal(true)}
                className="px-4 py-2 rounded-lg bg-[#1f2937] text-white border border-[#384152] hover:border-yellow-400"
              >
                Ver faturas
              </button>
            </div>
          </div>

          <div className="bg-[#23272F] rounded-2xl border border-[#2b2b2b] p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Ciclo do plano</h2>
                <p className="text-sm text-gray-400">
                  {isTrial ? "Periodo de teste ativo" : "Ciclo atual de assinatura"}
                </p>
              </div>
              <span className="text-2xl font-extrabold text-yellow-300">{cycleLabel} dias</span>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <span className="text-xs text-gray-500">Proximo vencimento</span>
                <p className="text-base font-semibold text-white">{formatDate(cycleEnd)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Mensagem</span>
                <p className="text-base font-semibold text-white">
                  {isTrial
                    ? "Pagando agora, voce nao perde o teste, o tempo comprado é acumulado."
                    : pendingPayment
                      ? "Pagamento pendente, regularize para manter o painel desbloqueado."
                      : "Ciclo em andamento. Tudo certo por aqui."}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                const buttonLabel = isCurrentPlan
                  ? "Plano atual"
                  : isContact
                    ? plan.ctaLabel || "Solicitar Enterprise"
                    : "Trocar para este plano";

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
                    {isCurrentPlan && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-green-500 text-white shadow-sm">
                        Plano atual
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
                      type="button"
                      onClick={() => handleOpenPlan(plan)}
                      disabled={actionLoading !== null || isCurrentPlan}
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
                      {actionLoading === "switch" && selectedPlan?.key === plan.key ? (
                        <>
                          <FaSpinner className="animate-spin inline mr-2" />
                          Processando...
                        </>
                      ) : isCurrentPlan ? (
                        <>
                          <FaCheckCircle className="inline mr-2" />
                          Plano atual
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

      {showPaymentModal && subscription && (
        <Modal onClose={() => setShowPaymentModal(false)}>
          <div className="w-full max-w-2xl bg-[#1b1f27] rounded-2xl p-6 border border-[#2b2b2b] shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Como deseja pagar?</h3>
            <p className="text-sm text-gray-300 mb-5">
              Escolha a forma de pagamento para liberar o painel do seu racha.
            </p>
            {actionError && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                {actionError}
              </div>
            )}
            {hasCouponBenefits && paymentPricing && (
              <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                <p className="font-semibold text-emerald-200">
                  Cupom de embaixador aplicado no seu racha.
                </p>
                <p className="mt-1">
                  Você ganhou +10 dias de teste (total de 30 dias) e{" "}
                  <strong>{formatPercent(paymentPricing.discountPct)}</strong> de desconto nesta
                  primeira cobrança. Nas próximas cobranças, o valor volta ao preço normal do plano.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#2b2b2b] bg-[#111418] p-4">
                <h4 className="text-sm font-bold text-white mb-1">Cartao ou boleto (recorrente)</h4>
                <p className="text-xs text-gray-400 mb-3">
                  O pagamento sera recorrente no Mercado Pago. Voce autoriza a cobranca automatica
                  conforme o plano escolhido.
                </p>
                <label className="flex items-start gap-2 text-xs text-gray-300 mb-3">
                  <input
                    type="checkbox"
                    checked={recurringAccepted}
                    onChange={(e) => setRecurringAccepted(e.target.checked)}
                    className="mt-0.5 accent-yellow-400"
                  />
                  <span>Li e concordo com a politica de cobranca recorrente.</span>
                </label>
                <button
                  type="button"
                  onClick={handleRecurringPayment}
                  disabled={!recurringAccepted || actionLoading === "payment"}
                  className="w-full px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 disabled:opacity-60"
                >
                  {actionLoading === "payment"
                    ? "Abrindo checkout..."
                    : "Continuar no Mercado Pago"}
                </button>
              </div>

              <div className="rounded-xl border border-[#2b2b2b] bg-[#111418] p-4">
                <h4 className="text-sm font-bold text-white mb-1">PIX</h4>
                <p className="text-xs text-gray-400 mb-3">
                  Geramos um PIX avulso para o ciclo <b>{intervalLabel.toLowerCase()}</b> do seu
                  plano.
                </p>
                <button
                  type="button"
                  onClick={handleCreatePixCharge}
                  disabled={!canUsePix || actionLoading === "pix"}
                  className="w-full px-4 py-2 rounded-lg bg-[#2b2b2b] text-white border border-[#384152] hover:border-yellow-400 disabled:opacity-60"
                >
                  {actionLoading === "pix" ? "Gerando PIX..." : "Gerar PIX"}
                </button>
                {!canUsePix && (
                  <p className="mt-2 text-[11px] text-gray-500">
                    PIX indisponivel para este plano no momento.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Plano atual: <b className="text-gray-200">{planLabel}</b> | Valor:{" "}
              <b className="text-gray-200">{formatCurrencyFromCents(subscription.amount)}</b>
            </div>
            {paymentPricing && (
              <div className="mt-3 rounded-xl border border-[#2b2b2b] bg-[#111418] p-3 text-xs text-gray-300">
                <p className="mb-2 font-semibold text-white">Resumo desta cobrança</p>
                <div className="flex items-center justify-between">
                  <span>Plano</span>
                  <span>{formatCurrencyFromCents(paymentPricing.baseAmountCents)}</span>
                </div>
                {paymentPricing.firstPaymentDiscountApplied && (
                  <div className="mt-1 flex items-center justify-between text-emerald-300">
                    <span>
                      Desconto cupom embaixador ({formatPercent(paymentPricing.discountPct)})
                    </span>
                    <span>-{formatCurrencyFromCents(paymentPricing.discountCents)}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-[#2b2b2b] pt-2 font-semibold text-white">
                  <span>
                    {paymentPricing.firstPaymentDiscountApplied
                      ? "Total do primeiro pagamento"
                      : "Total desta cobrança"}
                  </span>
                  <span>{formatCurrencyFromCents(paymentPricing.totalCents)}</span>
                </div>
                {paymentPricing.firstPaymentDiscountApplied && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    Desconto válido somente na primeira cobrança.
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {showPixModal && pixCharge && (
        <Modal onClose={() => setShowPixModal(false)}>
          <div className="w-full max-w-lg bg-[#1b1f27] rounded-2xl p-6 border border-[#2b2b2b] shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Pagamento via PIX</h3>
            <p className="text-sm text-gray-300 mb-4">
              Escaneie o QR Code ou copie o codigo. A liberacao do painel ocorre apos a confirmacao
              do pagamento.
            </p>

            <div className="bg-[#111418] rounded-xl border border-[#2b2b2b] p-4 flex flex-col items-center gap-3">
              {pixCharge.pix.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${pixCharge.pix.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-52 h-52 rounded-lg bg-white p-2"
                />
              ) : (
                <div className="text-xs text-gray-400">QR Code indisponivel.</div>
              )}
              {pixCharge.pix.qrCode && (
                <div className="w-full">
                  <div className="text-[11px] text-gray-400 mb-1">Codigo PIX</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCharge.pix.qrCode}
                      className="flex-1 rounded-lg bg-[#0f1318] border border-[#2b2b2b] px-3 py-2 text-xs text-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3 py-2 rounded-lg bg-yellow-400 text-black text-xs font-semibold hover:bg-yellow-300"
                    >
                      {pixCopied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>
              )}
              {pixCharge.pix.ticketUrl && (
                <a
                  href={pixCharge.pix.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-yellow-300 underline"
                >
                  Abrir link do PIX
                </a>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Periodo:{" "}
              <b className="text-gray-200">
                {formatDate(pixCharge.invoice.periodStart)} -{" "}
                {formatDate(pixCharge.invoice.periodEnd)}
              </b>
            </div>
            {pixPricing && (
              <div className="mt-3 rounded-xl border border-[#2b2b2b] bg-[#111418] p-3 text-xs text-gray-300">
                <p className="mb-2 font-semibold text-white">Resumo do PIX</p>
                <div className="flex items-center justify-between">
                  <span>Plano</span>
                  <span>{formatCurrencyFromCents(pixPricing.baseAmountCents)}</span>
                </div>
                {pixPricing.firstPaymentDiscountApplied && (
                  <div className="mt-1 flex items-center justify-between text-emerald-300">
                    <span>Desconto cupom embaixador ({formatPercent(pixPricing.discountPct)})</span>
                    <span>-{formatCurrencyFromCents(pixPricing.discountCents)}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-[#2b2b2b] pt-2 font-semibold text-white">
                  <span>
                    {pixPricing.firstPaymentDiscountApplied
                      ? "Total do primeiro pagamento"
                      : "Total desta cobrança"}
                  </span>
                  <span>{formatCurrencyFromCents(pixPricing.totalCents)}</span>
                </div>
                {pixPricing.firstPaymentDiscountApplied && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    Desconto válido somente na primeira cobrança.
                  </p>
                )}
              </div>
            )}
            {pixCharge.pix.expiresAt && (
              <div className="mt-2 text-xs text-gray-400">
                Valido ate: <b className="text-gray-200">{formatDate(pixCharge.pix.expiresAt)}</b>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPixModal(false)}
              className="mt-5 w-full px-4 py-2 rounded-lg bg-[#2b2b2b] text-gray-200 hover:bg-[#3a3a3a]"
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}

      {showSwitchModal && selectedPlan && (
        <Modal onClose={() => setShowSwitchModal(false)}>
          <div className="w-full max-w-lg bg-[#1b1f27] rounded-2xl p-6 border border-[#2b2b2b] shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Confirmar troca de plano</h3>
            <p className="text-sm text-gray-300 mb-4">
              Voce esta trocando de <b>{planLabel}</b> para <b>{selectedPlan.label}</b>.
            </p>
            <div className="text-sm text-gray-300 bg-[#111418] rounded-lg p-3 border border-[#2b2b2b]">
              {subscription?.status === "trialing" ? (
                <span>
                  A troca e imediata e nao altera a data final do teste. Seu teste termina em{" "}
                  <b>{formatDate(subscription?.trialEnd)}</b>.
                </span>
              ) : (
                <span>
                  Troca automatica disponivel apenas durante o periodo de teste. Fale com o suporte
                  para ajustar o plano.
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 rounded-lg bg-[#2b2b2b] text-gray-200 hover:bg-[#3a3a3a]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                disabled={!canSwitchPlan || actionLoading === "switch"}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 disabled:opacity-60"
              >
                {actionLoading === "switch"
                  ? "Trocando..."
                  : canSwitchPlan
                    ? "Confirmar troca"
                    : "Troca indisponivel"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showEnterpriseModal && selectedPlan && (
        <Modal onClose={() => setShowEnterpriseModal(false)}>
          <div className="w-full max-w-lg bg-[#1b1f27] rounded-2xl p-6 border border-[#2b2b2b] shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Solicitar Enterprise</h3>
            <p className="text-sm text-gray-300 mb-4">
              Esse plano e liberado mediante contato com nosso time. Envie um e-mail para iniciar a
              conversa.
            </p>
            <div className="text-sm text-gray-200 bg-[#111418] rounded-lg p-3 border border-[#2b2b2b] mb-4">
              <div>
                <span className="text-gray-400">Plano:</span> {selectedPlan.label}
              </div>
              <div>
                <span className="text-gray-400">E-mail:</span>{" "}
                <a
                  className="text-yellow-300 underline"
                  href={`mailto:${selectedPlan.contactEmail || "social@fut7pro.com.br"}?subject=${encodeURIComponent(
                    `Solicitar ${selectedPlan.label} - ${payerName || "Fut7Pro"}`
                  )}`}
                >
                  {selectedPlan.contactEmail || "social@fut7pro.com.br"}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowEnterpriseModal(false)}
              className="w-full px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300"
            >
              Entendi
            </button>
          </div>
        </Modal>
      )}

      {showInvoicesModal && (
        <Modal onClose={() => setShowInvoicesModal(false)}>
          <div className="w-full max-w-2xl bg-[#1b1f27] rounded-2xl p-6 border border-[#2b2b2b] shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Faturas do racha</h3>
            <p className="text-sm text-gray-300 mb-4">
              Histórico recente das suas cobranças e pagamentos.
            </p>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {invoices.length === 0 && (
                <div className="text-sm text-gray-400">
                  Nenhuma fatura encontrada ate o momento.
                </div>
              )}
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-[#111418] rounded-lg border border-[#2b2b2b] p-3"
                >
                  <div>
                    <div className="text-sm text-white font-semibold">
                      {formatDate(invoice.paidAt || invoice.periodStart || invoice.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Status: {invoice.status || "pendente"}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-yellow-300">
                    {formatCurrencyFromCents(invoice.amount)}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowInvoicesModal(false)}
              className="mt-5 w-full px-4 py-2 rounded-lg bg-[#2b2b2b] text-gray-200 hover:bg-[#3a3a3a]"
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/70 px-3 py-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl">{children}</div>
    </div>
  );
}
