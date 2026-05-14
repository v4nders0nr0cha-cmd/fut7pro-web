import type { LiveMatch } from "@/types/partida";

const STATUS_LABELS = {
  not_started: "Rodada não iniciada",
  in_progress: "Rodada em andamento",
  finished: "Rodada finalizada",
} as const;

type Props = {
  match: LiveMatch;
};

export function LiveMatchCard({ match }: Props) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-[#161616] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">
          {STATUS_LABELS[match.status]}
        </span>
        <span className="text-xs text-neutral-400">
          {new Date(match.date).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{match.teamA.name}</p>
        </div>
        <div className="rounded-xl border border-brand/40 bg-black px-4 py-2 text-center">
          <p className="text-2xl font-bold text-brand">
            {match.scoreA} x {match.scoreB}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{match.teamB.name}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {match.goals.length === 0 ? (
          <p className="text-xs text-neutral-400">Sem gols registrados ainda.</p>
        ) : (
          match.goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg bg-black/40 px-3 py-2 text-xs text-neutral-200"
            >
              <p>
                Gol:{" "}
                <span className="font-semibold text-white">{goal.scorer?.name ?? "Sem autor"}</span>
              </p>
              <p className="text-neutral-400">
                Assistência: {goal.assist?.name ?? "Sem assistência"}
              </p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
