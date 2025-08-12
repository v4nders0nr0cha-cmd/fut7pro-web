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
    classificacao = classificacaoTimesPorQuadrimestre[anoAtual]?.[quadrimestre] ?? [];
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

      <main className="w-full min-h-screen bg-fundo text-white">
        {/* H1 oculto para SEO */}
        <h1 className="sr-only">
          Classificação dos Times – Tabela de Pontuação, Estatísticas dos Times, Ranking de Futebol
          7 no Fut7Pro
        </h1>

        <div className="mb-4 mt-8 flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
            Classificação dos Times
          </h2>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
            aria-label="Selecionar período da classificação"
          >
            {periodos.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-center text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
          Veja a <b>classificação dos times</b> atualizada por quadrimestre, ano ou confira quem
          lidera em <b>Todas as Temporadas</b>. Compare o desempenho das equipes em cada fase e
          descubra os maiores campeões da história do seu racha, tudo atualizado automaticamente
          pelo Fut7Pro.
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
          <table className="w-full min-w-[600px] text-xs sm:text-sm border border-gray-700 bg-[#181818]">
            <thead className="bg-[#2a2a2a] text-gray-300">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-right text-yellow-400 text-base">Pontos</th>
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
                const rowClass = idx === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
                return (
                  <tr
                    key={time.id}
                    className={`border-t border-gray-700 hover:bg-[#232323] transition-all ${rowClass}`}
                  >
                    <td className="p-2 font-bold text-yellow-400">{idx + 1}</td>
                    <td className="flex items-center gap-2 p-2 whitespace-nowrap font-semibold text-white">
                      {time.logo && (
                        <img
                          src={time.logo}
                          alt={`Escudo do time ${time.nome} de futebol 7`}
                          className="w-6 h-6 rounded mr-2"
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
      </main>
    </>
  );
}
