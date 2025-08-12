"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { artilheirosAnual } from "@/components/lists/mockArtilheirosAnual";
import { artilheirosPorQuadrimestre } from "@/components/lists/mockArtilheirosPorQuadrimestre";
import type { RankingAtleta } from "@/types/estatisticas";

// Gera os anos disponíveis pelo mock, do mais recente ao mais antigo
const anosDisponiveis = Object.keys(artilheirosAnual)
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

export default function RankingArtilheirosPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("q1");

  let ranking: RankingAtleta[] = [];

  if (periodo === "temporada") {
    // Temporada atual = ano mais recente do mock
    ranking = artilheirosAnual[anoAtual] ?? [];
  } else if (periodo === "todas") {
    // Todas as temporadas = soma todos os anos disponíveis
    const todos: Record<string, RankingAtleta> = {};
    anosDisponiveis.forEach((anoOpt) => {
      const artilheiros = artilheirosAnual[anoOpt];
      if (artilheiros && Array.isArray(artilheiros)) {
        artilheiros.forEach((atleta) => {
          if (!todos[atleta.id]) {
            todos[atleta.id] = { ...atleta };
          } else {
            todos[atleta.id]!.gols += atleta.gols;
            todos[atleta.id]!.jogos += atleta.jogos;
          }
        });
      }
    });
    ranking = Object.values(todos);
  } else {
    // Quadrimestres (sempre usa ano atual)
    const quadrimestre = Number(periodo.replace("q", "")) as 1 | 2 | 3;
    ranking = artilheirosPorQuadrimestre[anoAtual]?.[quadrimestre] ?? [];
  }

  const rankingFiltrado = ranking
    .filter((atleta) => atleta.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.gols - a.gols);

  return (
    <>
      <Head>
        <title>Ranking dos Artilheiros | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Veja o ranking dos artilheiros do racha de futebol 7. Descubra quem fez mais gols na temporada atual, por quadrimestre ou em todas as temporadas do Fut7Pro."
        />
        <meta
          name="keywords"
          content="Ranking Artilheiros, Fut7Pro, futebol 7, estatísticas, temporada atual, todas as temporadas, jogadores, gols, racha"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-6 w-full">
        <h1 className="sr-only">
          Ranking dos Artilheiros do Racha de Futebol 7 – Jogadores com Mais Gols, Estatísticas
        </h1>

        <div className="w-full flex flex-col items-center justify-center">
          {/* Bloco centralizado */}
          <div className="w-full max-w-3xl flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 text-center">
              Ranking dos Artilheiros
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mb-3 text-center">
              Confira quem balançou mais as redes e compare o desempenho por quadrimestre, na
              temporada atual ou em todas as temporadas do Racha.
              <br className="hidden sm:inline" />
              Selecione o período abaixo para filtrar o ranking.
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
                <th className="p-2 text-right text-yellow-400 text-base">Gols</th>
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
                          alt={`Foto do atleta ${atleta.nome} – Ranking Artilheiros Fut7Pro`}
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
                      {atleta.gols}
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
