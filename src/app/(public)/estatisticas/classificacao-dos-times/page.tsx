"use client";

import Head from "next/head";
import { useState } from "react";
import { classificacaoTimesAnual } from "@/components/lists/mockClassificacaoTimesAnual";
import { classificacaoTimesPorQuadrimestre } from "@/components/lists/mockClassificacaoTimesPorQuadrimestre";
import { classificacaoTimesHistorico } from "@/components/lists/mockClassificacaoTimesHistorico";
import type { TimeClassificacao } from "@/types/estatisticas";

const periodos = [
  { label: "1º Quadrimestre", value: "q1" },
  { label: "2º Quadrimestre", value: "q2" },
  { label: "3º Quadrimestre", value: "q3" },
  { label: "Anual", value: "anual" },
  { label: "Todas as Temporadas", value: "historico" }, // atualizado
];

export default function ClassificacaoTimesPage() {
  const [periodo, setPeriodo] = useState("q1");
  const anoAtual = 2025;

  let classificacao: TimeClassificacao[] = [];
  if (periodo === "anual") {
    classificacao = classificacaoTimesAnual[anoAtual] ?? [];
  } else if (periodo === "historico") {
    classificacao = classificacaoTimesHistorico ?? [];
  } else {
    const quadrimestre = Number(periodo.replace("q", "")) as 1 | 2 | 3;
    classificacao =
      classificacaoTimesPorQuadrimestre[anoAtual]?.[quadrimestre] ?? [];
  }

  return (
    <>
      <Head>
        <title>Classificação dos Times | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Veja a classificação dos times de futebol 7 por quadrimestre, anual ou somando todas as temporadas. Compare desempenho, acompanhe estatísticas completas e descubra os maiores campeões do seu racha no Fut7Pro."
        />
        <meta
          name="keywords"
          content="classificação de times, futebol 7, ranking, tabela, histórico, temporadas, pontos, estatísticas, fut7, racha, SaaS, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen w-full bg-fundo text-white">
        {/* H1 oculto para SEO */}
        <h1 className="sr-only">
          Classificação dos Times – Tabela de Pontuação, Estatísticas dos Times,
          Ranking de Futebol 7 no Fut7Pro
        </h1>

        <div className="mb-4 mt-8 flex flex-col items-center gap-4">
          <h2 className="text-center text-2xl font-bold text-yellow-400 md:text-3xl">
            Classificação dos Times
          </h2>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded border border-yellow-400 bg-zinc-900 px-3 py-2 text-sm text-yellow-400 focus:outline-none"
            aria-label="Selecionar período da classificação"
          >
            {periodos.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-gray-400">
          Veja a <b>classificação dos times</b> atualizada por quadrimestre, ano
          ou confira quem lidera em <b>Todas as Temporadas</b>. Compare o
          desempenho das equipes em cada fase e descubra os maiores campeões da
          história do seu racha, tudo atualizado automaticamente pelo Fut7Pro.
        </p>

        {/* Tabela responsiva, com scroll dark sempre garantido */}
        <div
          className="w-full overflow-x-auto pb-8"
          style={{
            scrollbarColor: "#2a2a2a #111",
            scrollbarWidth: "thin",
          }}
          tabIndex={0}
          aria-label="Tabela de classificação dos times, role lateralmente para ver todas as colunas"
        >
          <table className="w-full min-w-[600px] border border-gray-700 bg-[#181818] text-xs sm:text-sm">
            <thead className="bg-[#2a2a2a] text-gray-300">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-right text-base text-yellow-400">
                  Pontos
                </th>
                <th className="p-2 text-right">Jogos</th>
                <th className="p-2 text-right">Vitórias</th>
                <th className="p-2 text-right">Empates</th>
                <th className="p-2 text-right">Derrotas</th>
                <th className="p-2 text-right">GP</th>
                <th className="p-2 text-right">GC</th>
                <th className="p-2 text-right">SG</th>
              </tr>
            </thead>
            <tbody>
              {classificacao.map((time: TimeClassificacao, idx: number) => {
                const rowClass =
                  idx === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
                return (
                  <tr
                    key={time.id}
                    className={`border-t border-gray-700 transition-all hover:bg-[#232323] ${rowClass}`}
                  >
                    <td className="p-2 font-bold text-yellow-400">{idx + 1}</td>
                    <td className="flex items-center gap-2 whitespace-nowrap p-2 font-semibold text-white">
                      {time.logo && (
                        <img
                          src={time.logo}
                          alt={`Escudo do time ${time.nome} de futebol 7`}
                          className="mr-2 h-6 w-6 rounded"
                        />
                      )}
                      <span>{time.nome}</span>
                    </td>
                    <td className="p-2 text-right text-base font-extrabold text-yellow-400">
                      {time.pontos}
                    </td>
                    <td className="p-2 text-right">{time.jogos}</td>
                    <td className="p-2 text-right">{time.vitorias}</td>
                    <td className="p-2 text-right">{time.empates}</td>
                    <td className="p-2 text-right">{time.derrotas}</td>
                    <td className="p-2 text-right">{time.golsPro}</td>
                    <td className="p-2 text-right">{time.golsContra}</td>
                    <td className="p-2 text-right">{time.saldoGols}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
