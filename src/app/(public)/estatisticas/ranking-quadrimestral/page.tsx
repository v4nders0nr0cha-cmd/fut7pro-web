"use client";

import { useMemo, useState } from "react";
import Head from "next/head";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import ResponsiveAthleteRanking from "@/components/estatisticas/ResponsiveAthleteRanking";
import PageHelp from "@/components/public/PageHelp";

const quadrimestres = [
  { value: 1, label: "Q1 (Jan-Abr)" },
  { value: 2, label: "Q2 (Mai-Ago)" },
  { value: 3, label: "Q3 (Set-Dez)" },
];

const anoAtual = new Date().getFullYear();

export default function RankingQuadrimestralPage() {
  const [ano, setAno] = useState<number>(anoAtual);
  const [quadrimestre, setQuadrimestre] = useState<number>(1);
  const [search, setSearch] = useState("");
  const { publicHref, publicSlug } = usePublicLinks();

  const { rankings, availableYears, isLoading, isError, error } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "quarter",
    year: ano,
    quarter: quadrimestre as 1 | 2 | 3,
  });

  const anosDisponiveis = useMemo(
    () =>
      (availableYears && availableYears.length > 0
        ? [...availableYears].sort((a, b) => b - a)
        : [anoAtual]) as number[],
    [availableYears]
  );

  const anoSelecionado = anosDisponiveis.includes(ano) ? ano : anosDisponiveis[0];

  const rankingFiltrado = (rankings as RankingAtleta[])
    .filter((atleta) => atleta.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <>
      <Head>
        <title>Ranking Quadrimestral de Pontos | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking quadrimestral de pontos dos atletas do racha. Veja o desempenho por quadrimestre, compare e busque atletas. Estatísticas de futebol 7 sempre atualizadas no Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking quadrimestral, ranking de pontos, atletas, estatísticas, sistema de racha, futebol amador, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white p-2 sm:p-4 md:p-6">
        <h1 className="sr-only">
          Ranking Quadrimestral de Pontos do Racha de Futebol 7 - Atletas, Pontuação, Estatísticas
        </h1>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex-1 text-center md:text-left">
            <PageHelp
              title="Ranking Quadrimestral de Pontos"
              summary="Pontuação dos atletas por quadrimestre, ano e busca individual."
              align="left"
              detailsTitle="Como funciona o Ranking Quadrimestral"
              details={
                <>
                  <p>
                    O ano é dividido em três quadrimestres: janeiro a abril, maio a agosto e
                    setembro a dezembro.
                  </p>
                  <p>
                    Selecione o ano e o quadrimestre para ver a disputa daquele recorte. A busca
                    ajuda a localizar rapidamente qualquer atleta na tabela.
                  </p>
                </>
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <select
              value={anoSelecionado}
              onChange={(e) => setAno(Number(e.target.value))}
              className="w-full bg-zinc-900 text-brand border border-brand rounded px-3 py-2 text-sm min-h-[44px] focus:outline-none sm:w-auto"
              aria-label="Selecionar ano"
            >
              {anosDisponiveis.map((anoOpt) => (
                <option key={anoOpt} value={anoOpt}>
                  {anoOpt}
                </option>
              ))}
            </select>
            <select
              value={quadrimestre}
              onChange={(e) => setQuadrimestre(Number(e.target.value))}
              className="w-full bg-zinc-900 text-brand border border-brand rounded px-3 py-2 text-sm min-h-[44px] focus:outline-none sm:w-auto"
              aria-label="Selecionar quadrimestre"
            >
              {quadrimestres.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
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
            <div className="py-8 text-center text-gray-400">
              Carregando ranking quadrimestral...
            </div>
          )}
          {isError && !isLoading && (
            <div className="py-8 text-center text-red-400">
              Erro ao carregar ranking quadrimestral.
              {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
            </div>
          )}
          {!isLoading && !isError && (
            <ResponsiveAthleteRanking
              athletes={rankingFiltrado}
              publicHref={publicHref}
              highlightMode="podium"
            />
          )}
        </section>
      </main>
    </>
  );
}
