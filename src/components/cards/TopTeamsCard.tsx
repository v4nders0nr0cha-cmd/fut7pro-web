"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import type { TeamRankingEntry, TeamRankingTrend } from "@/types/ranking";

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";

function getVariacaoIcon(variacao: TeamRankingTrend | null | undefined) {
  switch (variacao) {
    case "up":
      return (
        <span className="text-green-500 text-base" aria-label="Subiu">
          ↑
        </span>
      );
    case "down":
      return (
        <span className="text-red-500 text-base" aria-label="Caiu">
          ↓
        </span>
      );
    default:
      return (
        <span className="text-blue-400 text-base" aria-label="Estável">
          •
        </span>
      );
  }
}

function formatTeamName(entry: TeamRankingEntry) {
  return entry.nome || "Time";
}

export default function TopTeamsCard() {
  const slug = usePublicTenantSlug();
  const { rankings, isLoading, isError } = usePublicTeamRankings(slug);

  const topTeams = useMemo(
    () => [...rankings].sort((a, b) => a.posicao - b.posicao).slice(0, 4),
    [rankings]
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <tbody>
          {Array.from({ length: 4 }, (_, index) => (
            <tr key={`skeleton-${index}`} className="animate-pulse border-b border-gray-800/70">
              <td className="py-2">
                <div className="h-3 w-6 rounded bg-neutral-700" />
              </td>
              <td className="pl-0 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-neutral-700" />
                  <div className="h-3 w-24 rounded bg-neutral-700" />
                </div>
              </td>
              <td className="py-2 text-center">
                <div className="mx-auto h-3 w-3 rounded-full bg-neutral-700" />
              </td>
              <td className="py-2 text-right">
                <div className="ml-auto h-3 w-10 rounded bg-neutral-700" />
              </td>
            </tr>
          ))}
        </tbody>
      );
    }

    if (isError) {
      return (
        <tbody>
          <tr>
            <td colSpan={4} className="py-6 text-center text-sm text-gray-400">
              Não foi possível carregar a classificação dos times agora.
            </td>
          </tr>
        </tbody>
      );
    }

    if (!topTeams.length) {
      return (
        <tbody>
          <tr>
            <td colSpan={4} className="py-6 text-center text-sm text-gray-400">
              Ainda não há times classificados para este racha.
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {topTeams.map((team) => (
          <tr
            key={team.rankingId}
            className="border-b border-gray-800 hover:bg-[#2a2a2a] transition-colors"
          >
            <td className="py-2">{team.posicao}</td>
            <td className="flex items-center gap-2 py-2 pl-0">
              <Image
                src={team.logo || DEFAULT_LOGO}
                alt={`Escudo do ${formatTeamName(team)}`}
                width={24}
                height={24}
                className="rounded-sm object-cover"
              />
              <span className="font-medium truncate">{formatTeamName(team)}</span>
            </td>
            <td className="text-center py-2">{getVariacaoIcon(team.variacao ?? null)}</td>
            <td className="text-right py-2 font-semibold">{team.pontos}</td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <Link href="/estatisticas/classificacao-dos-times" className="block">
      <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all cursor-pointer w-full min-h-[290px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold uppercase text-yellow-400">Classificação dos Times</h2>
          <span className="text-xs text-gray-400 underline">Ver todos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th>#</th>
                <th className="pl-0">Time</th>
                <th className="text-center">Δ</th>
                <th className="text-right">Pts</th>
              </tr>
            </thead>
            {renderBody()}
          </table>
        </div>
      </div>
    </Link>
  );
}
