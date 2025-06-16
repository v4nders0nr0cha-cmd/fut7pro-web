"use client";

import GameCard from "./GameCard";
import type { Partida } from "@/types/partida";
import Link from "next/link";

export default function GamesOfTheDay({ partidas }: { partidas: Partida[] }) {
  const ultimosJogos = partidas.slice(-3).reverse();

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 text-white shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all cursor-pointer w-full min-h-[290px] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold uppercase text-yellow-400">Jogos do Dia</h2>
        <Link href="/partidas" className="text-[10px] text-gray-400 underline">
          Ver todos
        </Link>
      </div>

      <div className="space-y-3">
        {ultimosJogos.map((jogo) => (
          <GameCard
            key={jogo.id}
            teamA={{ name: jogo.timeCasa, logo: jogo.logoCasa }}
            teamB={{ name: jogo.timeFora, logo: jogo.logoFora }}
            score={`${jogo.golsCasa} - ${jogo.golsFora}`}
          />
        ))}
      </div>
    </div>
  );
}
