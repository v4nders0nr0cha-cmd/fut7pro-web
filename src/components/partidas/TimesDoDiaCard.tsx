"use client";

import { timesDoDiaMock } from "@/components/lists/mockTimesDoDia";
import Image from "next/image";

export default function TimesDoDiaCard() {
  return (
    <div className="bg-secundario rounded-2xl p-6 shadow-md transition-all hover:shadow-[0_0_12px_2px_#FFCC00]">
      <h2 className="mb-2 text-xl font-bold text-yellow-400">Times do Dia</h2>
      <p className="text-textoSuave mb-4 text-sm">
        Confira os times sorteados para o próximo jogo!
      </p>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {timesDoDiaMock.map((time, idx) => (
          <div
            key={idx}
            className="flex flex-1 flex-col items-center rounded-xl bg-[#181818] p-4 shadow transition hover:scale-105"
          >
            <Image
              src={time.logo}
              alt={`Logo do ${time.nome}`}
              width={56}
              height={56}
              className="mb-2 rounded-lg"
            />
            <span className="mb-2 text-lg font-bold">{time.nome}</span>
            <div className="flex flex-wrap justify-center gap-1">
              {time.jogadores.map((jogador, i) => (
                <div
                  key={i}
                  className="mx-2 my-1 flex flex-col items-center"
                  title={jogador.posicao}
                >
                  <Image
                    src={jogador.foto}
                    alt={`Jogador ${jogador.nome}`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="mt-1 text-xs">{jogador.nome}</span>
                  <span className="text-[10px] font-bold uppercase text-yellow-400">
                    {jogador.posicao}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
