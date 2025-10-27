"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { useRankingGeral } from "@/hooks/useEstatisticas";
import type { RankingAtleta } from "@/types/estatisticas";

const periodos = [
  { label: "1o Quadrimestre", value: "q1" },
  { label: "2o Quadrimestre", value: "q2" },
  { label: "3o Quadrimestre", value: "q3" },
  { label: "Temporada Atual", value: "anual" },
  { label: "Todas as Temporadas", value: "historico" },
];

export default function RankingGeralPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("q1");
  const { resultados, isLoading, isError, error, atualizadoEm } = useRankingGeral(periodo);

  const rankingFiltrado = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return resultados
      .filter((atleta) => atleta.nome.toLowerCase().includes(termo))
      .sort((a, b) => b.pontos - a.pontos);
  }, [resultados, search]);

  return (
    <>
      <Head>
        <title>Ranking Geral de Pontos | Estatisticas | Fut7Pro</title>
        <meta
          name="description"
          content="Ranking geral de pontos do futebol 7. Veja quem sao os atletas mais bem pontuados em cada periodo ou no historico completo. Dados atualizados automaticamente."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, ranking geral, temporada atual, ranking de pontos, atletas, estatisticas, Fut7Pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-6">
        <h1 className="sr-only">Ranking Geral de Pontos do Futebol 7</h1>

        <section className="flex flex-col items-center gap-4 mt-4 md:mt-6">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
            Ranking Geral de Pontos
          </h2>
          <p className="text-center text-sm text-gray-400 max-w-2xl">
            Consulte os atletas com maior pontuacao acumulada. Escolha o periodo para alternar entre
            quadrimestres, temporada atual ou historico geral do seu racha.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
              className="bg-zinc-900 text-yellow-400 border border-yellow-400 rounded px-3 py-2 text-sm focus:outline-none"
              aria-label="Selecionar periodo do ranking"
            >
              {periodos.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {atualizadoEm && (
              <span className="text-xs text-neutral-400">
                Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
              </span>
            )}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 max-w-3xl mx-auto mt-6">
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
        ) : rankingFiltrado.length === 0 ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center text-neutral-300">
            Nenhum atleta encontrado para o periodo selecionado.
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
                {rankingFiltrado.map((atleta: RankingAtleta, idx: number) => {
                  const rowClass = idx === 0 ? "border-2 border-yellow-400 bg-[#232100]" : "";
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
