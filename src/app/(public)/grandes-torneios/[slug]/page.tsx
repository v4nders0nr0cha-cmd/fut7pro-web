"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Head from "next/head";
import PlayerCard from "@/components/cards/PlayerCard";
import { usePublicTorneio } from "@/hooks/usePublicTorneios";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR");
}

export default function DetalheTorneioPage() {
  const params = useParams();
  const torneioSlug = params?.slug as string;
  const tenantSlug = usePublicTenantSlug();
  const { torneio, isError, error, isLoading } = usePublicTorneio(torneioSlug, tenantSlug);

  if (!torneio && !isLoading) return notFound();

  return (
    <main className="min-h-screen bg-fundo text-white pt-6 pb-20">
      <Head>
        <title>{torneio ? `${torneio.nome} | Fut7Pro` : "Torneio | Fut7Pro"}</title>
        <meta
          name="description"
          content={torneio?.descricaoResumida ?? "Detalhes do torneio especial do racha."}
        />
      </Head>
      <div className="max-w-5xl mx-auto w-full">
        {isError && (
          <div className="text-center text-red-300 bg-red-900/30 border border-red-700/30 px-4 py-3 rounded-lg mb-4">
            {error ?? "Não foi possível carregar o torneio."}
          </div>
        )}

        {isLoading && !torneio && (
          <div className="text-center text-gray-400 py-8">Carregando torneio...</div>
        )}

        {torneio && (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 text-center">
              {torneio.nome}
            </h1>
            <p className="text-center text-gray-400 mb-6 text-sm md:text-base">
              {torneio.ano} • {torneio.descricaoResumida ?? "Edição especial com os melhores."}
            </p>

            <div className="relative w-full h-64 md:h-96 mb-4">
              <Image
                src={torneio.bannerUrl || "/images/torneios/placeholder.jpg"}
                alt={`Banner do torneio ${torneio.nome}`}
                fill
                className="object-cover rounded-xl border border-yellow-600"
                priority
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-yellow-400 font-bold text-lg mb-2">TIME CAMPEÃO</h2>
              <Image
                src={torneio.logoUrl || "/images/times/time_padrao_01.png"}
                alt={`Logo do time campeão ${torneio.campeao ?? "Campeão"}`}
                width={96}
                height={96}
                className="rounded-xl bg-white p-2 mx-auto"
              />
              <div className="text-white font-semibold mt-2">{torneio.campeao ?? "---"}</div>
              <div className="text-xs text-gray-400 mt-1">
                {formatDate(torneio.dataInicio)}{" "}
                {torneio.dataFim ? `→ ${formatDate(torneio.dataFim)}` : ""}
              </div>
            </div>

            <h2 className="text-xl font-semibold text-yellow-400 mb-4 text-center uppercase">
              Jogadores Campeões
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {torneio.jogadoresCampeoes?.map((jogador) => (
                <PlayerCard
                  key={`${jogador.athleteSlug}-${jogador.nome}`}
                  title={jogador.posicao as string}
                  name={jogador.nome}
                  value={jogador.athleteSlug}
                  image={jogador.fotoUrl}
                  href={`/atletas/${jogador.athleteSlug}`}
                />
              ))}
              {(!torneio.jogadoresCampeoes || torneio.jogadoresCampeoes.length === 0) && (
                <div className="col-span-full text-center text-gray-400">
                  Nenhum atleta cadastrado como campeão deste torneio ainda.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
