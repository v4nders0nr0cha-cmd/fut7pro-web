"use client";

import Head from "next/head";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";

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
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
            Classificação dos Times
          </h2>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
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

        {/* Tabela responsiva, com scroll dark sempre garantido */}
        <div
          className="w-full overflow-x-auto pb-8"
          style={{
            scrollbarColor: "#2a2a2a #111",
            scrollbarWidth: "thin",
          }}
          tabIndex={0}
          aria-label="Tabela de classificação dos times, role lateralmente para ver todas as colunas"
        >
          {isLoading && (
            <div className="py-8 text-center text-gray-400">
              Carregando classificação dos times...
            </div>
          )}
          {isError && !isLoading && (
            <div className="py-8 text-center text-red-400">
              Erro ao carregar classificação dos times.
              {error && <div className="mt-1 text-xs text-red-300">{error}</div>}
            </div>
          )}
          {!isLoading && !isError && (
            <table className="w-full min-w-[600px] text-xs sm:text-sm border border-gray-700 bg-[#181818]">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-right text-yellow-400 text-base">Pontos</th>
                  <th className="p-2 text-right">Jogos</th>
                  <th className="p-2 text-right">Vitórias</th>
                  <th className="p-2 text-right">Empates</th>
                  <th className="p-2 text-right">Derrotas</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((time, idx: number) => {
                  const rowClass = idx === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
                  return (
                    <tr
                      key={time.id}
                      className={`border-t border-gray-700 hover:bg-[#232323] transition-all ${rowClass}`}
                    >
                      <td className="p-2 font-bold text-yellow-400">{idx + 1}</td>
                      <td className="flex items-center gap-2 p-2 whitespace-nowrap font-semibold text-white">
                        {time.logo && (
                          <img
                            src={time.logo}
                            alt={`Escudo do time ${time.nome} de futebol 7`}
                            className="w-6 h-6 rounded mr-2"
                          />
                        )}
                        <span>{time.nome}</span>
                      </td>
                      <td className="text-right p-2 font-extrabold text-yellow-400 text-base">
                        {time.pontos}
                      </td>
                      <td className="text-right p-2">{time.jogos}</td>
                      <td className="text-right p-2">{time.vitorias}</td>
                      <td className="text-right p-2">{time.empates}</td>
                      <td className="text-right p-2">{time.derrotas}</td>
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

function normalizePeriodo(value: string | null) {
  if (!value) return "temporada";
  const lower = value.toLowerCase();
  if (lower === "anual" || lower === "year") return "temporada";
  if (lower === "all" || lower === "historico") return "todas";
  if (["q1", "q2", "q3", "temporada", "todas"].includes(lower)) return lower;
  return "temporada";
}
