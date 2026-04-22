"use client";

import { FaFileAlt } from "react-icons/fa";
import Link from "next/link";
import type { Subscription, SubscriptionStatus } from "@/lib/api/billing";

type PlanoTipo = "trial" | "gratuito" | "mensal" | "mensal-marketing" | "anual" | "anual-marketing";

interface CardPlanoAtualProps {
  subscription?: Subscription | null;
  status?: SubscriptionStatus | null;
  loading?: boolean;
  tipoPlano?: PlanoTipo;
}

function mapTipoPlano(subscription?: Subscription | null, fallback?: PlanoTipo): PlanoTipo {
  if (!subscription) return fallback ?? "trial";
  if (subscription.status === "trialing") return "trial";
  const key = subscription.planKey || "";
  if (key.includes("marketing") && key.includes("year")) return "anual-marketing";
  if (key.includes("marketing") && key.includes("month")) return "mensal-marketing";
  if (key.includes("year")) return "anual";
  if (key.includes("free") || key.includes("gratuito")) return "gratuito";
  return "mensal";
}

function labelPlano(tipo: PlanoTipo) {
  switch (tipo) {
    case "gratuito":
      return "Grátis";
    case "trial":
      return "Teste grátis";
    case "mensal":
      return "Mensal Essencial";
    case "mensal-marketing":
      return "Mensal + Marketing";
    case "anual":
      return "Anual Essencial";
    case "anual-marketing":
      return "Anual + Marketing";
    default:
      return "Plano";
  }
}

function formatDate(date?: string | null) {
  if (!date) return null;
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString("pt-BR");
}

export default function CardPlanoAtual({
  subscription,
  status,
  loading,
  tipoPlano,
}: CardPlanoAtualProps) {
  if (loading) {
    return (
      <div className="bg-[#23272F] rounded-xl p-6 flex flex-col h-full min-h-[140px] shadow gap-3 justify-between animate-pulse">
        <div className="flex items-center gap-4">
          <div className="bg-[#222f3e] rounded-full p-3">
            <FaFileAlt className="text-[#f5f7fa] w-8 h-8" />
          </div>
          <div>
            <div className="text-gray-300 text-sm font-medium">Plano atual</div>
            <div className="h-6 w-40 bg-zinc-700 rounded mt-1" />
          </div>
        </div>
        <div className="h-5 w-full bg-zinc-800 rounded" />
      </div>
    );
  }

  const tipo = mapTipoPlano(subscription, tipoPlano ?? "trial");
  const label = labelPlano(tipo);
  const access = status?.access ?? subscription?.access ?? null;
  const financial =
    status?.financialStatus ??
    status?.financial ??
    subscription?.financialStatus ??
    subscription?.financial ??
    null;
  const isCompensated = access?.accessStatus === "LIBERADO_POR_COMPENSACAO";
  const isTrial = subscription?.status === "trialing" || tipo === "trial";
  const isAtivo =
    isCompensated || access?.canAccess || status?.active || subscription?.status === "active";
  const isPendente =
    subscription?.status === "past_due" ||
    financial?.code === "PENDENTE" ||
    financial?.code === "VENCIDO" ||
    financial?.code === "EM_APROVACAO" ||
    status?.preapproval === "pending" ||
    status?.upfront === "pending";

  const dataFim =
    access?.effectiveAccessUntil ??
    (isTrial ? subscription?.trialEnd : subscription?.currentPeriodEnd || subscription?.trialEnd) ??
    null;
  const dataFormatada = formatDate(dataFim);

  let mensagem = "";
  if (isCompensated) {
    const untilLabel = dataFormatada ? ` até ${dataFormatada}` : "";
    const financialIssue = financial?.label?.toLowerCase();
    mensagem = financialIssue
      ? `Seu plano está com status financeiro ${financialIssue}, mas o acesso ao painel foi liberado temporariamente por compensação${untilLabel}.`
      : `Acesso liberado por compensação${untilLabel}. Você pode usar o painel normalmente durante esse período.`;
  } else if (isTrial) {
    mensagem = dataFormatada
      ? `Teste válido até ${dataFormatada}. Converta seu teste para não perder o acesso.`
      : "Ative seu plano para liberar financeiro, cobrança e publicação automática.";
  } else if (isPendente) {
    mensagem = "Pagamento pendente ou em aprovação. Regularize para manter o painel ativo.";
  } else if (isAtivo) {
    mensagem = dataFormatada
      ? `Plano ativo. Próximo ciclo até ${dataFormatada}.`
      : "Plano ativo e cobranças recorrentes habilitadas.";
  } else {
    mensagem = "Nenhum plano ativo. Clique para escolher um plano e destravar os recursos premium.";
  }

  const ctaHref = isAtivo
    ? "/admin/financeiro/planos-limites?faturas=1"
    : "/admin/financeiro/planos-limites";
  const ctaLabel = isAtivo ? "Ver faturas" : isTrial ? "Ativar plano" : "Gerenciar plano";

  const statusBadge = isCompensated
    ? "ACESSO LIBERADO"
    : isPendente
      ? financial?.label?.toUpperCase() || "PENDENTE"
      : isTrial
        ? "TESTE"
        : isAtivo
          ? "ATIVO"
          : "SEM PLANO";

  return (
    <div className="bg-[#23272F] rounded-xl p-6 flex flex-col h-full min-h-[160px] shadow gap-3 justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-[#222f3e] rounded-full p-3">
          <FaFileAlt className="text-[#f5f7fa] w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="text-gray-300 text-sm font-medium flex items-center gap-2">
            Plano atual
            <span className="text-[11px] px-2 py-[2px] rounded-full bg-[#1f2937] text-[#00d3d4] font-bold">
              {statusBadge}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-extrabold text-2xl">{label}</span>
          </div>
        </div>
        <Link
          href={ctaHref}
          className="text-[#00d3d4] text-sm font-semibold underline hover:text-[#24e8fa] transition"
        >
          {ctaLabel}
        </Link>
      </div>
      <div className="mt-3 text-sm text-white bg-gradient-to-r from-[#1a222f] via-[#1b2432] to-[#181B20] rounded-lg p-3">
        {mensagem}
      </div>
    </div>
  );
}
