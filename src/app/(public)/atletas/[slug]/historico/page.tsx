"use client";

import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import type { JogoAtleta } from "@/types/atletas";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";

export default function HistoricoCompletoPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { athlete, isLoading, isError, error } = usePublicAthlete(slug);

  const agrupadoPorAno = useMemo(() => {
    if (!athlete) return {} as Record<string, JogoAtleta[]>;

    return athlete.historico.reduce<Record<string, JogoAtleta[]>>((acc, jogo) => {
      const ano = new Date(jogo.data).getFullYear().toString();
      if (!acc[ano]) acc[ano] = [];
      acc[ano].push(jogo);
      return acc;
    }, {});
  }, [athlete]);

  const anosOrdenados = useMemo(
    () => Object.keys(agrupadoPorAno).sort((a, b) => Number(b) - Number(a)),
    [agrupadoPorAno]
  );

  if (!slug) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-fundo text-gray-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
        <p className="mt-4 text-sm">Carregando histórico do atleta...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-fundo text-center px-4">
        <Head>
          <title>Erro ao carregar histórico | Fut7Pro</title>
        </Head>
        <p className="text-red-300 text-lg font-semibold mb-2">
          Não foi possível carregar o histórico do atleta.
        </p>
        <p className="text-gray-400 text-sm mb-6">{error ?? "Tente novamente em instantes."}</p>
        <Link
          href={`/atletas/${slug}`}
          className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded"
        >
          Voltar ao perfil do atleta
        </Link>
      </div>
    );
  }

  if (!athlete) {
    return notFound();
  }

  return (
    <>
      <Head>
        <title>Histórico Completo de {athlete.nome} | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja o histórico completo de partidas, desempenho e pontuação do atleta ${athlete.nome} no Fut7Pro.`}
        />
        <meta
          name="keywords"
          content={`fut7, histórico, partidas, desempenho, ${athlete.nome}, futebol 7, racha`}
        />
      </Head>

      <h1 className="text-3xl font-bold text-yellow-400 mt-8 mb-6 text-center">
        Histórico completo de {athlete.nome}
      </h1>

      <div className="w-full">
        {anosOrdenados.length === 0 && (
          <p className="text-center text-gray-400">
            Ainda não há partidas registradas para este atleta.
          </p>
        )}

        {anosOrdenados.map((ano) => (
          <div key={ano} className="mb-10 w-full">
            <h2 className="text-lg font-semibold text-white mb-2">📅 {ano}</h2>
            <div className="w-full overflow-x-auto scrollbar-dark">
              <table className="min-w-[700px] text-sm border border-zinc-700 bg-zinc-900">
                <thead className="bg-zinc-900 text-gray-300">
                  <tr>
                    <th className="p-2 border">Data</th>
                    <th className="p-2 border">Time</th>
                    <th className="p-2 border">Resultado</th>
                    <th className="p-2 border">Gols</th>
                    <th className="p-2 border">Campeão?</th>
                    <th className="p-2 border">Pontuação</th>
                    <th className="p-2 border">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {agrupadoPorAno[ano]?.map((jogo, index) => (
                    <tr key={`${ano}-${index}`} className="text-center">
                      <td className="p-2 border">{jogo.data}</td>
                      <td className="p-2 border">{jogo.time}</td>
                      <td className="p-2 border">{jogo.resultado}</td>
                      <td className="p-2 border">{jogo.gols}</td>
                      <td className="p-2 border">{jogo.campeao ? "🏆" : ""}</td>
                      <td className="p-2 border">{jogo.pontuacao}</td>
                      <td className="p-2 border">
                        <button className="text-yellow-400 hover:underline" type="button">
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-dark::-webkit-scrollbar {
          height: 8px;
          background: #18181b;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 6px;
        }
        .scrollbar-dark {
          scrollbar-color: #333 #18181b;
          scrollbar-width: thin;
        }
      `}</style>
    </>
  );
}
