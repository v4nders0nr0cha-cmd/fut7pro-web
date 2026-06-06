"use client";

import { useMemo } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import type { Subscription, SubscriptionStatus } from "@/lib/api/billing";

type PlanoTipo = "trial" | "gratuito" | "mensal" | "mensal-marketing" | "anual" | "anual-marketing";

interface CardCicloPlanoProps {
  subscription?: Subscription | null;
  status?: SubscriptionStatus | null;
  loading?: boolean;
  tipoPlano?: PlanoTipo;
  diasRestantes?: number;
}

function calcDiasRestantes(date?: string | null) {
  if (!date) return 0;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function resolveDiasRestantes(
  backendDays?: number | null,
  effectiveAccessUntil?: string | null,
  fallbackDate?: string | null
) {
  if (typeof backendDays === "number") return Math.max(0, backendDays);
  return calcDiasRestantes(effectiveAccessUntil || fallbackDate);
}

function formatCurrencyFromCents(value?: number | null) {
  if (value === null || value === undefined) return null;
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function resolvePlanLabel(planKey?: string | null) {
  const key = planKey || "";
  if (key.includes("marketing") && key.includes("year")) return "Essencial + Marketing anual";
  if (key.includes("marketing")) return "Essencial + Marketing";
  if (key.includes("year")) return "Anual Essencial";
  if (key.includes("essential") || key.includes("month")) return "Mensal Essencial";
  return null;
}

function resolveBillingPeriodLabel(subscription?: Subscription | null) {
  const key = (subscription?.planKey || "").toLowerCase();
  const isYearly =
    subscription?.interval === "year" || key.includes("year") || key.includes("anual");
  return isYearly ? "ano" : "mês";
}

function resolveRecurringPrice(subscription?: Subscription | null) {
  const pricing = subscription?.pricingPreview;
  const recurringAmount =
    pricing?.couponAppliesToRecurring || pricing?.recurringDiscountApplied
      ? (pricing.recurringAmountCents ?? pricing.totalCents)
      : subscription?.amount;
  const baseAmount = pricing?.baseAmountCents ?? subscription?.amount ?? null;
  const hasRecurringCoupon =
    Boolean(subscription?.couponCode) &&
    typeof recurringAmount === "number" &&
    typeof baseAmount === "number" &&
    recurringAmount > 0 &&
    recurringAmount < baseAmount;

  return {
    recurringAmount,
    hasRecurringCoupon,
  };
}

export default function CardCicloPlano({
  subscription,
  status,
  loading,
  tipoPlano,
  diasRestantes: diasRestantesProp,
}: CardCicloPlanoProps) {
  const access = status?.access ?? subscription?.access ?? null;
  const isCompensated = access?.accessStatus === "LIBERADO_POR_COMPENSACAO";
  const alvo = subscription?.trialEnd || subscription?.currentPeriodEnd || null;
  const diasRestantes =
    diasRestantesProp ??
    resolveDiasRestantes(access?.daysRemaining, access?.effectiveAccessUntil, alvo);
  const isTrial = subscription?.status === "trialing" || tipoPlano === "trial";
  const isAtivo =
    isCompensated || access?.canAccess || status?.active || subscription?.status === "active";
  const isPendente =
    !isCompensated &&
    (subscription?.status === "past_due" ||
      status?.preapproval === "pending" ||
      status?.upfront === "pending");
  const planLabel = resolvePlanLabel(subscription?.planKey);
  const recurringPrice = resolveRecurringPrice(subscription);
  const recurringAmountLabel = formatCurrencyFromCents(recurringPrice.recurringAmount);
  const billingPeriodLabel = resolveBillingPeriodLabel(subscription);

  const mensagem = useMemo(() => {
    if (isCompensated) {
      return "Seu racha recebeu uma compensação de acesso temporária. Aproveite esse período extra para continuar usando o painel normalmente.";
    }
    if (isTrial) {
      const planContext = planLabel ? ` do ${planLabel}` : "";
      const recurringContext = recurringAmountLabel
        ? recurringPrice.hasRecurringCoupon
          ? ` Depois do teste, seu cupom mantém a recorrência em ${recurringAmountLabel}/${billingPeriodLabel}.`
          : ` Depois do teste, o valor recorrente será ${recurringAmountLabel}/${billingPeriodLabel}.`
        : "";
      if (diasRestantes > 7) {
        return `Teste${planContext} em andamento.${recurringContext}`;
      }
      if (diasRestantes > 2) {
        return `Falta pouco para acabar o teste${planContext}.${recurringContext}`;
      }
      if (diasRestantes === 2) {
        return `Seu teste${planContext} termina em 2 dias.${recurringContext}`;
      }
      if (diasRestantes === 1) {
        return `Seu teste${planContext} termina amanhã.${recurringContext}`;
      }
      if (diasRestantes <= 0) {
        return `Teste${planContext} encerrado. Ative o pagamento para manter o acesso.`;
      }
    }
    if (isPendente) {
      return "Ciclo com pagamento pendente. Regularize para manter o painel destravado.";
    }
    if (!isAtivo && !isTrial) {
      return "Sem ciclo ativo. Ative ou renove um plano para manter os recursos premium.";
    }
    return null;
  }, [
    diasRestantes,
    isTrial,
    isAtivo,
    isPendente,
    isCompensated,
    planLabel,
    recurringAmountLabel,
    billingPeriodLabel,
    recurringPrice.hasRecurringCoupon,
  ]);

  if (loading) {
    return (
      <div className="bg-[#23272F] rounded-xl p-6 flex flex-col h-full min-h-[140px] shadow gap-3 justify-between animate-pulse">
        <div className="flex items-center gap-4">
          <div className="bg-[#222f3e] rounded-full p-3">
            <FaCalendarAlt className="text-[#00d3d4] w-8 h-8" />
          </div>
          <div>
            <div className="text-gray-300 text-sm font-medium">Ciclo do plano</div>
            <div className="h-6 w-24 bg-zinc-700 rounded mt-1" />
          </div>
        </div>
        <div className="h-5 w-full bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[#23272F] rounded-xl p-6 flex flex-col h-full min-h-[160px] shadow gap-3 justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-[#222f3e] rounded-full p-3">
          <FaCalendarAlt className="text-[#00d3d4] w-8 h-8" />
        </div>
        <div>
          <div className="text-gray-300 text-sm font-medium">
            {isCompensated ? "Acesso liberado" : "Ciclo do plano"}
          </div>
          <div className="flex items-end gap-1">
            <span className="text-white font-extrabold text-3xl">
              {diasRestantes > 0 ? diasRestantes : 0}
            </span>
            <span className="text-[#00d3d4] font-semibold text-lg">dias</span>
          </div>
          <span className="text-xs text-gray-400">
            {isCompensated
              ? "restantes de acesso"
              : isTrial
                ? planLabel
                  ? `para acabar o teste do ${planLabel}`
                  : "para acabar o teste"
                : "para finalizar o ciclo"}
          </span>
        </div>
      </div>
      {mensagem && (
        <div className="mt-3 text-sm text-white bg-gradient-to-r from-[#1a222f] via-[#1b2432] to-[#181B20] rounded-lg p-3">
          {mensagem}
        </div>
      )}
    </div>
  );
}
