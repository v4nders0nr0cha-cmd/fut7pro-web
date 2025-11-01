"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { PlayerRankingTable } from "@/components/statistics/PlayerRankingTable";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { POSITION_LABEL, type PositionValue } from "@/constants/positions";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { type RankingExportFormat, useRankingExport } from "@/hooks/useRankingExport";

const POSITION_VALUE: PositionValue = "goleiro";
const POSITION_TITLE = POSITION_LABEL[POSITION_VALUE];

export default function RankingGoleirosPage() {
  const [search, setSearch] = useState("");
  const slug = usePublicTenantSlug();

  const { rankings, isLoading, error } = usePublicPlayerRankings({
    slug,
    type: "geral",
    limit: 100,
    position: POSITION_VALUE,
  });

  const { format, setFormat, exporting, feedback, setFeedback, handleExport } = useRankingExport({
    slug,
    type: "geral",
    limit: 100,
    position: POSITION_VALUE,
    filenamePrefix: `melhores-${POSITION_VALUE}`,
  });

  const filtrados = useMemo(() => {
    if (!search.trim()) return rankings;
    const termo = search.trim().toLowerCase();
    return rankings.filter((atleta) => atleta.nome.toLowerCase().includes(termo));
  }, [rankings, search]);

  return (
    <>
      <Head>
        <title>Ranking dos Melhores {POSITION_TITLE}s | Estatisticas</title>
        <meta
          name="description"
          content={`Ranking oficial dos ${POSITION_TITLE.toLowerCase()}s que mais pontuaram no Fut7Pro.`}
        />
        <meta
          name="keywords"
          content="ranking goleiros, melhores goleiros, estatisticas, futebol 7, racha, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-8 w-full">
        <h1 className="sr-only">Ranking dos Melhores {POSITION_TITLE}s do Fut7Pro</h1>

        <section className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
            Melhores {POSITION_TITLE}s
          </h2>
          <p className="text-center text-sm text-gray-400 mb-5 max-w-2xl">
            Veja quem lidera a posicao de {POSITION_TITLE.toLowerCase()} considerando a pontuacao
            oficial do Fut7Pro.
          </p>
          <div className="w-full sm:w-80">
            <input
              type="search"
              className="w-full rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none"
              placeholder={`Buscar ${POSITION_TITLE.toLowerCase()} por nome...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label={`Buscar ${POSITION_TITLE.toLowerCase()} por nome`}
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
            emptyMessage={`Nenhum ${POSITION_TITLE.toLowerCase()} encontrado para o filtro informado.`}
          />
        </section>
      </main>
    </>
  );
}
