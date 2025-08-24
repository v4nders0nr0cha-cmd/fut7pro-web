// src/components/sorteio/TabelaJogosRacha.tsx
"use client";

import Image from "next/image";
import type { JogoConfronto } from "@/utils/sorteioUtils";

export default function TabelaJogosRacha({
  jogos,
}: {
  jogos: JogoConfronto[];
}) {
  if (!jogos || jogos.length === 0) return null;

  // Divide pela metade: ida e volta
  const metade = Math.ceil(jogos.length / 2);
  const jogosIda = jogos.slice(0, metade);
  const jogosVolta = jogos.slice(metade);

  return (
    <div className="mt-8 flex flex-col gap-8 md:flex-row">
      {/* Tabela de Ida */}
      <div className="flex-1">
        <h3 className="mb-2 text-center text-lg font-bold text-yellow-400 md:text-xl">
          Ida
        </h3>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full rounded-xl bg-gray-900 text-white shadow">
            <thead>
              <tr className="bg-[#222a38] text-yellow-300">
                <th className="px-4 py-2">Rodada</th>
                <th className="px-4 py-2">Jogo</th>
                <th className="px-4 py-2">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {jogosIda.map((jogo, idx) => (
                <tr key={jogo.ordem} className="border-b border-gray-800">
                  <td className="text-center font-bold">{idx + 1}</td>
                  <td className="flex items-center justify-center gap-2 py-2">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{jogo.timeA.nome}</span>
                      <Image
                        src={jogo.timeA.logo}
                        alt={jogo.timeA.nome}
                        width={28}
                        height={28}
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                    </span>
                    <span className="mx-1 text-base font-bold text-yellow-400">
                      x
                    </span>
                    <span className="flex items-center gap-1">
                      <Image
                        src={jogo.timeB.logo}
                        alt={jogo.timeB.nome}
                        width={28}
                        height={28}
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                      <span className="font-medium">{jogo.timeB.nome}</span>
                    </span>
                  </td>
                  <td className="text-center">{jogo.tempo} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Volta */}
      <div className="flex-1">
        <h3 className="mb-2 text-center text-lg font-bold text-yellow-400 md:text-xl">
          Volta
        </h3>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full rounded-xl bg-gray-900 text-white shadow">
            <thead>
              <tr className="bg-[#222a38] text-yellow-300">
                <th className="px-4 py-2">Rodada</th>
                <th className="px-4 py-2">Jogo</th>
                <th className="px-4 py-2">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {jogosVolta.map((jogo, idx) => (
                <tr key={jogo.ordem} className="border-b border-gray-800">
                  <td className="text-center font-bold">{idx + 1}</td>
                  <td className="flex items-center justify-center gap-2 py-2">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{jogo.timeA.nome}</span>
                      <Image
                        src={jogo.timeA.logo}
                        alt={jogo.timeA.nome}
                        width={28}
                        height={28}
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                    </span>
                    <span className="mx-1 text-base font-bold text-yellow-400">
                      x
                    </span>
                    <span className="flex items-center gap-1">
                      <Image
                        src={jogo.timeB.logo}
                        alt={jogo.timeB.nome}
                        width={28}
                        height={28}
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                      <span className="font-medium">{jogo.timeB.nome}</span>
                    </span>
                  </td>
                  <td className="text-center">{jogo.tempo} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
