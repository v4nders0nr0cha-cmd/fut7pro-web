"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const anoAtual = new Date().getFullYear();

const periodos = [
  { label: "1º Quadrimestre", value: "q1" },
  { label: "2º Quadrimestre", value: "q2" },
  { label: "3º Quadrimestre", value: "q3" },
  { label: "Temporada Atual", value: "temporada" },
  { label: "Todas as Temporadas", value: "todas" },
];

export default function RankingArtilheirosPage() {
  const searchParams = useSearchParams();
  const yearQuery = parseYear(searchParams.get("year"));
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState(
    normalizePeriodo(searchParams.get("period"), Boolean(yearQuery))
  );
  const { publicHref, publicSlug } = usePublicLinks();
  const anoReferencia = yearQuery ?? anoAtual;

  const { rankings, isLoading, isError, error } = usePublicPlayerRankings(
    periodo === "temporada"
      ? { slug: publicSlug, type: "artilheiros", period: "year", year: anoReferencia }
      : periodo === "todas"
        ? { slug: publicSlug, type: "artilheiros", period: "all" }
        : {
            slug: publicSlug,
            type: "artilheiros",
            period: "quarter",
            year: anoReferencia,
            quarter: Number(periodo.replace("q", "")) as 1 | 2 | 3,
          }
  );

  const rankingFiltrado = (rankings as RankingAtleta[])
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
          Ranking dos Artilheiros do Racha de Futebol 7 - Jogadores com Mais Gols, Estatísticas
        </h1>

        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand mb-2 text-center">
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
                className="bg-zinc-900 text-brand border border-brand rounded px-3 py-2 text-sm focus:outline-none"
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
          {isLoading && (
            <div className="text-center text-gray-400 py-8">
              Carregando ranking de artilheiros...
            </div>
          )}
          {isError && !isLoading && (
            <div className="text-center text-red-400 py-8">
              Erro ao carregar ranking de artilheiros.
              {error && <div className="text-xs text-red-300 mt-1">{error}</div>}
            </div>
          )}
          {!isLoading && !isError && (
            <table className="w-full text-xs sm:text-sm border border-gray-700 min-w-[400px]">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Atleta</th>
                  <th className="p-2 text-right text-brand text-base">Gols</th>
                  <th className="p-2 text-right">Jogos</th>
                </tr>
              </thead>
              <tbody>
                {rankingFiltrado.map((atleta, idx) => {
                  const rowClass = idx === 0 ? "border-2 border-brand bg-[#232100]" : "";
                  return (
                    <tr
                      key={atleta.id}
                      className={`border-t border-gray-700 hover:bg-[#2a2a2a] transition-all ${rowClass}`}
                    >
                      <td className="p-2 font-bold text-brand">{idx + 1}</td>
                      <td className="flex items-center gap-2 p-2 whitespace-nowrap">
                        <Link href={publicHref(`/atletas/${atleta.slug}`)}>
                          <Image
                            src={atleta.foto}
                            alt={`Foto do atleta ${atleta.nome} - Ranking Artilheiros Fut7Pro`}
                            width={32}
                            height={32}
                            className="rounded-full border border-brand"
                          />
                        </Link>
                        <Link
                          href={publicHref(`/atletas/${atleta.slug}`)}
                          className="text-brand-soft hover:underline font-semibold"
                          title={`Ver perfil de ${atleta.nome}`}
                        >
                          <span className="break-words">{atleta.nome}</span>
                        </Link>
                      </td>
                      <td className="text-right p-2 font-extrabold text-brand text-base">
                        {atleta.gols}
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

function parseYear(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function normalizePeriodo(value: string | null, hasYear: boolean) {
  if (!value) return hasYear ? "temporada" : "q1";
  const lower = value.toLowerCase();
  if (lower === "anual" || lower === "year") return "temporada";
  if (lower === "all") return "todas";
  if (["q1", "q2", "q3", "temporada", "todas"].includes(lower)) return lower;
  return hasYear ? "temporada" : "q1";
}
