"use client";

import type { TeamRankingEntry } from "@/hooks/usePublicTeamRankings";

interface ResponsiveTeamRankingProps {
  teams: TeamRankingEntry[];
  highlightMode?: "first";
}

const teamStats = [
  { key: "jogos", label: "Jogos" },
  { key: "vitorias", label: "Vitorias" },
  { key: "empates", label: "Empates" },
  { key: "derrotas", label: "Derrotas" },
] as const;

export default function ResponsiveTeamRanking({
  teams,
  highlightMode = "first",
}: ResponsiveTeamRankingProps) {
  if (teams.length === 0) {
    return <div className="py-8 text-center text-gray-400">Nenhum time encontrado.</div>;
  }

  return (
    <>
      <div className="space-y-3 md:hidden" aria-label="Classificacao em cards para mobile">
        {teams.map((team, index) => {
          const isFirst = highlightMode === "first" && index === 0;

          return (
            <article
              key={team.id}
              className={`rounded-xl border border-gray-700 bg-[#181818] p-3 ${isFirst ? "border-brand/60 bg-[#232100]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${isFirst ? "bg-brand text-black" : "bg-zinc-700 text-white"}`}
                >
                  {index + 1}
                </span>
                {team.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={team.logo}
                    alt={`Escudo do time ${team.nome} de futebol 7`}
                    className="h-10 w-10 shrink-0 rounded-full border border-brand object-cover"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-zinc-800 text-xs font-semibold text-gray-300">
                    SEM
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-white">{team.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Pontos</p>
                  <p className="text-xl font-extrabold leading-none text-brand">{team.pontos}</p>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                {teamStats.map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between rounded bg-[#202020] px-2 py-1">
                    <dt className="text-gray-400">{stat.label}</dt>
                    <dd className="font-semibold text-white">{team[stat.key]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>

      <div className="hidden w-full overflow-x-auto pb-4 md:block">
        <table className="w-full min-w-[600px] border border-gray-700 bg-[#181818] text-xs sm:text-sm">
          <thead className="bg-[#2a2a2a] text-gray-300">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-right text-base text-brand">Pontos</th>
              <th className="p-2 text-right">Jogos</th>
              <th className="p-2 text-right">Vitorias</th>
              <th className="p-2 text-right">Empates</th>
              <th className="p-2 text-right">Derrotas</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => {
              const rowClass = index === 0 ? "border-2 border-brand bg-[#232100]" : "";

              return (
                <tr
                  key={team.id}
                  className={`border-t border-gray-700 transition-all hover:bg-[#232323] ${rowClass}`}
                >
                  <td className="p-2 font-bold text-brand">{index + 1}</td>
                  <td className="p-2 font-semibold text-white">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {team.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={team.logo}
                          alt={`Escudo do time ${team.nome} de futebol 7`}
                          className="h-6 w-6 rounded object-cover"
                        />
                      ) : null}
                      <span>{team.nome}</span>
                    </div>
                  </td>
                  <td className="p-2 text-right text-base font-extrabold text-brand">{team.pontos}</td>
                  <td className="p-2 text-right">{team.jogos}</td>
                  <td className="p-2 text-right">{team.vitorias}</td>
                  <td className="p-2 text-right">{team.empates}</td>
                  <td className="p-2 text-right">{team.derrotas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
