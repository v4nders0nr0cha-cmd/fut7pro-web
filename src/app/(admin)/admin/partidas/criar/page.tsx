"use client";

import Head from "next/head";
import Link from "next/link";
import { contextualGuideHref } from "@/lib/admin-guide-navigation";
import { useSearchParams } from "next/navigation";
import { FaRandom, FaClipboardList } from "react-icons/fa";
import FirstMatchdayDrawHint from "@/components/admin-guide/FirstMatchdayDrawHint";

const actionFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300";

export default function CriarPartidasPage() {
  const params = useSearchParams();
  const fromGuide = params?.get("guia") === "FIRST_MATCHDAY";
  const destination = (path: string) =>
    fromGuide
      ? contextualGuideHref(
          path,
          "FIRST_MATCHDAY",
          params.get("guiaOrigem") === "dashboard" ? "dashboard" : "pagina",
          params.get("guiaRetorno") ?? undefined
        )
      : path;

  return (
    <>
      <Head>
        <title>Criar Partidas | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Escolha como organizar as partidas do grupo: Sorteio Inteligente para ajudar a equilibrar os times ou Partida Clássica para cadastrar manualmente."
        />
      </Head>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-6 text-3xl font-bold text-yellow-400 md:text-4xl">Criar Partidas</h1>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section
            aria-labelledby="draw-mode-title"
            className="flex min-w-0 flex-col rounded-2xl border-2 border-yellow-400/70 bg-neutral-900 p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <FaRandom className="text-3xl text-yellow-400" aria-hidden="true" />
              <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-200">
                Recomendado
              </span>
            </div>
            <h2 id="draw-mode-title" className="text-xl font-bold text-white">
              Sorteio Inteligente
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              Monte times mais equilibrados automaticamente utilizando as avaliações dos atletas.
            </p>
            {fromGuide && <FirstMatchdayDrawHint />}
            <Link
              href={destination("/admin/partidas/sorteio-inteligente")}
              className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-4 py-3 text-center text-sm font-semibold text-black hover:bg-yellow-300 ${actionFocus}`}
            >
              Experimentar Sorteio Inteligente
            </Link>
          </section>

          <section
            aria-labelledby="classic-mode-title"
            className="flex min-w-0 flex-col rounded-2xl border border-white/20 bg-neutral-900 p-5 sm:p-6"
          >
            <FaClipboardList className="mb-4 text-3xl text-neutral-200" aria-hidden="true" />
            <h2 id="classic-mode-title" className="text-xl font-bold text-white">
              Partida Clássica
            </h2>
            <p className="mb-6 mt-2 text-sm leading-relaxed text-neutral-300">
              Prefere organizar manualmente? Cadastre os times e prepare sua rodada da maneira
              tradicional.
            </p>
            <Link
              href={destination("/admin/partidas/criar/classica")}
              className={`mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 ${actionFocus}`}
            >
              Criar Partida Clássica
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
