"use client";

interface ConfrontosDoDiaProps {
  confrontos?: Array<{ id: string; timeA: string; timeB: string; hora?: string }>;
}

export default function ConfrontosDoDia({ confrontos = [] }: ConfrontosDoDiaProps) {
  if (confrontos.length === 0) {
    return <div className="text-gray-400 text-sm">Nenhum confronto disponivel</div>;
  }

  return (
    <div className="space-y-2">
      {confrontos.map((c) => (
        <div key={c.id} className="flex justify-between rounded bg-[#1f2937] px-3 py-2 text-white">
          <span>{c.timeA}</span>
          <span className="text-yellow-400">x</span>
          <span>{c.timeB}</span>
          {c.hora && <span className="text-xs text-gray-400">{c.hora}</span>}
        </div>
      ))}
    </div>
  );
}
