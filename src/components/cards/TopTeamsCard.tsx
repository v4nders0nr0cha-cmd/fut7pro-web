"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import useSWR from "swr";
import { usePathname } from "next/navigation";
import { classificacaoTimes as fallbackClassificacao } from "@/components/lists/mockClassificacaoTimes";

type RankingEntry = {
  id?: string;
  posicao: number;
  nome: string;
  escudo: string;
  pontos: number;
  variacao?: "up" | "down" | "stay";
};

type ApiResponse = {
  results?: Array<{
    id?: string;
    nome?: string;
    logo?: string;
    pontos?: number;
    posicao?: number;
    variacao?: "up" | "down" | "stay";
  }>;
  fallback?: boolean;
  source?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`request_failed_${response.status}`);
  }
  return (await response.json()) as ApiResponse;
};

const getVariacaoIcon = (variacao: string | undefined) => {
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
  const pathname = usePathname();
  const slug = useMemo(() => pathname.split("/").filter(Boolean)[0] || "fut7pro", [pathname]);

  const { data } = useSWR<ApiResponse>(
    `/api/public/team-rankings?slug=${encodeURIComponent(slug)}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const ranking = useMemo(() => {
    if (data?.results && data.results.length > 0) {
      return data.results.map<RankingEntry>((item, index) => ({
        id: item.id,
        posicao: typeof item.posicao === "number" ? item.posicao : index + 1,
        nome: item.nome ?? `Time ${index + 1}`,
        escudo:
          item.logo ?? "https://app.fut7pro.com.br/images/padroes/escudo_racha.png",
        pontos: item.pontos ?? 0,
        variacao: item.variacao ?? "stay",
      }));
    }
    return fallbackClassificacao;
  }, [data?.results]);

  const top4 = ranking.slice(0, 4);

  return (
    <Link href="/estatisticas/classificacao-dos-times" className="block">
      <div className="bg-[#1a1a1a] rounded-2xl p-5 text-white shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all cursor-pointer w-full min-h-[290px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold uppercase text-yellow-400">Classificação dos Times</h2>
          <span className="text-xs text-gray-400 underline">Ver todos</span>
        </div>

        <div className="overflow-x-auto">
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
              {top4.map((time) => (
                <tr key={`${time.posicao}-${time.nome}`} className="border-b border-gray-800 hover:bg-[#2a2a2a]">
                  <td className="py-2">{time.posicao}</td>
                  <td className="flex items-center gap-[2px] py-2 pl-0">
                    <Image
                      src={time.escudo}
                      alt={`Escudo do ${time.nome}`}
                      width={24}
                      height={24}
                      className="rounded-sm object-cover"
                    />
                    <span className="font-medium">{time.nome}</span>
                  </td>
                  <td className="text-center py-2">{getVariacaoIcon(time.variacao)}</td>
                  <td className="text-right py-2 font-semibold">{time.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Link>
  );
}
