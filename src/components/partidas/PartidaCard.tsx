"use client";

import Link from "next/link";
import Image from "next/image";
import type { Partida } from "@/types/partida";

export default function PartidaCard({ partida }: { partida: Partida }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-secundario rounded-xl shadow p-4 gap-3 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 w-full">
        {/* Logo e nome time casa */}
        <div className="flex items-center gap-2 min-w-[90px]">
          <Image
            src={partida.logoCasa}
            alt={`Logo ${partida.timeCasa}`}
            width={38}
            height={38}
            className="rounded-lg"
          />
          <span className="font-bold text-base">{partida.timeCasa}</span>
        </div>
        {/* Placar */}
        <div className="flex flex-col items-center min-w-[72px]">
          <span className="text-lg font-bold">
            {partida.golsCasa} <span className="text-yellow-400">x</span> {partida.golsFora}
          </span>
          <span className="text-xs text-textoSuave">
            {partida.data} - {partida.local}
          </span>
        </div>
        {/* Logo e nome time fora */}
        <div className="flex items-center gap-2 min-w-[90px]">
          <Image
            src={partida.logoFora}
            alt={`Logo ${partida.timeFora}`}
            width={38}
            height={38}
            className="rounded-lg"
          />
          <span className="font-bold text-base">{partida.timeFora}</span>
        </div>
      </div>
      <div className="flex flex-col md:items-end gap-2">
        <Link
          href={`/partidas/${partida.id}`}
          className="bg-yellow-400 text-black font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-yellow-500 transition"
        >
          Ver detalhes
        </Link>
        <span
          className={`text-xs px-2 py-1 rounded-lg ${
            partida.status === "Concluído" ? "bg-green-700 text-white" : "bg-yellow-700 text-white"
          }`}
        >
          {partida.status}
        </span>
      </div>
    </div>
  );
}
