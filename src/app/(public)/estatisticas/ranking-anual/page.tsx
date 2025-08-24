"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { rankingAnuais } from "@/components/lists/mockRankingAnual"; // Caminho correto!
import type { RankingAtleta } from "@/types/estatisticas";

const anosDisponiveis = Object.keys(rankingAnuais)
  .map((x) => Number(x))
  .sort((a, b) => b - a);

const anoPadrao: number = anosDisponiveis[0] ?? new Date().getFullYear();

export default function RankingAnualPage() {
  const [ano, setAno] = useState<number>(anoPadrao);
  const [search, setSearch] = useState("");

  const ranking: RankingAtleta[] = (rankingAnuais[ano] || []).filter(
    (atleta: RankingAtleta) =>
      atleta.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Head>
        <title>Ranking Anual de Pontos | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking anual de pontos dos atletas do racha. Veja o desempenho no ano, compare e busque atletas. Estatísticas de futebol 7 sempre atualizadas no Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking anual, ranking de pontos, atletas, estatísticas, sistema de racha, futebol amador, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo p-2 text-white sm:p-4 md:p-6">
        <h1 className="sr-only">
          Ranking Anual de Pontos do Racha de Futebol 7 – Atletas, Pontuação,
          Estatísticas
        </h1>

        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 text-center md:text-left">
            <h2 className="mb-2 text-2xl font-bold text-yellow-400 md:text-3xl">
              Ranking Anual de Pontos
            </h2>
            <p className="mx-auto max-w-xl text-sm text-gray-400 md:mx-0">
              Veja o desempenho dos atletas no ano, filtre pelo seu nome e
              acompanhe sua posição. Use o seletor ao lado para mudar o ano da
              tabela.
            </p>
          </div>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="rounded border border-yellow-400 bg-zinc-900 px-3 py-2 text-sm text-yellow-400 focus:outline-none"
            aria-label="Selecionar ano"
          >
            {anosDisponiveis.map((anoOpt) => (
              <option key={anoOpt} value={anoOpt}>
                {anoOpt}
              </option>
            ))}
          </select>
        </div>

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
              {ranking.map((atleta: RankingAtleta, idx: number) => {
                let rowClass = "";
                if (idx === 0)
                  rowClass = "border-2 border-yellow-400 bg-[#232100]";
                if (idx === 1)
                  rowClass = "border-2 border-gray-400 bg-[#1e1e1e]";
                if (idx === 2)
                  rowClass = "border-2 border-orange-600 bg-[#231c00]";

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
