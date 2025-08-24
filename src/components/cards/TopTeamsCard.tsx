"use client";

import Image from "next/image";
import Link from "next/link";
import { classificacaoTimes } from "@/components/lists/mockClassificacaoTimes";

const getVariacaoIcon = (variacao: string) => {
  switch (variacao) {
    case "up":
      return <span className="text-base text-green-500">↑</span>;
    case "down":
      return <span className="text-base text-red-500">↓</span>;
    default:
      return <span className="text-base text-blue-500">•</span>;
  }
};

export default function TopTeamsCard() {
  const top4 = classificacaoTimes.slice(0, 4);

  return (
    <Link href="/estatisticas/classificacao-dos-times" className="block">
      <div className="flex min-h-[290px] w-full cursor-pointer flex-col justify-between rounded-2xl bg-[#1a1a1a] p-5 text-white shadow-md transition-all hover:shadow-[0_0_12px_2px_#FFCC00]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold uppercase text-yellow-400">
            Classificação dos Times
          </h2>
          <span className="text-xs text-gray-400 underline">Ver todos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700 text-gray-400">
              <tr>
                <th>#</th>
                <th className="pl-0">Time</th>
                <th className="text-center">↑↓</th>
                <th className="text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {top4.map((time) => (
                <tr
                  key={time.posicao}
                  className="border-b border-gray-800 hover:bg-[#2a2a2a]"
                >
                  <td className="py-2">{time.posicao}</td>
                  <td className="flex items-center gap-[2px] py-2 pl-0">
                    <Image
                      src={time.escudo}
                      alt={`Escudo do ${time.nome}`}
                      width={24}
                      height={24}
                      className="rounded-sm"
                    />
                    <span className="font-medium">{time.nome}</span>
                  </td>
                  <td className="py-2 text-center">
                    {getVariacaoIcon(time.variacao)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {time.pontos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Link>
  );
}
