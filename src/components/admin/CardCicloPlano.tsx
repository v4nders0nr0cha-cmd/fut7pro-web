"use client";

import { useMemo } from "react";
import { FaCalendarAlt } from "react-icons/fa";

// Props de exemplo, ajuste para dados reais do backend depois
interface CardCicloPlanoProps {
  diasRestantes: number; // Dias restantes do ciclo
  tipoPlano: "trial" | "gratuito" | "mensal" | "mensal-marketing" | "anual" | "anual-marketing";
}

export default function CardCicloPlano({ diasRestantes, tipoPlano }: CardCicloPlanoProps) {
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
    <div className="bg-[#23272F] rounded-xl p-6 flex flex-col h-full min-h-[140px] shadow gap-3 justify-between">
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
          <span className="text-xs text-gray-400">para finalizar o ciclo</span>
        </div>
      </div>
      {mensagem && (
        <div className="mt-3 text-sm text-white bg-gradient-to-r from-[#1a222f] via-[#1b2432] to-[#181B20] rounded-lg p-2">
          {mensagem}
        </div>
      )}
    </div>
  );
}
