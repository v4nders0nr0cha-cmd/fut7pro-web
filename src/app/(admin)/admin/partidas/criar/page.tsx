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
          content="Escolha o modo de cadastro das partidas do seu racha: Sorteio Inteligente ou Partida Classica. Sessao ao vivo com rodadas dinamicas e resultados em tempo real."
        />
        <meta
          name="keywords"
          content="criar partidas, sorteio inteligente, partida classica, fut7, racha, painel admin"
        />
      </Head>
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8">Criar Partidas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Sorteio Inteligente */}
          <button
            className="bg-neutral-900 border-2 border-yellow-500 rounded-2xl shadow-lg p-8 flex flex-col items-center hover:bg-yellow-400 hover:text-black transition group"
            onClick={() => router.push("/admin/partidas/criar/sorteio-inteligente")}
            type="button"
          >
            <FaRandom
              className="text-4xl mb-4 text-yellow-400 group-hover:text-black"
              aria-label="Sorteio Inteligente"
            />
            <h2 className="text-xl font-bold mb-2">
              Sorteio Inteligente{" "}
              <span className="ml-1 text-xs bg-cyan-700 text-cyan-100 px-2 py-1 rounded">
                Recomendado
              </span>
            </h2>
            <p className="text-sm text-neutral-300 group-hover:text-black text-center">
              Crie rodadas modernas com times balanceados automaticamente, organização de horários e
              tabela pronta.
              <br />
              Ideal para quem valoriza competitividade e praticidade.
            </p>
          </button>

          {/* Card Partida Classica */}
          <button
            className="bg-neutral-900 border-2 border-yellow-500 rounded-2xl shadow-lg p-8 flex flex-col items-center hover:bg-yellow-400 hover:text-black transition group"
            onClick={() => router.push("/admin/partidas/criar/classica")}
            type="button"
          >
            <FaClipboardList
              className="text-4xl mb-4 text-yellow-400 group-hover:text-black"
              aria-label="Partidas Classicas"
            />
            <h2 className="text-xl font-bold mb-2">Partida Classica</h2>
            <p className="text-sm text-neutral-300 group-hover:text-black text-center">
              Cadastre partidas manualmente em sessao ao vivo, definindo times, elenco e resultados.
              <br />
              Ideal para rachas com formato tradicional e rodadas dinamicas.
            </p>
          </button>
        </div>
      </main>
    </>
  );
}
