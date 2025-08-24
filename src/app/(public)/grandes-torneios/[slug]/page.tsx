"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { torneiosMock } from "@/components/lists/mockTorneios";
import { atletasMock } from "@/components/lists/mockAtletas";
import PlayerCard from "@/components/cards/PlayerCard";

export default function DetalheTorneioPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const torneio = torneiosMock.find((t) => t.slug === slug);
  if (!torneio) return notFound();

  // Filtra apenas os atletas campeões deste torneio
  const campeoes = atletasMock.filter((jogador) =>
    torneio.jogadores.includes(jogador.slug),
  );

  return (
    <main className="min-h-screen bg-fundo pb-20 pt-6 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-yellow-400 md:text-4xl">
          {torneio.nome}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400 md:text-base">
          Edição especial realizada em {torneio.ano} com os jogadores mais
          lendários do racha!
        </p>

        {/* Banner do torneio */}
        <div className="relative mb-4 h-64 w-full md:h-96">
          <Image
            src={torneio.banner}
            alt={`Banner do torneio ${torneio.nome}`}
            fill
            className="rounded-xl border border-yellow-600 object-cover"
            priority
          />
        </div>

        {/* Logo do time campeão */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-lg font-bold text-yellow-400">
            TIME CAMPEÃO
          </h2>
          <Image
            src={torneio.logo}
            alt={`Logo do time campeão ${torneio.campeao}`}
            width={96}
            height={96}
            className="mx-auto rounded-xl bg-white p-2"
          />
          <div className="mt-2 font-semibold text-white">{torneio.campeao}</div>
        </div>

        <h2 className="mb-4 text-center text-xl font-semibold uppercase text-yellow-400">
          Jogadores Campeões
        </h2>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {campeoes.map((jogador) => (
            <PlayerCard
              key={jogador.id}
              title={jogador.posicao}
              name={jogador.nome}
              value={`${jogador.estatisticas.historico.gols} gols`}
              image={jogador.foto}
              href={`/atletas/${jogador.slug}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
