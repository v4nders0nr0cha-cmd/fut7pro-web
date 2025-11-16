"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { FaDownload, FaSpinner } from "react-icons/fa";
import { PlayerRankingTable } from "@/components/statistics/PlayerRankingTable";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { type RankingExportFormat, useRankingExport } from "@/hooks/useRankingExport";

const QUADRIMESTRES = [
  { value: 1 as const, label: "1º Quadrimestre (Jan-Abr)" },
  { value: 2 as const, label: "2º Quadrimestre (Mai-Ago)" },
  { value: 3 as const, label: "3º Quadrimestre (Set-Dez)" },
];

export default function RankingQuadrimestralPage() {
  const slug = usePublicTenantSlug();
  const [anoSelecionado, setAnoSelecionado] = useState(() => new Date().getFullYear());
  const [quadrimestre, setQuadrimestre] = useState<(typeof QUADRIMESTRES)[number]["value"]>(1);
  const [search, setSearch] = useState("");

  const { data, rankings, isLoading, error } = usePublicPlayerRankings({
    slug,
    type: "geral",
    limit: 200,
    period: "quarter",
    year: anoSelecionado,
    quarter: quadrimestre,
  });

  const anosDisponiveis = useMemo(() => {
    const list = data?.availableYears ?? [];
    return [...list].sort((a, b) => b - a);
  }, [data?.availableYears]);

  useEffect(() => {
    if (!anosDisponiveis.length) return;
    if (!anosDisponiveis.includes(anoSelecionado)) {
      setAnoSelecionado(anosDisponiveis[0]);
    }
  }, [anosDisponiveis, anoSelecionado]);

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
    return `Período considerado: ${inicioFormatado} até ${fimFormatado} (horário de Fortaleza)`;
  }, [data?.appliedPeriod?.start, data?.appliedPeriod?.end]);

  const { format, setFormat, exporting, feedback, setFeedback, handleExport } = useRankingExport({
    slug,
    type: "geral",
    limit: 200,
    period: "quarter",
    year: anoSelecionado,
    quarter: quadrimestre,
    filenamePrefix: `ranking-quadrimestral-${anoSelecionado}-q${quadrimestre}`,
  });

  const filtrados = useMemo(() => {
    if (!search.trim()) return rankings;
    const termo = search.trim().toLowerCase();
    return rankings.filter((atleta) => atleta.nome.toLowerCase().includes(termo));
  }, [rankings, search]);

  return (
    <>
      <Head>
        <title>Ranking Quadrimestral de Pontos | Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking quadrimestral de pontos dos atletas do racha. Veja o desempenho por quadrimestre com dados reais do Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking quadrimestral, ranking de pontos, atletas, estatísticas, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white p-2 sm:p-4 md:p-6">
        <h1 className="sr-only">
          Ranking Quadrimestral de Pontos do Racha de Futebol 7 - Atletas, Pontuação, Estatísticas
        </h1>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
              Ranking Quadrimestral de Pontos
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto md:mx-0">
              Veja o desempenho dos atletas em cada quadrimestre com dados oficiais do Fut7Pro.
              Ajuste o ano, quadrimestre e exporte o ranking em instantes.
            </p>
            {periodoDescricao && <p className="text-xs text-gray-500 mt-1">{periodoDescricao}</p>}
          </div>
          <div className="flex flex-row gap-2">
            {anosDisponiveis.length > 0 && (
              <select
                value={anoSelecionado}
                onChange={(event) => setAnoSelecionado(Number(event.target.value))}
                className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
                aria-label="Selecionar ano"
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            )}
            <select
              value={quadrimestre}
              onChange={(event) => setQuadrimestre(Number(event.target.value) as 1 | 2 | 3)}
              className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
              aria-label="Selecionar quadrimestre"
            >
              {QUADRIMESTRES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 max-w-4xl mx-auto">
          <input
            type="search"
            className="w-full sm:w-64 rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400"
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
        </div>

        {feedback && (
          <p
            className={`text-sm text-center mb-4 ${
              feedback.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {feedback.message}
          </p>
        )}

        <section className="px-1 md:px-2">
          <PlayerRankingTable
            rankings={filtrados}
            isLoading={isLoading}
            error={error ?? null}
            highlight="pontos"
            emptyMessage={
              anosDisponiveis.length === 0
                ? "Ainda não existem registros quadrimestrais para este racha."
                : "Nenhum atleta encontrado para o quadrimestre e filtros informados."
            }
          />
        </section>
      </main>
    </>
  );
}
