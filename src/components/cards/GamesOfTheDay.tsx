"use client";

import Link from "next/link";
import GameCard from "./GameCard";
import type { Partida } from "@/types/partida";

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
  const jogosExibidos = partidas
    .filter((jogo) => jogo.timeA && jogo.timeB)
    .slice(-3)
    .reverse();

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 text-white shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all cursor-pointer w-full min-h-[290px] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold uppercase text-yellow-400">Jogos do Dia</h2>
        <Link href="/partidas" className="text-[10px] text-gray-400 underline">
          Ver todos
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400" />
            <span className="ml-2 text-sm text-gray-400">Carregando...</span>
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-400 text-center">Erro ao carregar jogos</p>
          </div>
        ) : jogosExibidos.length > 0 ? (
          jogosExibidos.map((jogo) => (
            <GameCard
              key={jogo.id}
              teamA={{
                name: jogo.timeA,
                logo: jogo.logoCasa,
              }}
              teamB={{
                name: jogo.timeB,
                logo: jogo.logoFora,
              }}
              score={`${jogo.golsTimeA ?? "-"} - ${jogo.golsTimeB ?? "-"}`}
            />
          ))
        ) : (
          <p className="text-sm text-center text-gray-400">Nenhum jogo disponivel</p>
        )}
      </div>
    </div>
  );
}
