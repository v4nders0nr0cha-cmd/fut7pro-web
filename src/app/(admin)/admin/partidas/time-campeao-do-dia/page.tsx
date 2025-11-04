"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import TabelaConfrontos from "@/components/admin/TabelaConfrontos";
import BannerUpload from "@/components/admin/BannerUpload";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import ModalRegrasDestaques from "@/components/admin/ModalRegrasDestaques";
import { useAuth } from "@/hooks/useAuth";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { rachaConfig } from "@/config/racha.config";
import {
  buildTimesDoDiaFromMatches,
  buildConfrontosFromMatches,
  determineChampionTeam,
} from "@/utils/match-adapters";

function groupByLatestDate(matches: ReturnType<typeof useAdminMatches>["matches"]) {
  if (!Array.isArray(matches) || matches.length === 0) return [];

  const grouped = matches.reduce<Record<string, typeof matches>>((acc, match) => {
    const dateOnly = match.date.slice(0, 10);
    if (!acc[dateOnly]) acc[dateOnly] = [];
    acc[dateOnly].push(match);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));
  const latest = sortedDates[0];
  return latest ? grouped[latest] ?? [] : [];
}

export default function TimeCampeaoDoDiaPage() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug && user.tenantSlug.length > 0 ? user.tenantSlug : null;
  const effectiveSlug = tenantSlug ?? rachaConfig.slug;

  const { matches, isLoading, isError, error } = useAdminMatches({
    slug: effectiveSlug,
    params: { limit: 40 },
  });

  const matchesDoDia = useMemo(() => groupByLatestDate(matches), [matches]);
  const timesDoDia = useMemo(
    () => buildTimesDoDiaFromMatches(matchesDoDia),
    [matchesDoDia],
  );
  const confrontos = useMemo(
    () => buildConfrontosFromMatches(matchesDoDia),
    [matchesDoDia],
  );
  const championTeamId = useMemo(
    () => determineChampionTeam(matchesDoDia),
    [matchesDoDia],
  );
  const championTeam = useMemo(
    () => (championTeamId ? timesDoDia.find((time) => time.id === championTeamId) ?? null : null),
    [timesDoDia, championTeamId],
  );

  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showModalRegras, setShowModalRegras] = useState(false);

  return (
    <>
      <Head>
        <title>Time Campeao do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Confira os confrontos, destaques individuais e o time campeao do dia com base nos dados reais do backend Fut7Pro."
        />
        <meta
          name="keywords"
          content="racha, fut7, time campeao do dia, destaques, painel admin, futebol entre amigos"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 min-h-screen bg-zinc-900 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3 text-center drop-shadow">
          Painel de Destaques do Dia
        </h1>
        <p className="text-gray-300 mb-8 text-center text-lg">
          Os dados abaixo refletem as partidas registradas no backend para o dia mais recente.
          Utilize-os para divulgar o campeao do racha e destacar as performances individuais.
        </p>

        {isLoading && (
          <div className="w-full max-w-4xl bg-zinc-800 rounded-2xl shadow p-6 text-center">
            <span className="text-yellow-400 font-semibold">Carregando partidas do dia...</span>
          </div>
        )}

        {isError && (
          <div className="w-full max-w-4xl bg-red-900/30 border border-red-700 rounded-2xl shadow p-6 text-center">
            <p className="text-red-300 font-semibold">
              Nao foi possivel carregar as partidas: {error ?? "erro desconhecido"}.
            </p>
            <p className="text-red-200 text-sm mt-2">
              Verifique se ha confrontos registrados para o tenant selecionado e tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <TabelaConfrontos confrontos={confrontos} />

            <div className="w-full flex flex-col items-center mt-10 mb-3">
              <h2 className="text-2xl font-extrabold text-yellow-400 mb-1">Destaques do Dia</h2>
              <button
                className="text-sm underline text-yellow-300 hover:text-yellow-500 mb-2 transition"
                onClick={() => setShowModalRegras(true)}
                type="button"
              >
                clique aqui e saiba as regras
              </button>
            </div>

            {showModalRegras && <ModalRegrasDestaques onClose={() => setShowModalRegras(false)} />}

            <div className="w-full flex flex-col items-center gap-12 mt-4 max-w-5xl">
              <CardsDestaquesDiaV2
                matches={matchesDoDia}
                times={timesDoDia}
                championTeamId={championTeamId}
              />

              <BannerUpload bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} timeCampeao={championTeam} />
            </div>
          </>
        )}
      </main>
    </>
  );
}
