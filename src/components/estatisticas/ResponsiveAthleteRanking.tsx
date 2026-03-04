"use client";

import Image from "next/image";
import Link from "next/link";
import type { RankingAtleta } from "@/types/estatisticas";

type HighlightMode = "first" | "podium";

interface ResponsiveAthleteRankingProps {
  athletes: RankingAtleta[];
  publicHref: (href: string) => string;
  highlightMode?: HighlightMode;
}

const stats = [
  { key: "jogos", label: "Jogos" },
  { key: "vitorias", label: "Vitorias" },
  { key: "empates", label: "Empates" },
  { key: "derrotas", label: "Derrotas" },
  { key: "gols", label: "Gols" },
] as const;

export default function ResponsiveAthleteRanking({
  athletes,
  publicHref,
  highlightMode = "first",
}: ResponsiveAthleteRankingProps) {
  if (athletes.length === 0) {
    return <div className="py-8 text-center text-gray-400">Nenhum atleta encontrado.</div>;
  }

  return (
    <>
      <div className="space-y-3 md:hidden" aria-label="Ranking em cards para mobile">
        {athletes.map((athlete, index) => {
          const mobileClass = getMobileHighlightClass(index, highlightMode);
          const rankClass = getRankBadgeClass(index, highlightMode);

          return (
            <article
              key={athlete.id}
              className={`rounded-xl border border-gray-700 bg-[#181818] p-3 ${mobileClass}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${rankClass}`}
                >
                  {index + 1}
                </span>
                <Link
                  href={publicHref(`/atletas/${athlete.slug}`)}
                  aria-label={`Ver perfil de ${athlete.nome}`}
                  className="shrink-0"
                >
                  <Image
                    src={athlete.foto}
                    alt={`Foto de ${athlete.nome}`}
                    width={40}
                    height={40}
                    className="rounded-full border border-brand object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={publicHref(`/atletas/${athlete.slug}`)}
                    className="line-clamp-2 text-sm font-semibold text-brand-soft hover:underline"
                    title={`Ver perfil de ${athlete.nome}`}
                  >
                    {athlete.nome}
                  </Link>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Pontos</p>
                  <p className="text-xl font-extrabold leading-none text-brand">{athlete.pontos}</p>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                {stats.map((stat) => (
                  <div
                    key={stat.key}
                    className="flex items-center justify-between rounded bg-[#202020] px-2 py-1"
                  >
                    <dt className="text-gray-400">{stat.label}</dt>
                    <dd className="font-semibold text-white">{athlete[stat.key]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] border border-gray-700 text-xs sm:text-sm">
          <thead className="bg-[#2a2a2a] text-gray-300">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Atleta</th>
              <th className="p-2 text-right text-base text-brand">Pontos</th>
              <th className="p-2 text-right">Jogos</th>
              <th className="p-2 text-right">Vitorias</th>
              <th className="p-2 text-right">Empates</th>
              <th className="p-2 text-right">Derrotas</th>
              <th className="p-2 text-right">Gols</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((athlete, index) => {
              const rowClass = getDesktopHighlightClass(index, highlightMode);

              return (
                <tr
                  key={athlete.id}
                  className={`border-t border-gray-700 transition-all hover:bg-[#2a2a2a] ${rowClass}`}
                >
                  <td className="p-2 font-bold text-brand">{index + 1}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Link href={publicHref(`/atletas/${athlete.slug}`)}>
                        <Image
                          src={athlete.foto}
                          alt={`Foto de ${athlete.nome}`}
                          width={32}
                          height={32}
                          className="rounded-full border border-brand object-cover"
                        />
                      </Link>
                      <Link
                        href={publicHref(`/atletas/${athlete.slug}`)}
                        className="font-semibold text-brand-soft hover:underline"
                        title={`Ver perfil de ${athlete.nome}`}
                      >
                        <span className="break-words">{athlete.nome}</span>
                      </Link>
                    </div>
                  </td>
                  <td className="p-2 text-right text-base font-extrabold text-brand">
                    {athlete.pontos}
                  </td>
                  <td className="p-2 text-right">{athlete.jogos}</td>
                  <td className="p-2 text-right">{athlete.vitorias}</td>
                  <td className="p-2 text-right">{athlete.empates}</td>
                  <td className="p-2 text-right">{athlete.derrotas}</td>
                  <td className="p-2 text-right">{athlete.gols}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function getDesktopHighlightClass(index: number, highlightMode: HighlightMode) {
  if (index === 0) return "border-2 border-brand bg-[#232100]";
  if (highlightMode === "podium" && index === 1) return "border-2 border-gray-400 bg-[#1e1e1e]";
  if (highlightMode === "podium" && index === 2) return "border-2 border-orange-600 bg-[#231c00]";
  return "";
}

function getMobileHighlightClass(index: number, highlightMode: HighlightMode) {
  if (index === 0) return "border-brand/60 bg-[#232100]";
  if (highlightMode === "podium" && index === 1) return "border-gray-400/70 bg-[#1e1e1e]";
  if (highlightMode === "podium" && index === 2) return "border-orange-600/70 bg-[#231c00]";
  return "";
}

function getRankBadgeClass(index: number, highlightMode: HighlightMode) {
  if (index === 0) return "bg-brand text-black";
  if (highlightMode === "podium" && index === 1) return "bg-gray-300 text-zinc-900";
  if (highlightMode === "podium" && index === 2) return "bg-orange-500 text-zinc-900";
  return "bg-zinc-700 text-white";
}
