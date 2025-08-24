"use client";

import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

export default function GrandesTorneiosPage() {
  return (
    <>
      <Head>
        <title>Grandes Torneios | Fut7Pro</title>
        <meta
          name="description"
          content="Veja os torneios mais importantes do Fut7Pro e os campeões de cada edição."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, grandes torneios, campeões, eventos especiais, racha"
        />
      </Head>

      <main className="min-h-screen bg-fundo pb-20 pt-8 text-white">
        <div className="mx-auto w-full max-w-5xl">
          {/* TÍTULO PRINCIPAL PADRÃO */}
          <h1 className="mb-3 mt-10 text-center text-3xl font-extrabold leading-tight text-yellow-400 drop-shadow-sm md:text-4xl">
            Grandes Torneios
          </h1>

          {/* DESCRIÇÃO PADRÃO — MAIS HORIZONTAL */}
          <p className="mx-auto mb-8 max-w-2xl text-center text-base font-medium leading-relaxed text-gray-300 md:max-w-3xl md:text-lg lg:max-w-4xl xl:max-w-5xl">
            Aqui você confere todos os nossos <strong>Grandes Torneios</strong>.
            Conquistas marcantes de{" "}
            <strong>campeonatos de confraternização</strong>,{" "}
            <strong>eventos únicos</strong> e memoráveis. Torneios raros que
            acontecem poucas vezes no ano, mas ninguém esquece!
          </p>

          {/* Card ilustrativo de torneio */}
          <div className="overflow-hidden rounded-xl border border-yellow-600 bg-zinc-900 shadow-lg">
            <div className="relative h-48 w-full sm:h-64 md:h-72 lg:h-80">
              <Image
                src="/images/torneios/torneio-matador.jpg"
                alt="Banner do Torneio Matador - Grande torneio Fut7Pro"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
                priority
              />
              <div className="absolute inset-0 flex items-end bg-black/60">
                <div className="p-4">
                  <h3 className="mb-1 text-xl font-bold text-yellow-400 sm:text-2xl">
                    🏆 Torneio Matador
                  </h3>
                  <p className="mb-2 text-sm text-gray-300">
                    Edição especial realizada em 2025 com os melhores jogadores
                    do racha.
                  </p>
                  <Link
                    href="/grandes-torneios/torneio-matador-2025"
                    className="mt-1 inline-block text-sm font-semibold text-yellow-400 hover:underline"
                  >
                    Ver Detalhes →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm italic text-gray-500">
            Em breve, novos torneios estarão disponíveis nesta página.
          </p>
        </div>
      </main>
    </>
  );
}
