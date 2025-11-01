"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { PlayerRankingTable } from "@/components/statistics/PlayerRankingTable";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { type RankingExportFormat, useRankingExport } from "@/hooks/useRankingExport";

export default function RankingAnualPage() {
  const [anoSelecionado, setAnoSelecionado] = useState<number>(() => new Date().getFullYear());
  const [search, setSearch] = useState("");
  const slug = usePublicTenantSlug();

  const { data, rankings, isLoading, error } = usePublicPlayerRankings({
    slug,
    type: "geral",
    limit: 200,
    period: "year",
    year: anoSelecionado,
  });

  const { format, setFormat, exporting, feedback, setFeedback, handleExport } = useRankingExport({
    slug,
    type: "geral",
    limit: 200,
    period: "year",
    year: anoSelecionado,
    filenamePrefix: `ranking-anual-${anoSelecionado}`,
  });

  const anosDisponiveis = useMemo(() => {
    const list = data?.availableYears ?? [];
    return [...list].sort((a, b) => b - a);
  }, [data?.availableYears]);

  const periodoDescricao = useMemo(() => {
    const inicio = data?.appliedPeriod?.start;
    const fim = data?.appliedPeriod?.end;
    if (!inicio || !fim) {
      return null;
    }
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Fortaleza",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const inicioFormatado = formatter.format(new Date(inicio));
    const fimFormatado = formatter.format(new Date(fim));
    return `Periodo considerado: ${inicioFormatado} ate ${fimFormatado} (horario de Fortaleza)`;
  }, [data?.appliedPeriod?.start, data?.appliedPeriod?.end]);

  useEffect(() => {
    if (!anosDisponiveis.length) {
      return;
    }
    if (!anosDisponiveis.includes(anoSelecionado)) {
      setAnoSelecionado(anosDisponiveis[0]);
    }
  }, [anosDisponiveis, anoSelecionado]);

  const filtrados = useMemo(() => {
    if (!search.trim()) return rankings;
    const termo = search.trim().toLowerCase();
    return rankings.filter((atleta) => atleta.nome.toLowerCase().includes(termo));
  }, [rankings, search]);

  return (
    <>
      <Head>
        <title>Ranking Anual de Pontos | Estatisticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking anual de pontos dos atletas do Fut7Pro. Filtre por ano e acompanhe quem liderou cada temporada."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking anual, pontos, estatisticas, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-8 w-full">
        <h1 className="sr-only">
          Ranking Anual de Pontos do Racha de Futebol 7 - Atletas e Estatisticas
        </h1>

        <section className="w-full max-w-4xl mx-auto px-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
              Ranking Anual de Pontos
            </h2>
            <p className="text-sm text-gray-400">
              Selecione o ano para visualizar quem dominou a temporada. Essas informacoes sao
              geradas automaticamente a partir dos dados oficiais do Fut7Pro.
            </p>
            {periodoDescricao && <p className="text-xs text-gray-500 mt-1">{periodoDescricao}</p>}
          </div>

          {anosDisponiveis.length > 0 && (
            <select
              value={anoSelecionado}
              onChange={(event) => setAnoSelecionado(Number(event.target.value))}
              className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
              aria-label="Selecionar ano do ranking"
            >
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          )}
        </section>

        <section className="w-full max-w-3xl mx-auto px-4 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <input
            type="search"
            className="w-full sm:w-auto flex-1 rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none"
            placeholder="Buscar atleta por nome..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar atleta por nome"
          />
          <div className="flex flex-col sm:flex-row gap-3 items-center">
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
        </section>

        {feedback && (
          <p
            className={`w-full max-w-3xl mx-auto px-4 -mt-4 mb-6 text-sm ${
              feedback.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {feedback.message}
          </p>
        )}

        <section className="px-4">
          <PlayerRankingTable
            rankings={filtrados}
            isLoading={isLoading}
            error={error ?? null}
            highlight="pontos"
            emptyMessage={
              anosDisponiveis.length === 0
                ? "Ainda nao existem registros de ranking para este racha."
                : "Nenhum atleta encontrado para o ano e filtro informados."
            }
          />
        </section>
      </main>
    </>
  );
}
