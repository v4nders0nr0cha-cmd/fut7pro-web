"use client";

import Head from "next/head";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";

export default function ConquistasAtletaPage() {
  const { slug } = useParams() as { slug: string };
  const { rankings, isLoading, isError } = usePublicPlayerRankings({
    type: "geral",
    period: "all",
    limit: 200,
  });

  const atleta = rankings.find((a) => a.slug === slug);

  return (
    <>
      <Head>
        <title>Conquistas | {atleta?.nome || "Atleta"} | Fut7Pro</title>
      </Head>
      <main className="max-w-4xl mx-auto px-2 py-10">
        <Link href={`/atletas/${slug}`} className="text-yellow-400 underline text-sm">
          ← Voltar para o perfil
        </Link>

        {isLoading && <div className="text-gray-300 mt-4">Carregando conquistas...</div>}
        {isError && <div className="text-red-300 mt-4">Falha ao carregar conquistas.</div>}
        {!isLoading && !isError && atleta && (
          <div className="mt-4 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h1 className="text-2xl font-bold text-yellow-400 mb-2">Conquistas</h1>
            <p className="text-gray-300 text-sm">
              As conquistas públicas do atleta aparecerão aqui quando forem cadastradas e publicadas
              pelo racha.
            </p>
          </div>
        )}
        {!isLoading && !isError && !atleta && (
          <div className="text-gray-300 mt-4">Atleta não encontrado.</div>
        )}
      </main>
    </>
  );
}
