"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { RankingAtleta } from "@/types/estatisticas";
import { rankingAnuais } from "@/components/lists/mockRankingAnual";
import { rankingsPorQuadrimestre } from "@/components/lists/mockRankingsPorQuadrimestre";
import { rankingHistorico } from "@/components/lists/mockRankingHistorico";

const periodos = [
  { label: "1º Quadrimestre", value: "q1" },
  { label: "2º Quadrimestre", value: "q2" },
  { label: "3º Quadrimestre", value: "q3" },
  { label: "Temporada Atual", value: "anual" },
  { label: "Todas as Temporadas", value: "historico" },
];

export default function RankingGeralPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("q1");
  const anoAtual = 2025;

  let ranking: RankingAtleta[] = [];
  if (periodo === "anual") {
    ranking = rankingAnuais[anoAtual] ?? [];
  } else if (periodo === "historico") {
    ranking = rankingHistorico;
  } else {
    const quadrimestre = Number(periodo.replace("q", "")) as 1 | 2 | 3;
    ranking = rankingsPorQuadrimestre[anoAtual]?.[quadrimestre] ?? [];
  }

  const rankingFiltrado = ranking.filter((atleta: RankingAtleta) =>
    atleta.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Head>
        <title>Ranking Geral de Pontos | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking geral de pontos do futebol 7. Veja quem são os atletas mais bem pontuados em cada quadrimestre, na temporada atual ou em todas as temporadas. Inspire-se para subir na tabela. Estatísticas sempre atualizadas. Fut7Pro – Plataforma para racha, futebol 7 e futebol amador."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking geral, todas as temporadas, temporada atual, ranking de pontos, atletas, jogadores, pontuação, estatísticas, sistema de racha, futebol amador, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white">
        <h1 className="sr-only">
          Ranking Geral de Pontos do Futebol 7 – Atletas, Pontuação,
          Estatísticas, Todas as Temporadas, Temporada Atual
        </h1>

        <div className="mt-8 flex flex-col items-center gap-4 md:mt-10">
          <h2 className="text-center text-2xl font-bold text-yellow-400 md:text-3xl">
            Ranking Geral de Pontos
          </h2>
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

        <p className="mx-auto mb-6 mt-4 max-w-2xl text-center text-sm text-gray-400">
          Confira abaixo o{" "}
          <b>
            Ranking Geral de <span className="text-yellow-400">PONTOS</span>
          </b>{" "}
          atualizado a cada partida.
          <br />
          Acima, você pode alternar entre <b>1º, 2º, 3º Quadrimestre</b>,{" "}
          <b>Temporada Atual</b> ou <b>Todas as Temporadas</b> para ver quem são
          os maiores pontuadores em cada período ou no histórico completo do seu
          racha.
          <br />
          Busque seu nome, acompanhe sua evolução e desafie-se a subir no
          ranking do Fut7Pro.
        </p>

        <div className="mx-auto mb-4 flex max-w-3xl flex-col items-center gap-4 sm:flex-row">
          <input
            type="text"
            className="w-full rounded border border-gray-600 bg-zinc-900 px-4 py-2 text-white placeholder-gray-400 sm:w-64"
            placeholder="Buscar atleta por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar atleta por nome"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border border-gray-700 text-xs sm:text-sm">
            <thead className="bg-[#2a2a2a] text-gray-300">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Atleta</th>
                <th className="p-2 text-right text-base text-yellow-400">
                  Pontos
                </th>
                <th className="p-2 text-right">Jogos</th>
                <th className="p-2 text-right">Vitórias</th>
                <th className="p-2 text-right">Empates</th>
                <th className="p-2 text-right">Derrotas</th>
                <th className="p-2 text-right">Gols</th>
              </tr>
            </thead>
            <tbody>
              {rankingFiltrado.map((atleta: RankingAtleta, idx: number) => {
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
                          alt={`Foto de ${atleta.nome}`}
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
                    <td className="p-2 text-right">{atleta.vitorias}</td>
                    <td className="p-2 text-right">{atleta.empates}</td>
                    <td className="p-2 text-right">{atleta.derrotas}</td>
                    <td className="p-2 text-right">{atleta.gols}</td>
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
