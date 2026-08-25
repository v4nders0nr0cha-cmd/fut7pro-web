"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaCrown, FaInfoCircle } from "react-icons/fa";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import { useRankingCampeoesDoDia } from "@/hooks/useRankingCampeoesDoDia";
import { useJogadores } from "@/hooks/useJogadores";
import { useRacha } from "@/context/RachaContext";
import type { RankingCampeoesPeriodo } from "@/lib/campeoes-do-dia-ranking";

const PERIODOS: Array<{ label: string; value: RankingCampeoesPeriodo }> = [
  { label: "Este mês", value: "mes" },
  { label: "Quadrimestre", value: "quadrimestre" },
  { label: "Ano", value: "ano" },
  { label: "Histórico completo", value: "todos" },
];

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

export default function RankingCampeoesDoDiaPage() {
  const [periodo, setPeriodo] = useState<RankingCampeoesPeriodo>("ano");
  const { rachaId } = useRacha();
  const { jogadores } = useJogadores(rachaId || "", { includeBots: true });
  const { rankings, isLoading, isError, error } = useRankingCampeoesDoDia({ periodo });

  const botsIds = useMemo(
    () => new Set(jogadores.filter((jogador) => jogador.isBot).map((jogador) => jogador.id)),
    [jogadores]
  );
  const rankingsSemBots = useMemo(
    () => rankings.filter((item) => !botsIds.has(item.athleteId)),
    [botsIds, rankings]
  );

  return (
    <>
      <Head>
        <title>Ranking Campeões do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja os atletas que mais participaram do Time Campeão do Dia oficialmente publicado."
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-yellow-300">Maiores Campeões do Dia</h1>
          <select
            className="rounded-xl border border-gray-600 bg-[#23272f] px-4 py-2 text-white focus:border-yellow-400"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as RankingCampeoesPeriodo)}
          >
            {PERIODOS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-xl border-l-4 border-yellow-400 bg-[#23272f] p-4 sm:flex-row sm:items-center">
          <FaInfoCircle className="shrink-0 text-2xl text-yellow-300" />
          <div className="flex-1 text-sm leading-relaxed text-gray-200">
            <b>O que é o Ranking Campeões do Dia?</b>
            <br />
            Ele considera apenas o Time Campeão do Dia oficialmente publicado e conta os atletas
            presentes nesse time. BOTs não entram neste ranking.
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#191b1f] shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-yellow-200">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Jogador</th>
                <th className="px-4 py-3">Apelido</th>
                <th className="px-4 py-3">Campeões do Dia</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Carregando ranking...
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-red-400">
                    Erro ao carregar ranking.
                    {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && rankingsSemBots.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Nenhum Time Campeão do Dia publicado no período selecionado.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                rankingsSemBots.map((item, index) => (
                  <tr key={item.athleteId} className="border-t border-gray-800 hover:bg-[#22242b]">
                    <td className="px-4 py-3 font-bold text-yellow-300">{index + 1}</td>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <AvatarFut7Pro
                        src={item.foto || DEFAULT_AVATAR}
                        alt={`Foto do jogador ${item.nome}`}
                        width={38}
                        height={38}
                        fallbackSrc={DEFAULT_AVATAR}
                        className="rounded-full border-2 border-yellow-400 object-cover shadow"
                      />
                      <span className="text-white">{item.nome}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-yellow-100">
                      {item.apelido || "-"}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      <span className="inline-flex items-center gap-2">
                        <FaCrown className="text-yellow-300" />
                        {item.campeoesDoDia}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
