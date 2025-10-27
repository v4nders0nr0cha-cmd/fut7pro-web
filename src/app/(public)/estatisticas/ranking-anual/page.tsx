"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRankingGeral } from "@/hooks/useEstatisticas";
import type { RankingAtleta } from "@/types/estatisticas";

const anoAtual = new Date().getFullYear();

export default function RankingAnualPage() {
  const [ano, setAno] = useState<number>(anoAtual);
  const [search, setSearch] = useState("");
  const { resultados, isLoading, isError, error, atualizadoEm, availableYears } = useRankingGeral(
    "anual",
    { ano }
  );

  useEffect(() => {
    if (availableYears.length === 0) return;
    if (!availableYears.includes(ano)) {
      setAno(availableYears[0]!);
    }
  }, [availableYears, ano]);

  const ranking = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return resultados.filter((atleta) => atleta.nome.toLowerCase().includes(termo));
  }, [resultados, search]);

  return (
    <>
      <Head>
        <title>Ranking Anual de Pontos | Estatisticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking anual de pontos dos atletas do racha. Veja o desempenho no ano e acompanhe sua posição."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking anual, ranking de pontos, atletas, estatisticas, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white p-2 sm:p-4 md:p-6">
        <h1 className="sr-only">Ranking Anual de Pontos do Racha de Futebol 7</h1>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
              Ranking Anual de Pontos
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto md:mx-0">
              Veja o desempenho dos atletas no ano selecionado, filtre pelo nome e acompanhe sua
              posição. Use o seletor ao lado para alterar o ano exibido.
            </p>
            {atualizadoEm && (
              <p className="mt-2 text-xs text-neutral-500">
                Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
          <select
            value={ano}
            onChange={(event) => setAno(Number(event.target.value))}
            className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
            aria-label="Selecionar ano"
            disabled={availableYears.length === 0}
          >
            {(availableYears.length ? availableYears : [ano]).map((anoOpt) => (
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
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar atleta por nome"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
          </div>
        ) : isError ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
            {error ?? "Nao foi possivel carregar o ranking."}
          </div>
        ) : ranking.length === 0 ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center text-neutral-300">
            Nenhum atleta encontrado para o ano selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border border-gray-700 min-w-[600px]">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Atleta</th>
                  <th className="p-2 text-right text-yellow-400 text-base">Pontos</th>
                  <th className="p-2 text-right">Jogos</th>
                  <th className="p-2 text-right">Vitorias</th>
                  <th className="p-2 text-right">Empates</th>
                  <th className="p-2 text-right">Derrotas</th>
                  <th className="p-2 text-right">Gols</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((atleta: RankingAtleta, idx: number) => {
                  let rowClass = "";
                  if (idx === 0) rowClass = "border-2 border-yellow-400 bg-[#232100]";
                  else if (idx === 1) rowClass = "border-2 border-gray-400 bg-[#1e1e1e]";
                  else if (idx === 2) rowClass = "border-2 border-orange-600 bg-[#231c00]";

                  const profileHref = atleta.slug ? `/atletas/${atleta.slug}` : "#";
                  const linkProps = atleta.slug
                    ? {}
                    : {
                        onClick: (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault(),
                        role: "button",
                      };

                  return (
                    <tr
                      key={atleta.id || `${atleta.nome}-${idx}`}
                      className={`border-t border-gray-700 hover:bg-[#2a2a2a] transition-all ${rowClass}`}
                    >
                      <td className="p-2 font-bold text-yellow-400">{idx + 1}</td>
                      <td className="flex items-center gap-2 p-2 whitespace-nowrap">
                        <Link href={profileHref} {...linkProps}>
                          <Image
                            src={atleta.foto}
                            alt={`Foto de ${atleta.nome}`}
                            width={32}
                            height={32}
                            className="rounded-full border border-yellow-400"
                          />
                        </Link>
                        <Link
                          href={profileHref}
                          className="text-yellow-300 hover:underline font-semibold"
                          title={`Ver perfil de ${atleta.nome}`}
                          {...linkProps}
                        >
                          <span className="break-words">{atleta.nome}</span>
                        </Link>
                      </td>
                      <td className="text-right p-2 font-extrabold text-yellow-400 text-base">
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
          </div>
        )}
      </main>
    </>
  );
}
