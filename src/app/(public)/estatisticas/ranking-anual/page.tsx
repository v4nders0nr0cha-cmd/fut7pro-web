"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { RankingAtleta } from "@/types/estatisticas";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";

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
            className="bg-zinc-900 text-brand border border-brand rounded px-3 py-2 text-sm focus:outline-none"
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

        <div className="overflow-x-auto">
          {isLoading && (
            <div className="text-center text-gray-400 py-8">Carregando ranking anual...</div>
          )}
          {isError && !isLoading && (
            <div className="text-center text-red-400 py-8">
              Erro ao carregar ranking anual.
              {error && <div className="text-xs text-red-300 mt-1">{error}</div>}
            </div>
          )}
          {!isLoading && !isError && (
            <table className="w-full text-xs sm:text-sm border border-gray-700 min-w-[600px]">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Atleta</th>
                  <th className="p-2 text-right text-brand text-base">Pontos</th>
                  <th className="p-2 text-right">Jogos</th>
                  <th className="p-2 text-right">Vitórias</th>
                  <th className="p-2 text-right">Empates</th>
                  <th className="p-2 text-right">Derrotas</th>
                  <th className="p-2 text-right">Gols</th>
                </tr>
              </thead>
              <tbody>
                {rankingFiltrado.map((atleta, idx) => {
                  let rowClass = "";
                  if (idx === 0) rowClass = "border-2 border-brand bg-[#232100]";
                  if (idx === 1) rowClass = "border-2 border-gray-400 bg-[#1e1e1e]";
                  if (idx === 2) rowClass = "border-2 border-orange-600 bg-[#231c00]";

                  return (
                    <tr
                      key={atleta.id}
                      className={`border-t border-gray-700 hover:bg-[#2a2a2a] transition-all ${rowClass}`}
                    >
                      <td className="p-2 font-bold text-brand">{idx + 1}</td>
                      <td className="flex items-center gap-2 p-2 whitespace-nowrap">
                        <Link href={publicHref(`/atletas/${atleta.slug}`)}>
                          <Image
                            src={atleta.foto}
                            alt={`Foto de ${atleta.nome}`}
                            width={32}
                            height={32}
                            className="rounded-full border border-brand"
                          />
                        </Link>
                        <Link
                          href={publicHref(`/atletas/${atleta.slug}`)}
                          className="text-brand-soft hover:underline font-semibold"
                          title={`Ver perfil de ${atleta.nome}`}
                        >
                          <span className="break-words">{atleta.nome}</span>
                        </Link>
                      </td>
                      <td className="text-right p-2 font-extrabold text-brand text-base">
                        {atleta.pontos}
                      </td>
                      <td className="text-right p-2">{atleta.jogos}</td>
                      <td className="text-right p-2">{atleta.vitorias}</td>
                      <td className="text-right p-2">{atleta.empates}</td>
                      <td className="text-right p-2">{atleta.derrotas}</td>
                      <td className="text-right p-2">{atleta.gols}</td>
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
