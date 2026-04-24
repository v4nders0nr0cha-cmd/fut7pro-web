"use client";

import Head from "next/head";
import { useState } from "react";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import ResponsiveAthleteRanking from "@/components/estatisticas/ResponsiveAthleteRanking";
import PageHelp from "@/components/public/PageHelp";

const anoAtual = new Date().getFullYear();

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
  const { publicHref, publicSlug } = usePublicLinks();

  const { rankings, isLoading, isError, error } = usePublicPlayerRankings(
    periodo === "anual"
      ? { slug: publicSlug, type: "geral", period: "year", year: anoAtual }
      : periodo === "historico"
        ? { slug: publicSlug, type: "geral", period: "all" }
        : {
            slug: publicSlug,
            type: "geral",
            period: "quarter",
            year: anoAtual,
            quarter: Number(periodo.replace("q", "")) as 1 | 2 | 3,
          }
  );

  const rankingFiltrado = (rankings as RankingAtleta[])
    .filter((atleta) => atleta.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <>
      <Head>
        <title>Ranking Geral de Pontos | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking geral de pontos do futebol 7. Veja quem são os atletas mais bem pontuados em cada quadrimestre, na temporada atual ou em todas as temporadas. Inspire-se para subir na tabela. Estatísticas sempre atualizadas. Fut7Pro - Plataforma para racha, futebol 7 e futebol amador."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking geral, todas as temporadas, temporada atual, ranking de pontos, atletas, jogadores, pontuação, estatísticas, sistema de racha, futebol amador, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white">
        <h1 className="sr-only">
          Ranking Geral de Pontos do Futebol 7 - Atletas, Pontuação, Estatísticas, Todas as
          Temporadas, Temporada Atual
        </h1>

        <div className="flex flex-col items-center gap-3 mt-8 md:mt-10">
          <PageHelp
            title="Ranking Geral de Pontos"
            summary="Pontuação consolidada dos atletas por quadrimestre, temporada ou histórico completo."
            detailsTitle="Como funciona o Ranking Geral"
            details={
              <>
                <p>
                  O Ranking Geral mostra a pontuação dos atletas calculada a partir das partidas
                  publicadas no Fut7Pro.
                </p>
                <p>
                  Use o seletor de período para alternar entre 1º, 2º, 3º Quadrimestre, Temporada
                  Atual ou Todas as Temporadas. A tabela é atualizada conforme os resultados são
                  registrados pelo painel administrativo.
                </p>
                <p>
                  Busque seu nome para acompanhar sua evolução e comparar sua posição com os demais
                  atletas do racha.
                </p>
              </>
            }
          />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-zinc-900 text-brand border border-brand rounded px-3 py-2 text-sm min-h-[44px] focus:outline-none"
            aria-label="Selecionar período do ranking"
          >
            {periodos.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 max-w-3xl mx-auto">
          <input
            type="text"
            className="w-full sm:w-64 rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400"
            placeholder="Buscar atleta por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar atleta por nome"
          />
        </div>

        <section className="w-full">
          {isLoading && (
            <div className="py-8 text-center text-gray-400">Carregando ranking geral...</div>
          )}
          {isError && !isLoading && (
            <div className="py-8 text-center text-red-400">
              Erro ao carregar ranking geral.
              {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
            </div>
          )}
          {!isLoading && !isError && (
            <ResponsiveAthleteRanking
              athletes={rankingFiltrado}
              publicHref={publicHref}
              highlightMode="first"
            />
          )}
        </section>
      </main>
    </>
  );
}
