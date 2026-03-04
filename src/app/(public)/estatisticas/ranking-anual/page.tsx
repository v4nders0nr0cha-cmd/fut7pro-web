"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import ResponsiveAthleteRanking from "@/components/estatisticas/ResponsiveAthleteRanking";

const anoAtual = new Date().getFullYear();

export default function RankingAnualPage() {
  const searchParams = useSearchParams();
  const anoQuery = parseYear(searchParams.get("year"));
  const [ano, setAno] = useState<number>(anoQuery ?? anoAtual);
  const [search, setSearch] = useState("");
  const { publicHref, publicSlug } = usePublicLinks();

  const { rankings, availableYears, isLoading, isError, error } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: ano,
  });

  const anosDisponiveis = (
    availableYears && availableYears.length > 0
      ? [...availableYears].sort((a, b) => b - a)
      : [anoAtual]
  ) as number[];

  const anoSelecionado = anosDisponiveis.includes(ano) ? ano : anosDisponiveis[0];

  const rankingFiltrado = (rankings as RankingAtleta[])
    .filter((atleta) => atleta.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pontos - a.pontos);

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

      <main className="min-h-screen bg-fundo text-white p-2 sm:p-4 md:p-6">
        <h1 className="sr-only">
          Ranking Anual de Pontos do Racha de Futebol 7 - Atletas, Pontuação, Estatísticas
        </h1>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-brand mb-2">
              Ranking Anual de Pontos
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto md:mx-0">
              Veja o desempenho dos atletas no ano, filtre pelo seu nome e acompanhe sua posição.
              Use o seletor ao lado para mudar o ano da tabela.
            </p>
          </div>
          <select
            value={anoSelecionado}
            onChange={(e) => setAno(Number(e.target.value))}
            className="bg-zinc-900 text-brand border border-brand rounded px-3 py-2 text-sm min-h-[44px] focus:outline-none"
            aria-label="Selecionar ano"
          >
            {anosDisponiveis.map((anoOpt) => (
              <option key={anoOpt} value={anoOpt}>
                {anoOpt}
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
            <div className="py-8 text-center text-gray-400">Carregando ranking anual...</div>
          )}
          {isError && !isLoading && (
            <div className="py-8 text-center text-red-400">
              Erro ao carregar ranking anual.
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

function parseYear(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}
