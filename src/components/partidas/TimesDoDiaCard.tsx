"use client";

import { timesDoDiaMock } from "@/components/lists/mockTimesDoDia";
import Image from "next/image";

export default function TimesDoDiaCard() {
  return (
    <div className="bg-secundario rounded-2xl p-6 shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all">
      <h2 className="text-xl font-bold mb-2 text-yellow-400">Times do Dia</h2>
      <p className="mb-4 text-textoSuave text-sm">
        Confira os times sorteados para o próximo jogo!
      </p>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {timesDoDiaMock.map((time, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center bg-[#181818] rounded-xl p-4 shadow hover:scale-105 transition"
          >
            <Image
              src={time.logo}
              alt={`Logo do ${time.nome}`}
              width={56}
              height={56}
              className="mb-2 rounded-lg"
            />
            <span className="font-bold text-lg mb-2">{time.nome}</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {time.jogadores.map((jogador, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center mx-2 my-1"
                  title={jogador.posicao}
                >
                  <Image
                    src={jogador.foto}
                    alt={`Jogador ${jogador.nome}`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-xs mt-1">{jogador.nome}</span>
                  <span className="text-[10px] text-yellow-400 font-bold uppercase">
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
