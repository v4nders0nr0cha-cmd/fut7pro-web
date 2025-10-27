"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useClassificacaoTimes } from "@/hooks/useEstatisticas";
import type { TimeClassificacao } from "@/types/estatisticas";

const periodos = [
  { label: "1o Quadrimestre", value: "q1" },
  { label: "2o Quadrimestre", value: "q2" },
  { label: "3o Quadrimestre", value: "q3" },
  { label: "Anual", value: "anual" },
  { label: "Todas as Temporadas", value: "historico" },
];

function periodoUsaAno(periodo: string) {
  return periodo !== "historico";
}

export default function ClassificacaoTimesPage() {
  const [periodo, setPeriodo] = useState("q1");
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const usaAno = periodoUsaAno(periodo);

  const { resultados, isLoading, isError, error, atualizadoEm, availableYears } =
    useClassificacaoTimes(periodo, usaAno ? { ano } : undefined);

  useEffect(() => {
    if (!usaAno) return;
    if (availableYears.length === 0) return;
    if (!availableYears.includes(ano)) {
      setAno(availableYears[0]!);
    }
  }, [availableYears, ano, usaAno]);

  const classificacao = useMemo(() => resultados, [resultados]);

  return (
    <>
      <Head>
        <title>Classificacao dos Times | Estatisticas | Fut7Pro</title>
        <meta
          name="description"
          content="Classificacao completa dos times do seu racha, filtrando por quadrimestre, temporada atual ou todo o historico."
        />
        <meta
          name="keywords"
          content="classificacao times, futebol 7, ranking, tabela, estatisticas, fut7, Fut7Pro"
        />
      </Head>

      <main className="w-full min-h-screen bg-fundo text-white">
        <h1 className="sr-only">Classificacao dos Times de Futebol 7</h1>

        <div className="mb-4 mt-8 flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
            Classificacao dos Times
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <select
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
              className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
              aria-label="Selecionar periodo da classificacao"
            >
              {periodos.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {usaAno && (
              <select
                value={ano}
                onChange={(event) => setAno(Number(event.target.value))}
                className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
                aria-label="Selecionar ano"
                disabled={availableYears.length === 0}
              >
                {(availableYears.length ? availableYears : [ano]).map((anoOpt) => (
                  <option key={anoOpt} value={anoOpt}>
                    {anoOpt}
                  </option>
                ))}
              </select>
            )}
          </div>
          {atualizadoEm && (
            <p className="text-xs text-neutral-500">
              Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
            </p>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
          Acompanhe a evolucao dos times em cada fase do ano e descubra quem lidera o ranking geral.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
          </div>
        ) : isError ? (
          <div className="max-w-4xl mx-auto rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
            {error ?? "Nao foi possivel carregar a classificacao."}
          </div>
        ) : classificacao.length === 0 ? (
          <div className="max-w-4xl mx-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center text-neutral-300">
            Nenhum jogo finalizado para gerar a classificacao no periodo selecionado.
          </div>
        ) : (
          <div
            className="w-full overflow-x-auto pb-8"
            style={{ scrollbarColor: "#2a2a2a #111", scrollbarWidth: "thin" }}
            tabIndex={0}
            aria-label="Tabela de classificacao dos times"
          >
            <table className="w-full min-w-[600px] text-xs sm:text-sm border border-gray-700 bg-[#181818]">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-right text-yellow-400 text-base">Pontos</th>
                  <th className="p-2 text-right">Jogos</th>
                  <th className="p-2 text-right">Vitorias</th>
                  <th className="p-2 text-right">Empates</th>
                  <th className="p-2 text-right">Derrotas</th>
                  <th className="p-2 text-right">GP</th>
                  <th className="p-2 text-right">GC</th>
                  <th className="p-2 text-right">SG</th>
                </tr>
              </thead>
              <tbody>
                {classificacao.map((time: TimeClassificacao, idx: number) => {
                  const rowClass = idx === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
                  return (
                    <tr
                      key={time.id}
                      className={`border-t border-gray-700 hover:bg-[#232323] transition-all ${rowClass}`}
                    >
                      <td className="p-2 font-bold text-yellow-400">{idx + 1}</td>
                      <td className="flex items-center gap-2 p-2 whitespace-nowrap font-semibold text-white">
                        {time.logo && (
                          <Image
                            src={time.logo}
                            alt={`Escudo do time ${time.nome}`}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded"
                            sizes="24px"
                          />
                        )}
                        <span>{time.nome}</span>
                      </td>
                      <td className="text-right p-2 font-extrabold text-yellow-400 text-base">
                        {time.pontos}
                      </td>
                      <td className="text-right p-2">{time.jogos}</td>
                      <td className="text-right p-2">{time.vitorias}</td>
                      <td className="text-right p-2">{time.empates}</td>
                      <td className="text-right p-2">{time.derrotas}</td>
                      <td className="text-right p-2">{time.golsPro}</td>
                      <td className="text-right p-2">{time.golsContra}</td>
                      <td className="text-right p-2">{time.saldoGols}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
