"use client";

interface ConfrontosDoDiaProps {
  confrontos?: Array<{
    id: string;
    timeA: string;
    timeB: string;
    hora?: string;
    ordem?: number;
    tempo?: number;
    turno?: "ida" | "volta";
  }>;
}

export default function ConfrontosDoDia({ confrontos = [] }: ConfrontosDoDiaProps) {
  if (confrontos.length === 0) {
    return <div className="text-gray-400 text-sm">Nenhum confronto disponivel</div>;
  }

  return (
    <div className="space-y-2">
      {confrontos.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded bg-[#1f2937] px-3 py-2 text-white"
        >
          <span className="text-xs text-gray-400 min-w-[64px]">
            {c.ordem ? `Jogo ${c.ordem}` : "Jogo"}
          </span>
          <span className="flex-1 text-center">
            {c.timeA} <span className="text-yellow-400">x</span> {c.timeB}
          </span>
          <span className="text-xs text-gray-400">
            {c.turno ? (c.turno === "ida" ? "Ida" : "Volta") : ""}
            {c.turno && c.tempo ? " • " : ""}
            {c.tempo ? `${c.tempo} min` : ""}
          </span>
          {c.hora && <span className="text-xs text-gray-400">{c.hora}</span>}
        </div>
      ))}
    </div>
  );
}
