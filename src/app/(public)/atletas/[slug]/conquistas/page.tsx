"use client";

import Head from "next/head";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";

export default function ConquistasTodasPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { athlete, isLoading, isError, error } = usePublicAthlete(slug);

  if (!slug) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-fundo text-gray-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
        <p className="mt-4 text-sm">Carregando conquistas do atleta...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-fundo text-center px-4">
        <Head>
          <title>Erro ao carregar conquistas | Fut7Pro</title>
        </Head>
        <p className="text-red-300 text-lg font-semibold mb-2">
          Não foi possível carregar as conquistas do atleta.
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

  const {
    titulosGrandesTorneios = [],
    titulosAnuais = [],
    titulosQuadrimestrais = [],
  } = athlete.conquistas ?? {};

  return (
    <>
      <Head>
        <title>Todas as Conquistas de {athlete.nome} | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja todos os títulos e conquistas de ${athlete.nome} em grandes torneios, temporadas e quadrimestres do seu racha no Fut7Pro.`}
        />
        <meta
          name="keywords"
          content={`fut7, conquistas, títulos, perfil, ${athlete.nome}, futebol 7, racha`}
        />
      </Head>

      <h1 className="text-3xl font-bold text-yellow-400 mt-8 mb-4 text-center">
        Todas as Conquistas de {athlete.nome}
      </h1>

      <div className="mb-8 text-center">
        <Link
          href={`/atletas/${athlete.slug}`}
          className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded transition"
        >
          ← Voltar para o perfil
        </Link>
      </div>

      <section className="mb-8 w-full max-w-3xl mx-auto scrollbar-dark overflow-x-auto">
        <h2 className="text-xl text-yellow-300 font-semibold mb-3 border-b border-zinc-700 pb-1">
          Títulos (Grandes Torneios)
        </h2>
        {titulosGrandesTorneios.length === 0 ? (
          <p className="text-zinc-400 italic">Nenhum título de grande torneio registrado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {titulosGrandesTorneios.map((titulo, index) => (
              <span
                key={`${titulo.descricao}-${index}`}
                className="bg-[#222] rounded-xl px-3 py-1 text-sm flex items-center gap-1 text-yellow-100"
                title={titulo.descricao}
              >
                <span>{titulo.icone}</span>
                <span>
                  {titulo.descricao} <span className="text-xs text-gray-400">{titulo.ano}</span>
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 w-full max-w-3xl mx-auto scrollbar-dark overflow-x-auto">
        <h2 className="text-xl text-yellow-300 font-semibold mb-3 border-b border-zinc-700 pb-1">
          Títulos da Temporada
        </h2>
        {titulosAnuais.length === 0 ? (
          <p className="text-zinc-400 italic">Nenhum título registrado na temporada atual.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {titulosAnuais.map((titulo, index) => (
              <span
                key={`${titulo.descricao}-${index}`}
                className="bg-[#222] rounded-xl px-3 py-1 text-sm flex items-center gap-1 text-yellow-100"
                title={titulo.descricao}
              >
                <span>{titulo.icone}</span>
                <span>
                  {titulo.descricao} <span className="text-xs text-gray-400">{titulo.ano}</span>
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 w-full max-w-3xl mx-auto scrollbar-dark overflow-x-auto">
        <h2 className="text-xl text-yellow-300 font-semibold mb-3 border-b border-zinc-700 pb-1">
          Títulos Quadrimestrais
        </h2>
        {titulosQuadrimestrais.length === 0 ? (
          <p className="text-zinc-400 italic">Nenhum título quadrimestral registrado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {titulosQuadrimestrais.map((titulo, index) => (
              <span
                key={`${titulo.descricao}-${index}`}
                className="bg-[#222] rounded-xl px-3 py-1 text-sm flex items-center gap-1 text-yellow-100"
                title={titulo.descricao}
              >
                <span>{titulo.icone}</span>
                <span>
                  {titulo.descricao} <span className="text-xs text-gray-400">{titulo.ano}</span>
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

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
