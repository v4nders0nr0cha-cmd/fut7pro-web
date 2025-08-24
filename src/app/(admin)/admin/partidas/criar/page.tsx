"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { FaRandom, FaClipboardList } from "react-icons/fa";

export default function CriarPartidasPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Criar Partidas | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Escolha o modo de cadastro das partidas do seu racha: Sorteio Inteligente ou Partida Clássica. 100% flexível, prático e rápido no Fut7Pro."
        />
        <meta
          name="keywords"
          content="criar partidas, sorteio inteligente, partida clássica, fut7, racha, painel admin"
        />
      </Head>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-3xl font-bold text-yellow-400 md:text-4xl">
          Criar Partidas
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Card Sorteio Inteligente */}
          <button
            className="group flex flex-col items-center rounded-2xl border-2 border-yellow-500 bg-neutral-900 p-8 shadow-lg transition hover:bg-yellow-400 hover:text-black"
            onClick={() =>
              router.push("/admin/partidas/criar/sorteio-inteligente")
            }
            type="button"
          >
            <FaRandom
              className="mb-4 text-4xl text-yellow-400 group-hover:text-black"
              aria-label="Sorteio Inteligente"
            />
            <h2 className="mb-2 text-xl font-bold">
              Sorteio Inteligente{" "}
              <span className="ml-1 rounded bg-cyan-700 px-2 py-1 text-xs text-cyan-100">
                Recomendado
              </span>
            </h2>
            <p className="text-center text-sm text-neutral-300 group-hover:text-black">
              Crie rodadas modernas com times balanceados automaticamente,
              organização de horários e tabela pronta.
              <br />
              Ideal para quem valoriza competitividade e praticidade.
            </p>
          </button>

          {/* Card Partida Clássica */}
          <button
            className="group flex flex-col items-center rounded-2xl border-2 border-yellow-500 bg-neutral-900 p-8 shadow-lg transition hover:bg-yellow-400 hover:text-black"
            onClick={() => router.push("/admin/partidas/criar/classica")}
            type="button"
          >
            <FaClipboardList
              className="mb-4 text-4xl text-yellow-400 group-hover:text-black"
              aria-label="Partidas Clássicas"
            />
            <h2 className="mb-2 text-xl font-bold">Partida Clássica</h2>
            <p className="text-center text-sm text-neutral-300 group-hover:text-black">
              Cadastre partidas avulsas ou retroativas, incluindo data, times,
              gols, assistências e resultados manualmente.
              <br />
              Ideal para históricos antigos ou para rachas com formato
              tradicional.
            </p>
          </button>
        </div>
      </main>
    </>
  );
}
