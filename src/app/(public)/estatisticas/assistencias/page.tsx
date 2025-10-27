"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { useRankingAssistencias } from "@/hooks/useEstatisticas";
import type { RankingAtleta } from "@/types/estatisticas";

const periodos = [
  { label: "1o Quadrimestre", value: "q1" },
  { label: "2o Quadrimestre", value: "q2" },
  { label: "3o Quadrimestre", value: "q3" },
  { label: "Temporada Atual", value: "temporada" },
  { label: "Todas as Temporadas", value: "todas" },
];

export default function RankingAssistenciasPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("q1");
  const { resultados, isLoading, isError, error, atualizadoEm } = useRankingAssistencias(periodo);

  const rankingFiltrado = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return resultados
      .filter((atleta) => atleta.nome.toLowerCase().includes(termo))
      .sort((a, b) => b.assistencias - a.assistencias);
  }, [resultados, search]);

  return (
    <>
      <Head>
        <title>Ranking de Assistencias | Estatisticas | Fut7Pro</title>
        <meta
          name="description"
          content="Descubra quem mais contribuiu com passes para gol no seu racha. Filtre por quadrimestre, temporada atual ou historico completo de assistencias."
        />
        <meta
          name="keywords"
          content="Ranking Assistencias, Fut7Pro, futebol 7, passes, estatisticas, racha"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pb-16 pt-6 w-full">
        <h1 className="sr-only">Ranking de Assistencias</h1>

        <section className="w-full flex flex-col items-center">
          <div className="w-full max-w-3xl flex flex-col items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
              Ranking de Assistencias
            </h2>
            <p className="text-sm text-gray-400 max-w-xl text-center">
              Veja quem distribuiu mais passes para gol. Escolha o periodo para comparar
              assistencias por quadrimestre, temporada ou historico geral.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-2">
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
            <input
              type="text"
              className="w-full sm:w-80 rounded px-4 py-2 border border-gray-600 bg-zinc-900 text-white placeholder-gray-400"
              placeholder="Buscar atleta por nome..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar atleta por nome"
            />
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
          </div>
        ) : isError ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
            {error ?? "Nao foi possivel carregar o ranking de assistencias."}
          </div>
        ) : rankingFiltrado.length === 0 ? (
          <div className="max-w-3xl mx-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center text-neutral-300 mt-6">
            Nenhum registro encontrado para o periodo escolhido.
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-dark mt-6">
            <table className="w-full text-xs sm:text-sm border border-gray-700 min-w-[400px]">
              <thead className="bg-[#2a2a2a] text-gray-300">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Atleta</th>
                  <th className="p-2 text-right text-yellow-400 text-base">Assistencias</th>
                  <th className="p-2 text-right">Jogos</th>
                </tr>
              </thead>
              <tbody>
                {rankingFiltrado.map((atleta, idx) => {
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
                            alt={`Foto do atleta ${atleta.nome}`}
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
                        {atleta.assistencias}
                      </td>
                      <td className="text-right p-2">{atleta.jogos}</td>
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
