// src/app/admin/partidas/time-campeao-do-dia/page.tsx
"use client";

import Head from "next/head";
import { useState } from "react";
import TabelaConfrontos from "@/components/admin/TabelaConfrontos";
import ModalEditarPartida from "@/components/admin/ModalEditarPartida";
import BannerUpload from "@/components/admin/BannerUpload";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import ModalRegrasDestaques from "@/components/admin/ModalRegrasDestaques";
import { mockTimes, mockConfrontos } from "@/mocks/admin/mockDia";
import type { Confronto } from "@/mocks/admin/mockDia";

type EditPartidaState = { index: number; tipo: "ida" | "volta" } | null;

export default function TimeCampeaoDoDiaPage() {
  const [confrontos, setConfrontos] = useState<Confronto[]>(
    mockConfrontos.map((c) => ({ ...c })),
  );
  const [partidaSelecionada, setPartidaSelecionada] =
    useState<EditPartidaState>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showModalRegras, setShowModalRegras] = useState(false);

  function handleSalvarResultado(
    index: number,
    tipo: "ida" | "volta",
    placar: { a: number; b: number },
    eventos: any[],
  ) {
    setConfrontos((prev) =>
      prev.map((c, idx) => {
        if (idx !== index) return c;
        if (tipo === "ida") return { ...c, resultadoIda: { placar, eventos } };
        return { ...c, resultadoVolta: { placar, eventos } };
      }),
    );
    setPartidaSelecionada(null);
  }

  return (
    <>
      <Head>
        <title>Time Campeão do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Lance os resultados do dia e selecione os destaques e o time campeão. Controle completo e rápido via painel administrativo Fut7Pro."
        />
        <meta
          name="keywords"
          content="racha, fut7, time campeão do dia, destaques, painel admin, futebol entre amigos"
        />
      </Head>

      <main className="flex min-h-screen flex-col items-center bg-zinc-900 px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-3 text-center text-3xl font-bold text-yellow-400 drop-shadow md:text-4xl">
          Lançamento de Resultados do Dia
        </h1>
        <p className="mb-8 text-center text-lg text-gray-300">
          Clique em uma partida na tabela abaixo para lançar resultados, gols e
          assistências.
          <br />
          Tudo prático, rápido e sem enrolação.
        </p>

        <TabelaConfrontos
          confrontos={confrontos}
          onSelecionarPartida={(index, tipo) =>
            setPartidaSelecionada({ index, tipo })
          }
        />

        {partidaSelecionada && (
          <ModalEditarPartida
            index={partidaSelecionada.index}
            confronto={confrontos[partidaSelecionada.index]}
            tipo={partidaSelecionada.tipo}
            times={mockTimes}
            onClose={() => setPartidaSelecionada(null)}
            onSalvar={handleSalvarResultado}
          />
        )}

        <div className="mb-3 mt-10 flex w-full flex-col items-center">
          <h2 className="mb-1 text-2xl font-extrabold text-yellow-400">
            Destaques do Dia
          </h2>
          <button
            className="mb-2 text-sm text-yellow-300 underline transition hover:text-yellow-500"
            onClick={() => setShowModalRegras(true)}
            tabIndex={0}
          >
            clique aqui e saiba as regras
          </button>
        </div>

        {showModalRegras && (
          <ModalRegrasDestaques onClose={() => setShowModalRegras(false)} />
        )}

        <div className="mt-4 flex w-full max-w-5xl flex-col items-center gap-12">
          <CardsDestaquesDiaV2 confrontos={confrontos} times={mockTimes} />

          <BannerUpload
            bannerUrl={bannerUrl}
            setBannerUrl={setBannerUrl}
            timeCampeao={null}
          />
        </div>
      </main>
    </>
  );
}
