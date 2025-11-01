"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { PlayerRankingTable } from "@/components/statistics/PlayerRankingTable";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { type RankingExportFormat, useRankingExport } from "@/hooks/useRankingExport";

export default function RankingAssistenciasPage() {
  const [search, setSearch] = useState("");
  const slug = usePublicTenantSlug();
  const { format, setFormat, exporting, feedback, setFeedback, handleExport } = useRankingExport({
    slug,
    type: "assistencias",
    limit: 100,
    filenamePrefix: "ranking-assistencias",
  });

  const { rankings, isLoading, error } = usePublicPlayerRankings({
    slug,
    type: "assistencias",
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
        <title>Ranking de Assistencias | Estatisticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking oficial de assistencias do Fut7Pro. Descubra quem mais participa dos gols com passes decisivos."
        />
        <meta
          name="keywords"
          content="ranking assistencias, Fut7Pro, futebol 7, passes para gol, estatisticas, racha"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-8 w-full">
        <h1 className="sr-only">
          Ranking de Assistencias - Jogadores com Mais Passes para Gol no Fut7Pro
        </h1>

        <section className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
            Ranking de Assistencias
          </h2>
          <p className="text-sm text-gray-400 mb-5 max-w-2xl">
            Dados consolidados pelo backend multi-tenant mostrando quem mais deu assistencias em
            partidas oficiais.
          </p>

          <div className="w-full sm:w-80">
            <input
              type="search"
              className="w-full rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none"
              placeholder="Buscar atleta por nome..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar atleta por nome no ranking de assistencias"
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
            highlight="assistencias"
            emptyMessage="Nenhum atleta encontrado no ranking de assistencias para o filtro informado."
          />
        </section>
      </main>
    </>
  );
}
