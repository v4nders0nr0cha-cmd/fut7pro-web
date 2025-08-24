"use client";

import GameCard from "./GameCard";
import type { Partida } from "@/types/partida";
import Link from "next/link";
import { teamLogoMap, logoPadrao } from "@/config/teamLogoMap";

interface GamesOfTheDayProps {
  partidas?: Partida[];
  isLoading?: boolean;
  isError?: boolean;
}

export default function GamesOfTheDay({
  partidas = [],
  isLoading = false,
  isError = false,
}: GamesOfTheDayProps) {
  const ultimosJogos = partidas
    .filter(
      (jogo) =>
        jogo.timeA &&
        jogo.timeB &&
        typeof jogo.golsTimeA !== "undefined" &&
        typeof jogo.golsTimeB !== "undefined",
    )
    .slice(-3)
    .reverse();

  return (
    <div className="flex min-h-[290px] w-full cursor-pointer flex-col justify-between rounded-2xl bg-[#1A1A1A] p-5 text-white shadow-md transition-all hover:shadow-[0_0_12px_2px_#FFCC00]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase text-yellow-400">
          Jogos do Dia
        </h2>
        <Link href="/partidas" className="text-[10px] text-gray-400 underline">
          Ver todos
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-yellow-400"></div>
            <span className="ml-2 text-sm text-gray-400">Carregando...</span>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-center text-sm text-red-400">
              Erro ao carregar jogos
            </p>
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
          <p className="text-center text-sm text-gray-400">
            Nenhum jogo disponível
          </p>
        )}
      </div>
    </div>
  );
}
