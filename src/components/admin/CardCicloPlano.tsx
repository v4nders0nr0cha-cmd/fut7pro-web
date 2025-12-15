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

export default function CardCicloPlano({
  subscription,
  status,
  loading,
  tipoPlano,
  diasRestantes: diasRestantesProp,
}: CardCicloPlanoProps) {
  const alvo = subscription?.trialEnd || subscription?.currentPeriodEnd || null;
  const diasRestantes = diasRestantesProp ?? calcDiasRestantes(alvo);
  const isTrial = subscription?.status === "trialing" || tipoPlano === "trial";
  const isAtivo = status?.active || subscription?.status === "active";
  const isPendente =
    subscription?.status === "past_due" ||
    status?.preapproval === "pending" ||
    status?.upfront === "pending";

  const mensagem = useMemo(() => {
    if (isTrial) {
      if (diasRestantes > 7) {
        return "O jogo esta rolando, mas a partida tem hora para acabar. Garanta seu plano e siga no comando.";
      }
      if (diasRestantes > 2) {
        return "Esta no segundo tempo! Falta pouco para o apito final. Ative seu plano.";
      }
      if (diasRestantes === 2) {
        return "Ja estamos nos acrescimos! Nao deixe o time na mao. Garanta o plano agora.";
      }
      if (diasRestantes === 1) {
        return "Ultimos minutos de jogo! Corra para ativar seu plano.";
      }
      if (diasRestantes <= 0) {
        return "Tempo esgotado! Trial encerrado. Ative um plano para manter o acesso.";
      }
    }
    if (isPendente) {
      return "Ciclo com pagamento pendente. Regularize para manter o painel destravado.";
    }
    if (!isAtivo && !isTrial) {
      return "Sem ciclo ativo. Ative ou renove um plano para manter os recursos premium.";
    }
    return null;
  }, [diasRestantes, isTrial, isAtivo, isPendente]);

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
          <div className="text-gray-300 text-sm font-medium">Ciclo do plano</div>
          <div className="flex items-end gap-1">
            <span className="text-white font-extrabold text-3xl">
              {diasRestantes > 0 ? diasRestantes : 0}
            </span>
            <span className="text-[#00d3d4] font-semibold text-lg">dias</span>
          </div>
          <span className="text-xs text-gray-400">
            {isTrial ? "para acabar o teste" : "para finalizar o ciclo"}
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
