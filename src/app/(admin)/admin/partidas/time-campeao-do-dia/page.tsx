"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { usePartidas } from "@/hooks/usePartidas";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import ModalRegrasDestaques from "@/components/admin/ModalRegrasDestaques";
import BannerUpload from "@/components/admin/BannerUpload";
import { buildDestaquesDoDia } from "@/utils/destaquesDoDia";

export default function TimeCampeaoDoDiaPage() {
  const { partidas, isLoading, isError, error } = usePartidas();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showModalRegras, setShowModalRegras] = useState(false);

  const { confrontos, times, dataReferencia } = useMemo(
    () => buildDestaquesDoDia(partidas as any),
    [partidas]
  );

  const hasDados = confrontos.length > 0 && times.length > 0;
  const dataLabel = dataReferencia ? new Date(dataReferencia).toLocaleDateString("pt-BR") : null;

  return (
    <>
      <Head>
        <title>Time Campeao do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja o Time Campeao do Dia e os destaques gerados automaticamente a partir das partidas reais do racha."
        />
        <meta
          name="keywords"
          content="racha, fut7, time campeao do dia, destaques, painel admin, futebol entre amigos"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 min-h-screen bg-zinc-900 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3 text-center drop-shadow">
          Time Campeao do Dia
        </h1>
        <p className="text-gray-300 mb-6 text-center text-lg max-w-2xl">
          Os dados abaixo sao calculados a partir das partidas finalizadas do dia{" "}
          {dataLabel ?? "mais recente"}. O <b>Time Campeao</b> e definido por vitorias e pontos, e
          os destaques individuais consideram gols e assistencias registrados nas presencas.
        </p>

        {isLoading && (
          <div className="text-gray-300 py-10 text-center">
            Carregando partidas para calcular o Time Campeao do Dia...
          </div>
        )}

        {isError && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg max-w-xl text-center">
            <p className="font-semibold mb-1">Erro ao carregar partidas do dia.</p>
            {error && <p className="text-sm">{String(error)}</p>}
          </div>
        )}

        {!isLoading && !isError && !hasDados && (
          <div className="text-gray-300 py-10 text-center">
            Nenhuma partida finalizada encontrada para o dia selecionado. Registre partidas no
            painel para habilitar o calculo do Time Campeao do Dia.
          </div>
        )}

        {!isLoading && !isError && hasDados && (
          <>
            <div className="w-full flex flex-col items-center mt-6 mb-3">
              <h2 className="text-2xl font-extrabold text-yellow-400 mb-1">Destaques do Dia</h2>
              <button
                className="text-sm underline text-yellow-300 hover:text-yellow-500 mb-2 transition"
                onClick={() => setShowModalRegras(true)}
                tabIndex={0}
              >
                clique aqui e saiba as regras
              </button>
            </div>

            {showModalRegras && <ModalRegrasDestaques onClose={() => setShowModalRegras(false)} />}

            <div className="w-full flex flex-col items-center gap-12 mt-4 max-w-5xl">
              <CardsDestaquesDiaV2 confrontos={confrontos} times={times} />

              <BannerUpload bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} timeCampeao={null} />
            </div>
          </>
        )}
      </main>
    </>
  );
}
