"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { melhoresMeiasAnual } from "@/components/lists/mockMelhoresMeiasAnual";
import { melhoresMeiasPorQuadrimestre } from "@/components/lists/mockMelhoresMeiasPorQuadrimestre";
import type { RankingAtleta } from "@/types/estatisticas";

// Anos disponíveis (mock), do mais recente ao mais antigo
const anosDisponiveis = Object.keys(melhoresMeiasAnual)
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

export default function RankingMeiasPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("q1");

  let ranking: RankingAtleta[] = [];

  if (periodo === "temporada") {
    ranking = melhoresMeiasAnual[anoAtual] ?? [];
  } else if (periodo === "todas") {
    const todos: Record<string, RankingAtleta> = {};
    anosDisponiveis.forEach((anoOpt) => {
      const meias = melhoresMeiasAnual[anoOpt];
      if (meias && Array.isArray(meias)) {
        meias.forEach((atleta) => {
          if (!todos[atleta.id]) {
            todos[atleta.id] = { ...atleta };
          } else {
            todos[atleta.id]!.pontos += atleta.pontos;
            todos[atleta.id]!.jogos += atleta.jogos;
          }
        });
      }
    });
    ranking = Object.values(todos);
  } else {
    const quadrimestre = Number(periodo.replace("q", "")) as 1 | 2 | 3;
    ranking = melhoresMeiasPorQuadrimestre[anoAtual]?.[quadrimestre] ?? [];
  }

  const rankingFiltrado = ranking
    .filter((atleta) =>
      atleta.nome.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <>
      <Head>
        <title>Ranking dos Melhores Meias | Estatísticas</title>
        <meta
          name="description"
          content="Confira o ranking dos meias com mais destaque, seja por quadrimestre, na temporada atual ou no histórico completo do seu racha. Veja quem lidera na posição!"
        />
        <meta
          name="keywords"
          content="Ranking Meias, Melhores Meias, Estatísticas, Temporada Atual, Todas as Temporadas, Racha, Futebol 7"
        />
      </Head>
      <main className="min-h-screen w-full bg-fundo pb-16 pt-6 text-white">
        <h1 className="sr-only">Ranking dos Melhores Meias</h1>

        <div className="flex w-full flex-col items-center justify-center">
          <div className="flex w-full max-w-3xl flex-col items-center">
            <h2 className="mb-2 text-center text-2xl font-bold text-yellow-400 md:text-3xl">
              Melhores Meias
            </h2>
            <p className="mb-3 max-w-xl text-center text-sm text-gray-400">
              Veja o <b>Ranking dos Meias</b> com os maiores destaques por
              quadrimestre, na temporada atual ou no histórico completo do seu
              racha. Selecione o período para filtrar os jogadores que mais
              pontuaram na posição!
            </p>
            <div className="mb-4 flex flex-col items-center gap-2 md:flex-row">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="rounded border border-yellow-400 bg-zinc-900 px-3 py-2 text-sm text-yellow-400 focus:outline-none"
                aria-label="Selecionar período do ranking"
              >
                {periodos.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex w-full justify-center">
              <input
                type="text"
                className="w-full rounded border border-gray-600 bg-zinc-900 px-4 py-2 text-white placeholder-gray-400 sm:w-80"
                placeholder="Buscar meia por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar meia por nome"
              />
            </div>
          </div>
        </div>

        <div className="scrollbar-dark w-full overflow-x-auto">
          <table className="w-full min-w-[400px] border border-gray-700 text-xs sm:text-sm">
            <thead className="bg-[#2a2a2a] text-gray-300">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Atleta</th>
                <th className="p-2 text-right text-base text-yellow-400">
                  Pontos
                </th>
                <th className="p-2 text-right">Jogos</th>
              </tr>
            </thead>
            <tbody>
              {rankingFiltrado.map((atleta, idx) => {
                const rowClass =
                  idx === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
                return (
                  <tr
                    key={atleta.id}
                    className={`border-t border-gray-700 transition-all hover:bg-[#2a2a2a] ${rowClass}`}
                  >
                    <td className="p-2 font-bold text-yellow-400">{idx + 1}</td>
                    <td className="flex items-center gap-2 whitespace-nowrap p-2">
                      <Link href={`/atletas/${atleta.slug}`}>
                        <Image
                          src={atleta.foto}
                          alt={`Foto do atleta ${atleta.nome} – Ranking Meias`}
                          width={32}
                          height={32}
                          className="rounded-full border border-yellow-400"
                        />
                      </Link>
                      <Link
                        href={`/atletas/${atleta.slug}`}
                        className="font-semibold text-yellow-300 hover:underline"
                        title={`Ver perfil de ${atleta.nome}`}
                      >
                        <span className="break-words">{atleta.nome}</span>
                      </Link>
                    </td>
                    <td className="p-2 text-right text-base font-extrabold text-yellow-400">
                      {atleta.pontos}
                    </td>
                    <td className="p-2 text-right">{atleta.jogos}</td>
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
