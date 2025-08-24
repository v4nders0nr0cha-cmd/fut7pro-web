"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { atletasMock } from "@/components/lists/mockAtletas";
import Head from "next/head";

export default function ConquistasTodasPage() {
  const { slug } = useParams() as { slug: string };
  const atleta = atletasMock.find((a) => a.slug === slug);

  if (!atleta) return notFound();

  const {
    titulosGrandesTorneios = [],
    titulosAnuais = [],
    titulosQuadrimestrais = [],
  } = atleta.conquistas ?? {};

  return (
    <>
      <Head>
        <title>Todas as Conquistas de {atleta.nome} | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja todos os títulos e conquistas de ${atleta.nome} em grandes torneios, temporadas e quadrimestres do seu racha no Fut7Pro.`}
        />
        <meta
          name="keywords"
          content={`fut7, conquistas, títulos, perfil, ${atleta.nome}, futebol 7, racha`}
        />
      </Head>

      <h1 className="mb-4 mt-8 text-center text-3xl font-bold text-yellow-400">
        Todas as Conquistas de {atleta.nome}
      </h1>

      {/* BOTÃO VOLTAR */}
      <div className="mb-8 text-center">
        <Link
          href={`/atletas/${atleta.slug}`}
          className="inline-block rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
        >
          ← Voltar para o perfil
        </Link>
      </div>

      {/* TÍTULOS GRANDES TORNEIOS */}
      <section className="scrollbar-dark mx-auto mb-8 w-full max-w-3xl overflow-x-auto">
        <h2 className="mb-3 border-b border-zinc-700 pb-1 text-xl font-semibold text-yellow-300">
          Títulos (Grandes Torneios)
        </h2>
        {titulosGrandesTorneios.length === 0 ? (
          <p className="italic text-zinc-400">
            Nenhum título de grande torneio.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {titulosGrandesTorneios.map((titulo, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-xl bg-[#222] px-3 py-1 text-sm text-yellow-100"
                title={titulo.descricao}
              >
                <span>{titulo.icone}</span>
                <span>
                  {titulo.descricao}{" "}
                  <span className="text-xs text-gray-400">{titulo.ano}</span>
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* TÍTULOS DA TEMPORADA ATUAL (Anuais) */}
      <section className="scrollbar-dark mx-auto mb-8 w-full max-w-3xl overflow-x-auto">
        <h2 className="mb-3 border-b border-zinc-700 pb-1 text-xl font-semibold text-yellow-300">
          Títulos da Temporada atual
        </h2>
        {titulosAnuais.length === 0 ? (
          <p className="italic text-zinc-400">
            Nenhum título na temporada atual.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {titulosAnuais.map((titulo, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-xl bg-[#222] px-3 py-1 text-sm text-yellow-100"
                title={titulo.descricao}
              >
                <span>{titulo.icone}</span>
                <span>
                  {titulo.descricao}{" "}
                  <span className="text-xs text-gray-400">{titulo.ano}</span>
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* TÍTULOS QUADRIMESTRAIS */}
      <section className="scrollbar-dark mx-auto mb-8 w-full max-w-3xl overflow-x-auto">
        <h2 className="mb-3 border-b border-zinc-700 pb-1 text-xl font-semibold text-yellow-300">
          Títulos Quadrimestrais
        </h2>
        {titulosQuadrimestrais.length === 0 ? (
          <p className="italic text-zinc-400">Nenhum título quadrimestral.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {titulosQuadrimestrais.map((titulo, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-xl bg-[#222] px-3 py-1 text-sm text-yellow-100"
                title={titulo.descricao}
              >
                <span>{titulo.icone}</span>
                <span>
                  {titulo.descricao}{" "}
                  <span className="text-xs text-gray-400">{titulo.ano}</span>
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
