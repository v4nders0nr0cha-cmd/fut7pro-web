"use client";

import Image from "next/image";
import Link from "next/link";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const getVariacaoIcon = (variacao: string) => {
  switch (variacao) {
    case "up":
      return <span className="text-green-500 text-base"></span>;
    case "down":
      return <span className="text-red-500 text-base"></span>;
    default:
      return <span className="text-blue-500 text-base"></span>;
  }
};

export default function TopTeamsCard() {
  const { teams, isLoading, isError } = usePublicTeamRankings();
  const { publicHref } = usePublicLinks();
  const top4 = teams.slice(0, 4);

  return (
    <Link href={publicHref("/estatisticas/classificacao-dos-times")} className="block">
      <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all cursor-pointer w-full min-h-[290px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold uppercase text-yellow-400">Classifica��o dos Times</h2>
          <span className="text-xs text-gray-400 underline">Ver todos</span>
        </div>

        <div className="overflow-x-auto">
          {isLoading && (
            <div className="py-6 text-center text-gray-400">Carregando classifica��o...</div>
          )}
          {isError && !isLoading && (
            <div className="py-6 text-center text-red-400">Erro ao carregar classifica��o.</div>
          )}
          {!isLoading && !isError && (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th>#</th>
                  <th className="pl-0">Time</th>
                  <th className="text-center"></th>
                  <th className="text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {top4.map((time, index) => (
                  <tr
                    key={time.id ?? index}
                    className="border-b border-gray-800 hover:bg-[#2a2a2a]"
                  >
                    <td className="py-2">{time.posicao ?? index + 1}</td>
                    <td className="flex items-center gap-[2px] py-2 pl-0">
                      {time.logo && (
                        <Image
                          src={time.logo}
                          alt={`Escudo do ${time.nome}`}
                          width={24}
                          height={24}
                          className="rounded-sm"
                        />
                      )}
                      <span className="font-medium">{time.nome}</span>
                    </td>
                    <td className="text-center py-2">{getVariacaoIcon("stable")}</td>
                    <td className="text-right py-2 font-semibold">{time.pontos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Link>
  );
}
