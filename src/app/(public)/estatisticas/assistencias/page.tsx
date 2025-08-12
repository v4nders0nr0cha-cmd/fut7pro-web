"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { assistenciasAnual } from "@/components/lists/mockAssistenciasAnual";
import { assistenciasPorQuadrimestre } from "@/components/lists/mockAssistenciasPorQuadrimestre";
import type { RankingAtleta } from "@/types/estatisticas";

// Obtém anos disponíveis (mock), do mais recente ao mais antigo
const anosDisponiveis = Object.keys(assistenciasAnual)
  .map(Number)
  .sort((a, b) => b - a);

const anoAtual = anosDisponiveis[0] ?? new Date().getFullYear();

const periodos = [
  { label: "1º Quadrimestre", value: "q1" },
  { label: "2º Quadrimestre", value: "q2" },
  { label: "3º Quadrimestre", value: "q3" },
  { label: "Temporada Atual", value: "temporada" },
  { label: "Todas as Temporadas", value: "todas" },
];

export default function RankingAssistenciasPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("q1");

  let ranking: RankingAtleta[] = [];

  if (periodo === "temporada") {
    // Temporada atual = ano mais recente do mock
    ranking = assistenciasAnual[anoAtual] ?? [];
  } else if (periodo === "todas") {
    // Todas as temporadas = soma todos os anos disponíveis
    const todos: Record<string, RankingAtleta> = {};
    anosDisponiveis.forEach((anoOpt) => {
      const assist = assistenciasAnual[anoOpt];
      if (assist && Array.isArray(assist)) {
        assist.forEach((atleta) => {
          if (!todos[atleta.id]) {
            todos[atleta.id] = { ...atleta };
          } else {
            todos[atleta.id]!.assistencias += atleta.assistencias;
            todos[atleta.id]!.jogos += atleta.jogos;
          }
        });
      }
    });
    ranking = Object.values(todos);
  } else {
    // Quadrimestres (sempre usa ano atual)
    const quadrimestre = Number(periodo.replace("q", "")) as 1 | 2 | 3;
    ranking = assistenciasPorQuadrimestre[anoAtual]?.[quadrimestre] ?? [];
  }

  // Ordena pelo número de assistências (maior para menor)
  const rankingFiltrado = ranking
    .filter((atleta) => atleta.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.assistencias - a.assistencias);

  return (
    <>
      <Head>
        <title>Ranking de Assistências | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Confira o Ranking de Assistências. Veja quem mais participou dos gols, compare por quadrimestre, temporada atual ou no histórico completo de temporadas do seu racha."
        />
        <meta
          name="keywords"
          content="Ranking Assistências, Fut7Pro, futebol 7, passes para gol, estatísticas, temporada atual, todas as temporadas, racha"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-6 w-full">
        <h1 className="sr-only">Ranking de Assistências – Jogadores com Mais Passes para Gol</h1>

        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center mb-2">
              Ranking de Assistências
            </h2>
            <p className="text-center text-sm text-gray-400 mb-3 max-w-xl">
              Veja quem mais colaborou com seus companheiros no <b>Ranking de Assistências</b>.
              Compare o desempenho por quadrimestre, na temporada atual ou no histórico completo de
              todas as temporadas do seu racha. Selecione o período abaixo para visualizar os
              destaques.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
                aria-label="Selecionar período do ranking"
              >
                {periodos.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full flex justify-center mb-4">
              <input
                type="text"
                className="w-full sm:w-80 rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400"
                placeholder="Buscar atleta por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar atleta por nome"
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-dark">
          <table className="w-full text-xs sm:text-sm border border-gray-700 min-w-[400px]">
            <thead className="bg-[#2a2a2a] text-gray-300">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Atleta</th>
                <th className="p-2 text-right text-yellow-400 text-base">Assistências</th>
                <th className="p-2 text-right">Jogos</th>
              </tr>
            </thead>
            <tbody>
              {rankingFiltrado.map((atleta, idx) => {
                const rowClass = idx === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
                return (
                  <tr
                    key={atleta.id}
                    className={`border-t border-gray-700 hover:bg-[#2a2a2a] transition-all ${rowClass}`}
                  >
                    <td className="p-2 font-bold text-yellow-400">{idx + 1}</td>
                    <td className="flex items-center gap-2 p-2 whitespace-nowrap">
                      <Link href={`/atletas/${atleta.slug}`}>
                        <Image
                          src={atleta.foto}
                          alt={`Foto do atleta ${atleta.nome} – Ranking Assistências Fut7Pro`}
                          width={32}
                          height={32}
                          className="rounded-full border border-yellow-400"
                        />
                      </Link>
                      <Link
                        href={`/atletas/${atleta.slug}`}
                        className="text-yellow-300 hover:underline font-semibold"
                        title={`Ver perfil de ${atleta.nome}`}
                      >
                        <span className="break-words">{atleta.nome}</span>
                      </Link>
                    </td>
                    <td className="text-right p-2 font-extrabold text-yellow-400 text-base">
                      {atleta.assistencias}
                    </td>
                    <td className="text-right p-2">{atleta.jogos}</td>
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
