"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRankingGeral } from "@/hooks/useEstatisticas";
import type { RankingAtleta } from "@/types/estatisticas";

function formatValue(value: number | undefined) {
  return typeof value === "number" ? value : 0;
}

function getBasePhoto(player?: RankingAtleta) {
  if (!player) return "/images/logos/logo_fut7pro.png";
  return player.foto || "/images/logos/logo_fut7pro.png";
}

const METRICAS: { key: keyof RankingAtleta; label: string }[] = [
  { key: "pontos", label: "Pontos" },
  { key: "jogos", label: "Jogos" },
  { key: "vitorias", label: "Vitórias" },
  { key: "empates", label: "Empates" },
  { key: "derrotas", label: "Derrotas" },
  { key: "gols", label: "Gols" },
  { key: "assistencias", label: "Assistências" },
];

export default function TiraTeimaPage() {
  const { resultados, isLoading, isError, error } = useRankingGeral("historico");
  const [atletaA, setAtletaA] = useState<string>("");
  const [atletaB, setAtletaB] = useState<string>("");

  useEffect(() => {
    if (!resultados.length) return;
    setAtletaA((prev) => prev || resultados[0]!.id);
    setAtletaB((prev) => {
      if (prev && prev !== atletaA) return prev;
      return resultados.length > 1 ? resultados[1]!.id : resultados[0]!.id;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultados]);

  const jogadorA = useMemo(
    () => resultados.find((item) => item.id === atletaA),
    [resultados, atletaA]
  );
  const jogadorB = useMemo(
    () => resultados.find((item) => item.id === atletaB),
    [resultados, atletaB]
  );

  return (
    <>
      <Head>
        <title>Tira-teima de Atletas | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Compare dois atletas do seu racha em pontos, vitórias, gols e outros indicadores acumulados."
        />
        <meta
          name="keywords"
          content="tira teima, comparador de atletas, futebol 7, estatisticas, fut7pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center mb-6">
          Tira-Teima de Atletas
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
          </div>
        ) : isError ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
            {error ?? "Não foi possível carregar os atletas para comparação."}
          </div>
        ) : resultados.length === 0 ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center text-neutral-300">
            Nenhum atleta encontrado para comparação ainda.
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3 p-4 bg-[#181818] rounded-2xl shadow-lg">
                <label className="text-sm text-neutral-300" htmlFor="atletaA">
                  Atleta A
                </label>
                <select
                  id="atletaA"
                  value={atletaA}
                  onChange={(event) => setAtletaA(event.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
                >
                  {resultados.map((atleta) => (
                    <option key={atleta.id} value={atleta.id}>
                      {atleta.nome}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col items-center gap-3 mt-4">
                  <Image
                    src={getBasePhoto(jogadorA)}
                    alt={jogadorA?.nome ?? "Atleta A"}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-yellow-400 object-cover"
                  />
                  <h2 className="text-lg font-semibold text-yellow-300">
                    {jogadorA?.nome ?? "Selecione"}
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-[#181818] rounded-2xl shadow-lg">
                <label className="text-sm text-neutral-300" htmlFor="atletaB">
                  Atleta B
                </label>
                <select
                  id="atletaB"
                  value={atletaB}
                  onChange={(event) => setAtletaB(event.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
                >
                  {resultados.map((atleta) => (
                    <option key={atleta.id} value={atleta.id}>
                      {atleta.nome}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col items-center gap-3 mt-4">
                  <Image
                    src={getBasePhoto(jogadorB)}
                    alt={jogadorB?.nome ?? "Atleta B"}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-sky-400 object-cover"
                  />
                  <h2 className="text-lg font-semibold text-sky-300">
                    {jogadorB?.nome ?? "Selecione"}
                  </h2>
                </div>
              </div>
            </div>

            <section className="bg-[#181818] rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-center text-neutral-200 mb-4">
                Comparativo de Estatísticas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                {METRICAS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 py-3"
                  >
                    <span className="text-sm text-neutral-400 md:w-1/3">{label}</span>
                    <strong className="text-lg text-yellow-300 md:w-1/3 text-center">
                      {formatValue(jogadorA?.[key] as number)}
                    </strong>
                    <strong className="text-lg text-sky-300 md:w-1/3 text-center">
                      {formatValue(jogadorB?.[key] as number)}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
