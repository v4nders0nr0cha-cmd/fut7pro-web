"use client";

import GameCard from "./GameCard";
import type { JogoDoDia } from "@/hooks/useJogosDoDia";
import Link from "next/link";
import { teamLogoMap, logoPadrao } from "@/config/teamLogoMap";
import { usePublicLinks } from "@/hooks/usePublicLinks";

interface GamesOfTheDayProps {
  partidas?: JogoDoDia[];
  isLoading?: boolean;
  isError?: boolean;
}

export default function GamesOfTheDay({
  partidas = [],
  isLoading = false,
  isError = false,
}: GamesOfTheDayProps) {
  const ultimosJogos = partidas.slice(-3).reverse();
  const { publicHref } = usePublicLinks();

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 text-white shadow-md hover:shadow-[0_0_12px_2px_var(--brand)] transition-all cursor-pointer w-full min-h-[290px] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold uppercase text-brand">Jogos do Dia</h2>
        <Link href={publicHref("/partidas")} className="text-[10px] text-gray-400 underline">
          Ver todos
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
            <span className="ml-2 text-sm text-gray-400">Carregando...</span>
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-400 text-center">Erro ao carregar jogos</p>
          </div>
        ) : ultimosJogos.length > 0 ? (
          ultimosJogos.map((jogo) => (
            <GameCard
              key={jogo.id}
              teamA={{
                name: jogo.timeA,
                logo: teamLogoMap[jogo.timeA] || logoPadrao,
              }}
              teamB={{
                name: jogo.timeB,
                logo: teamLogoMap[jogo.timeB] || logoPadrao,
              }}
              score={`${jogo.golsTimeA} - ${jogo.golsTimeB}`}
            />
          ))
        ) : (
          <p className="text-sm text-center text-gray-400">Nenhum jogo disponível.</p>
        )}
      </div>
    </div>
  );
}
