"use client";

import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { usePublicAthletePremiumProfile } from "@/hooks/useAthletePremiumProfile";
import AthletePremiumProfileView from "@/components/athlete-premium/AthletePremiumProfileView";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { mapPremiumPayloadToView } from "@/utils/athlete-premium-contract";

export default function PerfilAtletaSlugPage() {
  const { slug, athleteSlug } = useParams() as { slug: string; athleteSlug: string };
  const { setTenantSlug } = useRacha();
  const { publicHref } = usePublicLinks();
  const [statsPeriod, setStatsPeriod] = useState<"current" | "all">("current");

  useEffect(() => {
    if (slug) setTenantSlug(slug);
  }, [slug, setTenantSlug]);

  const {
    premiumProfile,
    isLoading: isLoadingPremium,
    isError: isErrorPremium,
    error: premiumError,
  } = usePublicAthletePremiumProfile({
    tenantSlug: slug,
    athleteSlug,
    statsPeriod,
  });

  if (isLoadingPremium && !premiumProfile) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 text-gray-300">
        Carregando perfil premium...
      </div>
    );
  }

  if (isErrorPremium || !premiumProfile) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <Link href={publicHref("/atletas")} className="text-sm text-brand underline">
          Voltar para lista de atletas
        </Link>
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/25 p-5 text-red-100">
          <h1 className="text-xl font-bold">Perfil premium indisponível</h1>
          <p className="mt-2 text-sm text-red-100/80">
            Não foi possível carregar o contrato oficial do Perfil Premium deste atleta. Tente
            novamente em instantes.
          </p>
          {premiumError && <p className="mt-3 text-xs text-red-200/70">{premiumError}</p>}
        </div>
      </main>
    );
  }

  const backToListHref = publicHref("/atletas");
  const premiumView = mapPremiumPayloadToView(premiumProfile, premiumProfile.stats.titles);
  const displayName = premiumView.athlete.name || "Atleta";

  return (
    <>
      <Head>
        <title>{displayName} | Fut7Pro</title>
        <meta
          name="description"
          content={`Perfil público do atleta ${displayName} com estatísticas do racha.`}
        />
      </Head>
      <main>
        <div className="mx-auto mb-3 mt-2 max-w-[1540px] px-4">
          <Link href={backToListHref} className="text-sm text-brand underline">
            Voltar para lista de atletas
          </Link>
        </div>
        <AthletePremiumProfileView
          mode="public"
          athlete={premiumView.athlete}
          tenant={premiumView.tenant}
          stats={premiumView.stats}
          index={premiumView.index}
          achievements={premiumView.achievements}
          achievementGroups={premiumView.achievementGroups}
          badges={premiumView.badges}
          legendaryProgress={premiumView.legendaryProgress}
          statsPeriod={statsPeriod}
          onStatsPeriodChange={setStatsPeriod}
          links={{
            statsUrl: publicHref("/estatisticas/ranking-geral"),
            achievementsUrl: publicHref(`/atletas/${athleteSlug}/conquistas`),
            historyUrl: publicHref(`/atletas/${athleteSlug}/historico`),
          }}
        />
      </main>
    </>
  );
}
