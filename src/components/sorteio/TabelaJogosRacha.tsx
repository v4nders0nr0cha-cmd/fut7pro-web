// src/components/sorteio/TabelaJogosRacha.tsx
"use client";

import Image from "next/image";
import type { JogoConfronto } from "@/utils/sorteioUtils";

export default function TabelaJogosRacha({ jogos }: { jogos: JogoConfronto[] }) {
  if (!jogos || jogos.length === 0) return null;

  const jogosIda = jogos.filter((jogo) => jogo.turno !== "volta");
  const jogosVolta = jogos.filter((jogo) => jogo.turno === "volta");
  const secoes = [
    { titulo: "Ida", lista: jogosIda },
    { titulo: "Volta", lista: jogosVolta },
  ].filter((secao) => secao.lista.length > 0);

  const gridCols = secoes.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`mt-6 grid grid-cols-1 gap-6 ${gridCols} md:gap-8 items-start`}>
      {secoes.map((secao) => (
        <div key={secao.titulo} className="min-w-0">
          <h3 className="text-lg md:text-xl text-yellow-400 font-bold mb-3 text-center">
            {secao.titulo}
          </h3>

          <div className="hidden md:block">
            <div className="w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f1522] shadow">
              <table className="w-full table-fixed text-sm text-white">
                <thead>
                  <tr className="bg-[#1b2436] text-yellow-300 text-xs uppercase tracking-wide">
                    <th className="w-20 px-3 py-3 text-left">Rodada</th>
                    <th className="px-3 py-3 text-center">Confronto</th>
                    <th className="w-20 px-3 py-3 text-right">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {secao.lista.map((jogo, idx) => (
                    <tr
                      key={`${secao.titulo}-${jogo.ordem}`}
                      className="border-t border-[#1e2a3a] odd:bg-[#0f1626] even:bg-[#0c1320]"
                    >
                      <td className="px-3 py-3 text-left font-semibold">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="flex items-center justify-end gap-2 min-w-0">
                            <span className="truncate font-medium">{jogo.timeA.nome}</span>
                            <Image
                              src={jogo.timeA.logo}
                              alt={jogo.timeA.nome}
                              width={26}
                              height={26}
                              className="rounded shrink-0"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <span className="text-yellow-400 font-bold text-base">x</span>
                          <div className="flex items-center justify-start gap-2 min-w-0">
                            <Image
                              src={jogo.timeB.logo}
                              alt={jogo.timeB.nome}
                              width={26}
                              height={26}
                              className="rounded shrink-0"
                              style={{ objectFit: "cover" }}
                            />
                            <span className="truncate font-medium">{jogo.timeB.nome}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-yellow-200 font-semibold">
                        {jogo.tempo} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {secao.lista.map((jogo, idx) => (
              <div
                key={`${secao.titulo}-mobile-${jogo.ordem}`}
                className="rounded-xl border border-zinc-800 bg-[#0f1522] px-3 py-3 shadow"
              >
                <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wide">
                  <span>Rodada {idx + 1}</span>
                  <span>{jogo.tempo} min</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={jogo.timeA.logo}
                      alt={jogo.timeA.nome}
                      width={26}
                      height={26}
                      className="rounded shrink-0"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="truncate text-sm font-semibold">{jogo.timeA.nome}</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">x</span>
                  <div className="flex items-center gap-2 min-w-0 justify-end">
                    <span className="truncate text-sm font-semibold text-right">
                      {jogo.timeB.nome}
                    </span>
                    <Image
                      src={jogo.timeB.logo}
                      alt={jogo.timeB.nome}
                      width={26}
                      height={26}
                      className="rounded shrink-0"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
