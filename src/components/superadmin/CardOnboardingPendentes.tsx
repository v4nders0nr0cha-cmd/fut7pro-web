import React from "react";

type Onboarding = {
  racha: string;
  status: "completo" | "parcial" | "incompleto";
  percent: number;
  etapasConcluidas: number;
  etapasTotais: number;
};

interface Props {
  onboardings: Onboarding[];
}

const CardOnboardingPendentes: React.FC<Props> = ({ onboardings }) => {
  const pendentes = onboardings.filter((o) => o.status !== "completo");
  if (pendentes.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-yellow-900/60 to-zinc-900/80 border border-yellow-700 rounded-xl p-4 mb-5 shadow flex flex-col gap-2">
      <div className="font-bold text-yellow-400 mb-1 flex items-center gap-2">
        <span>Rachas com onboarding pendente</span>
        <span className="ml-2 text-xs text-zinc-300">
          (finalize para liberar todos os recursos)
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {pendentes.map((o) => (
          <div
            key={o.racha}
            className="flex flex-col bg-zinc-950/80 border border-yellow-700 rounded-lg px-4 py-2 min-w-[170px] max-w-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-300">{o.racha}</span>
              <span className="text-xs text-zinc-400">
                {o.etapasConcluidas}/{o.etapasTotais} etapas
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded mt-1">
              <div
                className={`h-2 rounded bg-yellow-400`}
                style={{ width: `${o.percent}%` }}
                aria-label={`Onboarding ${o.percent}% completo`}
              />
            </div>
            <span className="text-xs text-yellow-500 mt-1">
              {o.status === "parcial" ? "Em andamento" : "Incompleto"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardOnboardingPendentes;
