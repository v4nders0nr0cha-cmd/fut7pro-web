"use client";

import Link from "next/link";
import type { Partida } from "@/types/partida";

function formatDataLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function TimeBadge({ nome }: { nome: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="h-10 w-10 rounded-full bg-primario/40 flex items-center justify-center font-semibold uppercase">
        {nome.slice(0, 2)}
      </div>
      <span className="font-bold text-base truncate" title={nome}>
        {nome}
      </span>
    </div>
  );
}

export default function PartidaCard({ partida }: { partida: Partida }) {
  const dataLabel = formatDataLabel(partida.data);
  const horarioLabel = partida.horario ? ` - ${partida.horario}` : "";
  const localLabel = partida.local ? ` - ${partida.local}` : "";
  const statusLabel = partida.finalizada ? "Concluído" : "Agendado";
  const statusClass = partida.finalizada ? "bg-green-700" : "bg-yellow-700 text-black";

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-secundario rounded-xl shadow p-4 gap-3 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 w-full">
        <TimeBadge nome={partida.timeA} />
        <div className="flex flex-col items-center min-w-[96px]">
          <span className="text-lg font-bold">
            {partida.golsTimeA}
            <span className="text-yellow-400 px-1">x</span>
            {partida.golsTimeB}
          </span>
          <span className="text-xs text-textoSuave text-center">
            {dataLabel}
            {horarioLabel}
            {localLabel}
          </span>
        </div>
        <TimeBadge nome={partida.timeB} />
      </div>
      <div className="flex flex-col md:items-end gap-2 self-stretch md:self-auto">
        <Link
          href={`/partidas/${partida.id}`}
          className="bg-yellow-400 text-black font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-yellow-500 transition"
        >
          Ver detalhes
        </Link>
        <span className={`text-xs px-2 py-1 rounded-lg ${statusClass}`}>{statusLabel}</span>
      </div>
    </div>
  );
}
