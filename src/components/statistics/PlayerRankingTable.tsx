"use client";

import Image from "next/image";
import Link from "next/link";
import { positionLabel, type PositionValue } from "@/constants/positions";
import type { PlayerRanking } from "@/types/ranking";

type HighlightMetric = "pontos" | "gols" | "assistencias";

interface PlayerRankingTableProps {
  rankings: PlayerRanking[];
  isLoading?: boolean;
  error?: string | null;
  highlight?: HighlightMetric;
  emptyMessage?: string;
}

const AVATAR_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

const metricClass = (metric: HighlightMetric, highlight?: HighlightMetric) =>
  highlight === metric ? "text-yellow-400 font-extrabold" : "text-gray-200";

export function PlayerRankingTable({
  rankings,
  isLoading,
  error,
  highlight = "pontos",
  emptyMessage = "Nenhum atleta encontrado para os filtros selecionados.",
}: PlayerRankingTableProps) {
  const getDisplayPosition = (item: PlayerRanking) => {
    if (item.posicao && item.posicao.trim().length > 0) {
      return item.posicao;
    }
    const raw = (item.posicaoValor ?? undefined) as PositionValue | undefined;
    const label = positionLabel(raw);
    return label || "-";
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10 text-sm text-gray-300">
        Carregando ranking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-900/30 border border-red-500 rounded-xl px-4 py-3 text-sm text-red-200">
        Falha ao carregar ranking: {error}
      </div>
    );
  }

  if (!rankings.length) {
    return (
      <div className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-gray-300 text-center">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-dark">
      <table className="w-full text-xs sm:text-sm border border-gray-700 min-w-[520px]">
        <thead className="bg-[#2a2a2a] text-gray-300">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Atleta</th>
            <th className="p-2 text-left hidden sm:table-cell">Posicao</th>
            <th className="p-2 text-right">Pontos</th>
            <th className="p-2 text-right">Gols</th>
            <th className="p-2 text-right">Assistencias</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((atleta, index) => {
            const foto = atleta.photoUrl?.trim() || AVATAR_FALLBACK;
            const destaque = index === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
            return (
              <tr
                key={`${atleta.rankingId}-${atleta.id}-${index}`}
                className={`border-t border-gray-700 hover:bg-[#2a2a2a] transition-all ${destaque}`}
              >
                <td className="p-2 font-bold text-yellow-400">{index + 1}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Image
                      src={foto}
                      alt={`Foto do atleta ${atleta.nome}`}
                      width={32}
                      height={32}
                      className="rounded-full border border-yellow-400 object-cover"
                    />
                    {atleta.slug ? (
                      <Link
                        href={`/atletas/${atleta.slug}`}
                        className="text-yellow-300 hover:underline font-semibold"
                      >
                        <span className="break-words">{atleta.nome}</span>
                      </Link>
                    ) : (
                      <span className="text-yellow-200 font-semibold">{atleta.nome}</span>
                    )}
                  </div>
                </td>
                <td className="p-2 hidden sm:table-cell text-gray-300">
                  {getDisplayPosition(atleta)}
                </td>
                <td className={`p-2 text-right ${metricClass("pontos", highlight)}`}>
                  {atleta.pontos ?? 0}
                </td>
                <td className={`p-2 text-right ${metricClass("gols", highlight)}`}>
                  {atleta.gols ?? 0}
                </td>
                <td className={`p-2 text-right ${metricClass("assistencias", highlight)}`}>
                  {atleta.assistencias ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
