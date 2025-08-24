// src/app/grandes-torneios/torneio-matador/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function TorneioMatadorPage() {
  return (
    <main className="min-h-screen bg-fundo pb-20 pt-6 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="sr-only">Detalhes do Torneio Matador | Fut7Pro</h1>

        <h2 className="mb-4 text-center text-3xl font-bold text-yellow-400">
          🏆 Torneio Matador
        </h2>

        {/* Banner principal - será editável futuramente pelo Admin */}
        <div className="relative mb-6 h-[220px] w-full overflow-hidden rounded-xl sm:h-[320px] md:h-[400px]">
          <Image
            src="/images/torneios/torneio-matador.jpg"
            alt="Banner oficial do Torneio Matador 2025 - Fut7Pro"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Informações do torneio */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-lg text-gray-300">
            Edição especial realizada em 2025 com os melhores jogadores do
            racha.
          </p>
          <p className="text-sm italic text-gray-400">
            Período: Janeiro a Março de 2025
          </p>
        </div>

        {/* Time campeão */}
        <div className="mb-10 rounded-xl border border-yellow-600 bg-zinc-900 p-4">
          <h3 className="mb-3 text-center text-xl font-semibold text-yellow-400">
            🥇 Time Campeão: Lendários FC
          </h3>
          <div className="mb-4 flex justify-center">
            <Image
              src="/images/times/time_padrao_01.png"
              alt="Logo do Time Campeão Lendários FC"
              width={100}
              height={100}
              className="rounded-xl bg-white p-2"
            />
          </div>

          <h4 className="mb-2 text-center text-sm text-gray-300">
            Campeões do torneio:
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <Link key={id} href={`/atletas/jogador-${id}`}>
                <div className="text-center text-white transition hover:text-yellow-400">
                  <Image
                    src={`/images/jogadores/jogador_padrao_0${id}.jpg`}
                    alt={`Foto do Jogador ${id} - Campeão Torneio Matador`}
                    width={80}
                    height={80}
                    className="mx-auto mb-1 rounded-full object-cover"
                  />
                  <p className="text-sm font-semibold">Jogador {id}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Botão para voltar */}
        <div className="text-center">
          <Link
            href="/grandes-torneios"
            className="text-sm text-yellow-400 hover:underline"
          >
            ← Voltar para a lista de torneios
          </Link>
        </div>
      </div>
    </main>
  );
}
