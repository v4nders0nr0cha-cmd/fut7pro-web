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
  const campeoes = atletasMock.filter((jogador) => torneio.jogadores.includes(jogador.slug));

  return (
    <main className="min-h-screen bg-fundo text-white pt-6 pb-20">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 text-center">
          {torneio.nome}
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm md:text-base">
          Edição especial realizada em {torneio.ano} com os jogadores mais lendários do racha!
        </p>

        {/* Banner do torneio */}
        <div className="relative w-full h-64 md:h-96 mb-4">
          <Image
            src={torneio.banner}
            alt={`Banner do torneio ${torneio.nome}`}
            fill
            className="object-cover rounded-xl border border-yellow-600"
            priority
          />
        </div>

        {/* Logo do time campeão */}
        <div className="text-center mb-8">
          <h2 className="text-yellow-400 font-bold text-lg mb-2">TIME CAMPEÃO</h2>
          <Image
            src={torneio.logo}
            alt={`Logo do time campeão ${torneio.campeao}`}
            width={96}
            height={96}
            className="rounded-xl bg-white p-2 mx-auto"
          />
          <div className="text-white font-semibold mt-2">{torneio.campeao}</div>
        </div>

        <h2 className="text-xl font-semibold text-yellow-400 mb-4 text-center uppercase">
          Jogadores Campeões
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
