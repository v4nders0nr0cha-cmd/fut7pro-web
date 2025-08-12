// src/app/grandes-torneios/torneio-matador/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function TorneioMatadorPage() {
  return (
    <main className="min-h-screen bg-fundo text-white pt-6 pb-20">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="sr-only">Detalhes do Torneio Matador | Fut7Pro</h1>

        <h2 className="text-3xl font-bold text-yellow-400 text-center mb-4">🏆 Torneio Matador</h2>

        {/* Banner principal - será editável futuramente pelo Admin */}
        <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] rounded-xl overflow-hidden mb-6">
          <Image
            src="/images/torneios/torneio-matador.jpg"
            alt="Banner oficial do Torneio Matador 2025 - Fut7Pro"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Informações do torneio */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-300 mb-2">
            Edição especial realizada em 2025 com os melhores jogadores do racha.
          </p>
          <p className="text-sm text-gray-400 italic">Período: Janeiro a Março de 2025</p>
        </div>

        {/* Time campeão */}
        <div className="bg-zinc-900 border border-yellow-600 rounded-xl p-4 mb-10">
          <h3 className="text-xl font-semibold text-yellow-400 mb-3 text-center">
            🥇 Time Campeão: Lendários FC
          </h3>
          <div className="flex justify-center mb-4">
            <Image
              src="/images/times/time_padrao_01.png"
              alt="Logo do Time Campeão Lendários FC"
              width={100}
              height={100}
              className="rounded-xl bg-white p-2"
            />
          </div>

          <h4 className="text-center text-sm text-gray-300 mb-2">Campeões do torneio:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <Link key={id} href={`/atletas/jogador-${id}`}>
                <div className="text-center text-white hover:text-yellow-400 transition">
                  <Image
                    src={`/images/jogadores/jogador_padrao_0${id}.jpg`}
                    alt={`Foto do Jogador ${id} - Campeão Torneio Matador`}
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-1 object-cover"
                  />
                  <p className="text-sm font-semibold">Jogador {id}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Botão para voltar */}
        <div className="text-center">
          <Link href="/grandes-torneios" className="text-yellow-400 hover:underline text-sm">
            ← Voltar para a lista de torneios
          </Link>
        </div>
      </div>
    </main>
  );
}
