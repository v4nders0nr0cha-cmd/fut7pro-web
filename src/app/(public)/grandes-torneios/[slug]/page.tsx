"use client";

import Head from "next/head";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";

import PlayerCard from "@/components/cards/PlayerCard";
import { torneiosMock } from "@/components/lists/mockTorneios";
import { useAtletas } from "@/hooks/useAtletas";
import { useRacha } from "@/context/RachaContext";
import { useTenant } from "@/hooks/useTenant";
import type { Atleta } from "@/types/atleta";

const FOTO_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

export default function DetalheTorneioPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const torneio = torneiosMock.find((item) => item.slug === slug);

  const { tenant } = useTenant();
  const { rachaId } = useRacha();

  const tenantSlug = tenant?.slug ?? null;
  const effectiveRachaId = tenant?.id ?? rachaId ?? null;

  const { atletas, isLoading, isError } = useAtletas(effectiveRachaId, tenantSlug);

  if (!torneio) {
    notFound();
    return null;
  }

  const atletasPorSlug = new Map(atletas.map((atleta) => [atleta.slug, atleta]));
  const campeoes = torneio.jogadores
    .map((slugJogador) => atletasPorSlug.get(slugJogador))
    .filter((value): value is Atleta => Boolean(value));

  return (
    <main className="min-h-screen bg-fundo text-white pt-6 pb-20">
      <Head>
        <title>{torneio.nome} | Grandes Torneios Fut7Pro</title>
        <meta
          name="description"
          content={`Veja os destaques do torneio ${torneio.nome} e a lista de atletas participantes.`}
        />
      </Head>
      <div className="max-w-5xl mx-auto w-full px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 text-center">
          {torneio.nome}
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm md:text-base">
          Edicao realizada em {torneio.ano}. Dados historicos completos serao conectados em breve.
        </p>

        <div className="relative w-full h-64 md:h-96 mb-4">
          <Image
            src={torneio.banner}
            alt={`Banner do torneio ${torneio.nome}`}
            fill
            className="object-cover rounded-xl border border-yellow-600"
            priority
          />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-yellow-400 font-bold text-lg mb-2">Time campeao</h2>
          <Image
            src={torneio.logo}
            alt={`Logo do time campeao ${torneio.campeao}`}
            width={96}
            height={96}
            className="rounded-xl bg-white p-2 mx-auto"
          />
          <div className="text-white font-semibold mt-2">{torneio.campeao}</div>
        </div>

        <h2 className="text-xl font-semibold text-yellow-400 mb-4 text-center uppercase">
          Jogadores destacados no torneio
        </h2>

        {isLoading ? (
          <div className="text-center text-gray-300 py-10">Carregando atletas...</div>
        ) : isError ? (
          <div className="text-center text-red-300 py-10">
            Nao foi possivel carregar os atletas deste torneio no momento.
          </div>
        ) : campeoes.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Participantes reais ainda nao publicados. Este conteudo sera atualizado junto com o
            historico oficial.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {campeoes.map((jogador) => (
              <PlayerCard
                key={jogador.id}
                title={jogador.posicao ?? "Atleta"}
                name={jogador.nome}
                value={`${jogador.stats.gols} gols / ${jogador.stats.assistencias} ast`}
                image={jogador.foto || FOTO_FALLBACK}
                href={`/atletas/${jogador.slug}`}
                showTrophy
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
