"use client";

import { useMemo } from "react";
import { FaCalendarAlt } from "react-icons/fa";

// Props de exemplo, ajuste para dados reais do backend depois
interface CardCicloPlanoProps {
  diasRestantes: number; // Dias restantes do ciclo
  tipoPlano:
    | "trial"
    | "gratuito"
    | "mensal"
    | "mensal-marketing"
    | "anual"
    | "anual-marketing";
}

export default function CardCicloPlano({
  diasRestantes,
  tipoPlano,
}: CardCicloPlanoProps) {
  // Mensagem escalonada (urgência progressiva)
  const mensagem = useMemo(() => {
    if (tipoPlano !== "trial") return null;
    if (diasRestantes > 7) {
      return "O jogo tá rolando, mas a partida tem hora pra acabar! Garanta já seu plano e siga no comando.";
    } else if (diasRestantes > 2) {
      return "Tá no segundo tempo! Falta pouco pro apito final. Ative seu plano e mantenha o controle do seu racha.";
    } else if (diasRestantes === 2) {
      return "Já estamos nos acréscimos! Não deixe o seu time na mão. Garanta seu plano agora!";
    } else if (diasRestantes === 1) {
      return "Últimos minutos de jogo! Corra pra ativar seu plano e continuar no comando.";
    } else if (diasRestantes <= 0) {
      return "Tempo esgotado! Plano trial encerrado. Ative já seu plano para não perder o acesso.";
    }
  }, [diasRestantes, tipoPlano]);

  return (
    <div className="flex h-full min-h-[140px] flex-col justify-between gap-3 rounded-xl bg-[#23272F] p-6 shadow">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-[#222f3e] p-3">
          <FaCalendarAlt className="h-8 w-8 text-[#00d3d4]" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-300">
            Ciclo do plano
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-extrabold text-white">
              {diasRestantes > 0 ? diasRestantes : 0}
            </span>
            <span className="text-lg font-semibold text-[#00d3d4]">dias</span>
          </div>
          <span className="text-xs text-gray-400">para finalizar o ciclo</span>
        </div>
      </div>
      {mensagem && (
        <div className="mt-3 rounded-lg bg-gradient-to-r from-[#1a222f] via-[#1b2432] to-[#181B20] p-2 text-sm text-white">
          {mensagem}
        </div>
      )}
    </div>
  );
}
