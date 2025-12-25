"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const anoAtual = new Date().getFullYear();

const periodos = [
  { label: "1� Quadrimestre", value: "q1" },
  { label: "2� Quadrimestre", value: "q2" },
  { label: "3� Quadrimestre", value: "q3" },
  { label: "Temporada Atual", value: "temporada" },
  { label: "Todas as Temporadas", value: "todas" },
];

export default function RankingMeiasPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("q1");
  const { publicHref, publicSlug } = usePublicLinks();

  const { rankings, isLoading, isError, error } = usePublicPlayerRankings(
    periodo === "temporada"
      ? { slug: publicSlug, type: "geral", period: "year", year: anoAtual, position: "meia" }
      : periodo === "todas"
        ? { slug: publicSlug, type: "geral", period: "all", position: "meia" }
        : {
            slug: publicSlug,
            type: "geral",
            period: "quarter",
            year: anoAtual,
            quarter: Number(periodo.replace("q", "")) as 1 | 2 | 3,
            position: "meia",
          }
  );

  const rankingFiltrado = (rankings as RankingAtleta[])
    .filter((atleta) => atleta.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <>
      <Head>
        <title>Ranking dos Melhores Meias | Estat�sticas</title>
        <meta
          name="description"
          content="Confira o ranking dos meias com mais destaque, seja por quadrimestre, na temporada atual ou no hist�rico completo do seu racha. Veja quem lidera na posi��o!"
        />
        <meta
          name="keywords"
          content="Ranking Meias, Melhores Meias, Estat�sticas, Temporada Atual, Todas as Temporadas, Racha, Futebol 7"
        />
      </Head>
      <main className="min-h-screen bg-fundo text-white pb-16 pt-6 w-full">
        <h1 className="sr-only">Ranking dos Melhores Meias</h1>

        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center mb-2">
              Melhores Meias
            </h2>
            <p className="text-center text-sm text-gray-400 mb-3 max-w-xl">
              Veja o <b>Ranking dos Meias</b> com os maiores destaques por quadrimestre, na
              temporada atual ou no hist�rico completo do seu racha. Selecione o per�odo para
              filtrar os jogadores que mais pontuaram na posi��o!
            </p>
            <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
                aria-label="Selecionar per�odo do ranking"
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
                placeholder="Buscar meia por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar meia por nome"
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-dark">
          {isLoading && (
            <div className="text-center text-gray-400 py-8">Carregando ranking dos meias...</div>
          )}
          {isError && !isLoading && (
            <div className="text-center text-red-400 py-8">
              Erro ao carregar ranking dos meias.
              {error && <div className="text-xs text-red-300 mt-1">{error}</div>}
            </div>
          )}
          {!isLoading && !isError && (
            <table className="w-full text-xs sm:text-sm border border-gray-700 min-w-[400px]">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Atleta</th>
                  <th className="p-2 text-right text-yellow-400 text-base">Pontos</th>
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
                        <Link href={publicHref(`/atletas/${atleta.slug}`)}>
                          <Image
                            src={atleta.foto}
                            alt={`Foto do atleta ${atleta.nome} - Ranking Meias`}
                            width={32}
                            height={32}
                            className="rounded-full border border-yellow-400"
                          />
                        </Link>
                        <Link
                          href={publicHref(`/atletas/${atleta.slug}`)}
                          className="text-yellow-300 hover:underline font-semibold"
                          title={`Ver perfil de ${atleta.nome}`}
                        >
                          <span className="break-words">{atleta.nome}</span>
                        </Link>
                      </td>
                      <td className="text-right p-2 font-extrabold text-yellow-400 text-base">
                        {atleta.pontos}
                      </td>
                      <td className="text-right p-2">{atleta.jogos}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
