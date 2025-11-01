"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { PlayerRankingTable } from "@/components/statistics/PlayerRankingTable";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { type RankingExportFormat, useRankingExport } from "@/hooks/useRankingExport";

export default function RankingGeralPage() {
  const [search, setSearch] = useState("");
  const slug = usePublicTenantSlug();
  const { format, setFormat, exporting, feedback, setFeedback, handleExport } = useRankingExport({
    slug,
    type: "geral",
    limit: 100,
    filenamePrefix: "ranking-geral",
  });

  const { rankings, isLoading, error } = usePublicPlayerRankings({
    slug,
    type: "geral",
    limit: 100,
  });

  const filtrados = useMemo(() => {
    if (!search.trim()) return rankings;
    const termo = search.trim().toLowerCase();
    return rankings.filter((atleta) => atleta.nome.toLowerCase().includes(termo));
  }, [rankings, search]);

  return (
    <>
      <Head>
        <title>Ranking Geral de Pontos | Estatisticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking geral de pontos do futebol 7. Veja quem sao os atletas mais bem pontuados e acompanhe a disputa rodada a rodada."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking geral, pontos, estatisticas, atletas, jogadores, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-8 w-full">
        <h1 className="sr-only">
          Ranking Geral de Pontos do Futebol 7 - Atletas e Estatisticas do Fut7Pro
        </h1>

        <section className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">Ranking Geral</h2>
          <p className="text-sm text-gray-400 mb-5 max-w-2xl">
            Lista oficial dos atletas mais bem pontuados do racha. Os dados sao calculados e
            publicados diretamente pelo backend multi-tenant do Fut7Pro apos cada partida.
          </p>

          <div className="w-full sm:w-80">
            <input
              type="search"
              className="w-full rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none"
              placeholder="Buscar atleta por nome..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar atleta por nome no ranking geral"
            />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center">
            <select
              value={format}
              onChange={(event) => {
                setFormat(event.target.value as RankingExportFormat);
                setFeedback(null);
              }}
              className="bg-zinc-900 border border-gray-600 text-white text-sm px-3 py-2 rounded md:min-w-[140px]"
            >
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              type="button"
              onClick={() => handleExport()}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <FaSpinner className="animate-spin" /> Exportando...
                </>
              ) : (
                <>
                  <FaDownload /> Exportar {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
          {feedback && (
            <p
              className={`mt-2 text-sm ${feedback.type === "success" ? "text-green-400" : "text-red-400"}`}
            >
              {feedback.message}
            </p>
          )}
        </section>

        <section className="px-4 mt-6">
          <PlayerRankingTable
            rankings={filtrados}
            isLoading={isLoading}
            error={error ?? null}
            highlight="pontos"
            emptyMessage="Nenhum atleta encontrado no ranking geral para o filtro informado."
          />
        </section>
      </main>
    </>
  );
}
