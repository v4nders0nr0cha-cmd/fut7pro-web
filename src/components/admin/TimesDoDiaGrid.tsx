// src/components/admin/TimesDoDiaGrid.tsx
import Image from "next/image";
import type { Time, Jogador } from "@/types/interfaces";

// Interface específica para jogador com dados adicionais
interface JogadorCompleto extends Jogador {
  nickname?: string;
  posicao?: string;
}

// Interface específica para time com dados adicionais
interface TimeCompleto extends Time {
  cor?: string;
  logo?: string;
  jogadores: JogadorCompleto[];
}

export default function TimesDoDiaGrid({ times }: { times: TimeCompleto[] }) {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {times.map((time, idx) => (
        <div
          key={time.nome}
          className="rounded-2xl bg-zinc-800 shadow-lg border-t-4"
          style={{
            borderColor:
              time.cor === "yellow"
                ? "#ffd600"
                : time.cor === "orange"
                  ? "#ff8c1a"
                  : time.cor === "blue"
                    ? "#2693ff"
                    : "#2ecc40",
          }}
        >
          <div className="flex items-center gap-2 px-5 pt-3 pb-2">
            <Image
              src={time.logo || "/images/times/time_padrao_01.png"}
              alt={`Logo ${time.nome}`}
              width={28}
              height={28}
            />
            <span className="text-xl font-bold text-white tracking-wide">{time.nome}</span>
          </div>
          <ul className="px-5 pb-4">
            {time.jogadores.map((j: JogadorCompleto, i: number) => (
              <li key={j.nome} className="flex justify-between items-center py-1">
                <span className="text-white font-semibold">{j.nome}</span>
                <span className="text-xs text-gray-400">
                  {j.nickname} / {j.posicao}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
