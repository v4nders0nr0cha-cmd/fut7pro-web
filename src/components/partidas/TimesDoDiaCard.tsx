"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import { timesDoDiaMock } from "@/components/lists/mockTimesDoDia";

type TeamResponse = {
  results?: Array<{
    id: string;
    nome: string;
    logo?: string | null;
    cor?: string | null;
  }>;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`request_failed_${response.status}`);
  }
  return (await response.json()) as TeamResponse;
};

export default function TimesDoDiaCard() {
  const pathname = usePathname();
  const slug = useMemo(() => pathname.split("/").filter(Boolean)[0] || "fut7pro", [pathname]);

  const { data } = useSWR<TeamResponse>(
    `/api/public/teams?slug=${encodeURIComponent(slug)}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const times = useMemo(() => {
    if (data?.results && data.results.length > 0) {
      return data.results.map((team) => ({
        nome: team.nome,
        logo: team.logo ?? "/images/escudos/escudo_padrao.png",
        jogadores: [] as Array<{ nome: string; foto: string; posicao: string }>,
      }));
    }
    return timesDoDiaMock;
  }, [data?.results]);

  return (
    <div className="bg-secundario rounded-2xl p-6 shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all">
      <h2 className="text-xl font-bold mb-2 text-yellow-400">Times do Dia</h2>
      <p className="mb-4 text-textoSuave text-sm">
        Confira os times sorteados para o proximo jogo!
      </p>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {times.map((time, idx) => (
          <div
            key={`${time.nome}-${idx}`}
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
            {time.jogadores.length > 0 ? (
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
            ) : (
              <span className="text-xs text-textoSuave">Escalacao em atualizacao.</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
