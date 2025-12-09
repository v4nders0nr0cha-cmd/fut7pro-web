"use client";

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";

export default function PerfilAtletaPage() {
  const { slug } = useParams() as { slug: string };
  const { rankings, isLoading, isError } = usePublicPlayerRankings({
    type: "geral",
    period: "all",
    limit: 200,
  });

  const atleta = rankings.find((a) => a.slug === slug);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-2 py-12 text-gray-300">Carregando atleta...</div>
    );
  }

  if (isError || !atleta) {
    notFound();
  }

  return (
    <>
      <Head>
        <title>{atleta?.nome || "Atleta"} | Fut7Pro</title>
        <meta
          name="description"
          content={`Perfil público do atleta ${atleta?.nome || ""} com estatísticas do racha.`}
        />
      </Head>
      <main className="max-w-4xl mx-auto px-2 py-10">
        <Link href="/atletas" className="text-yellow-400 underline text-sm">
          ← Voltar para lista de atletas
        </Link>
        <div className="mt-4 bg-neutral-900 rounded-2xl p-6 border border-neutral-800 shadow">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={atleta?.foto || "/images/jogadores/jogador_padrao_01.jpg"}
              alt={`Foto de ${atleta?.nome}`}
              width={72}
              height={72}
              className="rounded-full border border-neutral-700"
            />
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">{atleta?.nome}</h1>
              <p className="text-sm text-gray-400">{atleta?.slug}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-200">
            <div>
              <p className="text-gray-400">Jogos</p>
              <p className="text-lg font-bold">{atleta?.jogos}</p>
            </div>
            <div>
              <p className="text-gray-400">Gols</p>
              <p className="text-lg font-bold">{atleta?.gols}</p>
            </div>
            <div>
              <p className="text-gray-400">Assistências</p>
              <p className="text-lg font-bold">{atleta?.assistencias}</p>
            </div>
            <div>
              <p className="text-gray-400">Vitórias</p>
              <p className="text-lg font-bold">{atleta?.vitorias}</p>
            </div>
            <div>
              <p className="text-gray-400">Derrotas</p>
              <p className="text-lg font-bold">{atleta?.derrotas}</p>
            </div>
            <div>
              <p className="text-gray-400">Pontos</p>
              <p className="text-lg font-bold text-yellow-300">{atleta?.pontos}</p>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-300">
            Estatísticas detalhadas e histórico de conquistas serão exibidos conforme os dados forem
            publicados pelo racha.
          </div>
        </div>
      </main>
    </>
  );
}
