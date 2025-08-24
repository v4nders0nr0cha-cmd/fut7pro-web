// src/components/admin/TimesDoDiaGrid.tsx
import Image from "next/image";
import { Time, Jogador } from "@/types/interfaces";

// Interface específica para jogador com dados adicionais
interface JogadorCompleto extends Jogador {
  apelido?: string;
  pos?: string;
}

// Interface específica para time com dados adicionais
interface TimeCompleto extends Time {
  cor?: string;
  logo?: string;
  jogadores: JogadorCompleto[];
}

export default function TimesDoDiaGrid({ times }: { times: TimeCompleto[] }) {
  return (
    <section className="mb-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {times.map((time, idx) => (
        <div
          key={time.nome}
          className="rounded-2xl border-t-4 bg-zinc-800 shadow-lg"
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
          <div className="flex items-center gap-2 px-5 pb-2 pt-3">
            <Image
              src={time.logo || "/images/times/time_padrao_01.png"}
              alt={`Logo ${time.nome}`}
              width={28}
              height={28}
            />
            <span className="text-xl font-bold tracking-wide text-white">
              {time.nome}
            </span>
          </div>
          <ul className="px-5 pb-4">
            {time.jogadores.map((j: JogadorCompleto, i: number) => (
              <li
                key={j.nome}
                className="flex items-center justify-between py-1"
              >
                <span className="font-semibold text-white">{j.nome}</span>
                <span className="text-xs text-gray-400">
                  {j.apelido} / {j.pos}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
