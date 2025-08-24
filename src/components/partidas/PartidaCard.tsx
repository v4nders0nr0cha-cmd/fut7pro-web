"use client";

import Link from "next/link";
import Image from "next/image";
import type { Partida } from "@/types/partida";

export default function PartidaCard({ partida }: { partida: Partida }) {
  return (
    <div className="bg-secundario flex flex-col items-center justify-between gap-3 rounded-xl p-4 shadow transition-all hover:shadow-lg md:flex-row">
      <div className="flex w-full items-center gap-3">
        {/* Logo e nome time casa */}
        <div className="flex min-w-[90px] items-center gap-2">
          <Image
            src={partida.logoCasa}
            alt={`Logo ${partida.timeCasa}`}
            width={38}
            height={38}
            className="rounded-lg"
          />
          <span className="text-base font-bold">{partida.timeCasa}</span>
        </div>
        {/* Placar */}
        <div className="flex min-w-[72px] flex-col items-center">
          <span className="text-lg font-bold">
            {partida.golsCasa} <span className="text-yellow-400">x</span>{" "}
            {partida.golsFora}
          </span>
          <span className="text-textoSuave text-xs">
            {partida.data} - {partida.local}
          </span>
        </div>
        {/* Logo e nome time fora */}
        <div className="flex min-w-[90px] items-center gap-2">
          <Image
            src={partida.logoFora}
            alt={`Logo ${partida.timeFora}`}
            width={38}
            height={38}
            className="rounded-lg"
          />
          <span className="text-base font-bold">{partida.timeFora}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 md:items-end">
        <Link
          href={`/partidas/${partida.id}`}
          className="rounded-lg bg-yellow-400 px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-yellow-500"
        >
          Ver detalhes
        </Link>
        <span
          className={`rounded-lg px-2 py-1 text-xs ${
            partida.status === "Concluído"
              ? "bg-green-700 text-white"
              : "bg-yellow-700 text-white"
          }`}
        >
          {partida.status}
        </span>
      </div>
    </div>
  );
}
