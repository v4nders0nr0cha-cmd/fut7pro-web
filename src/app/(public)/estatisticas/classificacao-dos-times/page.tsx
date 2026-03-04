"use client";

import Head from "next/head";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import ResponsiveTeamRanking from "@/components/estatisticas/ResponsiveTeamRanking";

const anoAtual = new Date().getFullYear();

const periodos = [
  { label: "1o Quadrimestre", value: "q1" },
  { label: "2o Quadrimestre", value: "q2" },
  { label: "3o Quadrimestre", value: "q3" },
  { label: "Temporada Atual", value: "temporada" },
  { label: "Todas as Temporadas", value: "todas" },
];

export default function ClassificacaoTimesPage() {
  const searchParams = useSearchParams();
  const yearQuery = parseYear(searchParams.get("year"));
  const [periodo, setPeriodo] = useState(normalizePeriodo(searchParams.get("period")));
  const { publicSlug } = usePublicLinks();
  const anoReferencia = yearQuery ?? anoAtual;

  const { teams, isLoading, isError, error } = usePublicTeamRankings(
    periodo === "temporada"
      ? { slug: publicSlug, period: "year", year: anoReferencia }
      : periodo === "todas"
        ? { slug: publicSlug, period: "all" }
        : {
            slug: publicSlug,
            period: "quarter",
            year: anoReferencia,
            quarter: Number(periodo.replace("q", "")) as 1 | 2 | 3,
          }
  );

  return (
    <>
      <Head>
        <title>Classificação dos Times | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Veja a classificação dos times de futebol 7 com base nos dados reais do seu racha. Acompanhe pontos, jogos, vitórias, empates e derrotas, sempre atualizados a partir das partidas registradas no painel Fut7Pro."
        />
        <meta
          name="keywords"
          content="classificação de times, futebol 7, ranking, tabela, temporadas, pontos, estatísticas, fut7, racha, SaaS, Fut7Pro"
        />
      </Head>

      <main className="w-full min-h-screen bg-fundo text-white">
        {/* H1 oculto para SEO */}
        <h1 className="sr-only">
          Classificaçãoo dos Times - Tabela de Pontuação, Estatísticas dos Times, Ranking de Futebol
          7 no Fut7Pro
        </h1>

        <div className="mb-4 mt-8 flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-brand text-center">
            Classificação dos Times
          </h2>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-zinc-900 text-brand border border-brand rounded px-3 py-2 text-sm min-h-[44px] focus:outline-none"
            aria-label="Selecionar periodo da classificacao"
          >
            {periodos.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-center text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
          Veja a <b>classificacao dos times</b> baseada nas partidas registradas no painel admin.
          Selecione 1o, 2o, 3o Quadrimestre, Temporada Atual ou Todas as Temporadas para comparar o
          desempenho dos times no seu racha.
        </p>

        <section className="w-full px-2 pb-8 sm:px-4">
          {isLoading && (
            <div className="py-8 text-center text-gray-400">Carregando classificação dos times...</div>
          )}
          {isError && !isLoading && (
            <div className="py-8 text-center text-red-400">
              Erro ao carregar classificação dos times.
              {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
            </div>
          )}
          {!isLoading && !isError && <ResponsiveTeamRanking teams={teams} highlightMode="first" />}
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

function normalizePeriodo(value: string | null) {
  if (!value) return "temporada";
  const lower = value.toLowerCase();
  if (lower === "anual" || lower === "year") return "temporada";
  if (lower === "all" || lower === "historico") return "todas";
  if (["q1", "q2", "q3", "temporada", "todas"].includes(lower)) return lower;
  return "temporada";
}
