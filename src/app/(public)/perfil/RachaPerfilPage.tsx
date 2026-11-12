"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import HistoricoJogos from "@/components/atletas/HistoricoJogos";
import AthletePremiumProfileView from "@/components/athlete-premium/AthletePremiumProfileView";
import LegendaryUnlockedModal from "@/components/athlete-premium/LegendaryUnlockedModal";
import { usePerfil } from "@/components/atletas/PerfilContext";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import {
  markLegendaryCelebrationSeen,
  useOwnerAthletePremiumProfile,
} from "@/hooks/useAthletePremiumProfile";
import { mapPremiumPayloadToView } from "@/utils/athlete-premium-contract";

const MIN_PERIOD_SWITCH_LOADING_MS = 650;

// --- Página ---
export default function PerfilUsuarioPage() {
  const {
    usuario,
    roleLabel,
    membershipStatus,
    isLoading,
    isError,
    errorStatus,
    error,
    isAuthenticated,
    isPendingApproval,
    hasConfirmedNoGroupMembership,
    isMembershipLookupError,
    retryMembershipLookup,
  } = usePerfil();
  const router = useRouter();
  const { publicHref, publicSlug } = usePublicLinks();
  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", publicHref("/perfil"));
    return `${publicHref("/entrar")}?${params.toString()}`;
  }, [publicHref]);
  const requestJoinHref = useMemo(() => {
    const params = new URLSearchParams();
    if (publicSlug) {
      params.set("intent", "request-join");
      params.set("racha", publicSlug);
      params.set("callbackUrl", `/${publicSlug}`);
    }
    return params.toString() ? `/perfil?${params.toString()}` : "/perfil";
  }, [publicSlug]);
  const globalProfileHref = "/perfil";
  const normalizedMembershipStatus = String(membershipStatus || "").toUpperCase();
  const isRejectedMembership =
    normalizedMembershipStatus === "REJEITADO" || normalizedMembershipStatus === "REJECTED";
  const isSuspendedMembership =
    normalizedMembershipStatus === "SUSPENSO" || normalizedMembershipStatus === "SUSPENDED";
  const isApprovedMembership =
    normalizedMembershipStatus === "APROVADO" ||
    normalizedMembershipStatus === "APPROVED" ||
    normalizedMembershipStatus === "ACTIVE";
  const [statsPeriod, setStatsPeriod] = useState<"current" | "all">("current");
  const [pendingStatsPeriod, setPendingStatsPeriod] = useState<"current" | "all" | null>(null);
  const [periodSwitchStartedAt, setPeriodSwitchStartedAt] = useState<number | null>(null);
  const [showLegendaryModal, setShowLegendaryModal] = useState(false);
  const [isMarkingLegendarySeen, setIsMarkingLegendarySeen] = useState(false);
  const {
    premiumProfile,
    isError: isErrorPremium,
    isLoading: isLoadingPremium,
    isValidating: isValidatingPremium,
    error: premiumError,
    mutate: mutatePremiumProfile,
  } = useOwnerAthletePremiumProfile({
    tenantSlug: publicSlug,
    enabled: Boolean(publicSlug && isAuthenticated && usuario && isApprovedMembership),
    statsPeriod,
  });

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    if (isPendingApproval) {
      router.replace(publicHref("/aguardando-aprovacao"));
    }
  }, [isAuthenticated, isLoading, isPendingApproval, router, publicHref]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(loginHref);
    }
  }, [isAuthenticated, isLoading, router, loginHref]);

  useEffect(() => {
    if (premiumProfile?.legendaryCelebration?.shouldShow) {
      setShowLegendaryModal(true);
    }
  }, [premiumProfile?.legendaryCelebration?.shouldShow]);

  useEffect(() => {
    if (!pendingStatsPeriod) return;

    const elapsed = periodSwitchStartedAt ? Date.now() - periodSwitchStartedAt : 0;
    const remaining = Math.max(0, MIN_PERIOD_SWITCH_LOADING_MS - elapsed);
    if (remaining > 0) {
      const timeoutId = window.setTimeout(() => {
        if (!isLoadingPremium && !isValidatingPremium) {
          setPendingStatsPeriod(null);
          setPeriodSwitchStartedAt(null);
        }
      }, remaining);

      return () => window.clearTimeout(timeoutId);
    }

    if (isLoadingPremium || isValidatingPremium) return;

    setPendingStatsPeriod(null);
    setPeriodSwitchStartedAt(null);
  }, [isLoadingPremium, isValidatingPremium, pendingStatsPeriod, periodSwitchStartedAt]);

  useEffect(() => {
    if (!pendingStatsPeriod) return;
    const timeoutId = window.setTimeout(() => {
      setPendingStatsPeriod(null);
      setPeriodSwitchStartedAt(null);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [pendingStatsPeriod]);

  async function handleLegendaryCelebrationSeen() {
    if (!publicSlug || !premiumProfile?.legendaryCelebration?.seasonYear) {
      setShowLegendaryModal(false);
      return;
    }

    setIsMarkingLegendarySeen(true);
    try {
      await markLegendaryCelebrationSeen({
        tenantSlug: publicSlug,
        year: premiumProfile.legendaryCelebration.seasonYear,
      });
      setShowLegendaryModal(false);
      await mutatePremiumProfile();
    } catch {
      setShowLegendaryModal(false);
    } finally {
      setIsMarkingLegendarySeen(false);
    }
  }

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">Carregando perfil...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
        Redirecionando para o login...
      </div>
    );
  }

  if (isPendingApproval) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
        Redirecionando para a tela de solicitação em análise...
      </div>
    );
  }

  if (isRejectedMembership || isSuspendedMembership) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-zinc-100">
        <div className="rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-soft">
            Perfil do atleta
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-white">
            {isRejectedMembership ? "Solicitação não aprovada" : "Acesso suspenso neste grupo"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {isRejectedMembership
              ? "Sua solicitação para participar deste grupo não foi aprovada. Sua Conta Fut7Pro continua ativa normalmente."
              : "Sua Conta Fut7Pro está ativa, mas seu acesso aos recursos de atleta deste grupo está suspenso no momento."}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push(globalProfileHref)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
            >
              Minha conta Fut7Pro
            </button>
            <button
              type="button"
              onClick={() => router.push(publicHref("/"))}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
            >
              Ir para o site do grupo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !usuario) {
    const shouldCompleteGlobalProfile = !isError && !normalizedMembershipStatus;
    const title = hasConfirmedNoGroupMembership
      ? "Você ainda não participa deste grupo"
      : isMembershipLookupError
        ? "Não foi possível verificar seu vínculo com este grupo"
        : shouldCompleteGlobalProfile
          ? "Complete seu Perfil Fut7Pro"
          : isError
            ? "Não foi possível carregar seu desempenho neste grupo"
            : "Desempenho indisponível neste grupo";
    const description = hasConfirmedNoGroupMembership
      ? "Para acessar seu desempenho e os recursos dos atletas, solicite sua entrada no grupo."
      : isMembershipLookupError
        ? "Sua Conta Fut7Pro continua ativa, mas não conseguimos confirmar agora se você participa deste grupo."
        : shouldCompleteGlobalProfile
          ? "Antes de acessar seu desempenho neste grupo, complete seu Perfil Fut7Pro. Se você já enviou uma solicitação, acompanhe o status no site do grupo."
          : isError
            ? "Sua Conta Fut7Pro está ativa, mas não conseguimos carregar os dados esportivos deste grupo agora. Tente novamente em instantes."
            : "Sua Conta Fut7Pro está ativa, mas ainda não encontramos seu perfil de atleta neste grupo. Se o problema continuar, fale com os administradores.";
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-zinc-100">
        <div className="rounded-2xl border border-white/10 bg-[#0f1118] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-soft">
            Perfil do atleta
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-white">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{description}</p>
          {isError && error && <p className="mt-2 text-xs text-zinc-500">{error}</p>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (isError) {
                  if (hasConfirmedNoGroupMembership) {
                    router.push(requestJoinHref);
                    return;
                  }
                  void retryMembershipLookup();
                  return;
                }
                router.push(globalProfileHref);
              }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
            >
              {isError
                ? hasConfirmedNoGroupMembership
                  ? "Solicitar entrada"
                  : "Tentar novamente"
                : shouldCompleteGlobalProfile
                  ? "Completar Perfil Fut7Pro"
                  : "Minha conta Fut7Pro"}
            </button>
            <button
              type="button"
              onClick={() => router.push(publicHref("/"))}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
            >
              Ir para o site do grupo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingPremium && !premiumProfile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">Carregando perfil premium...</div>
    );
  }

  if (isErrorPremium || !premiumProfile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-red-100">
        <div className="rounded-xl border border-red-500/40 bg-red-950/25 p-5">
          <h1 className="text-xl font-bold">Perfil premium indisponível</h1>
          <p className="mt-2 text-sm text-red-100/80">
            Não foi possível carregar seu perfil neste grupo. Tente novamente em instantes.
          </p>
          {premiumError && <p className="mt-3 text-xs text-red-200/70">{premiumError}</p>}
        </div>
      </div>
    );
  }

  const athleteSlugForLinks = premiumProfile.athlete.slug || usuario.slug;
  const premiumView = mapPremiumPayloadToView(premiumProfile, premiumProfile.stats.titles);
  const nivelAssiduidade = premiumProfile.stats.attendancePercent
    ? `${premiumProfile.stats.attendancePercent}%`
    : "Sem dados";
  const isPeriodSwitching =
    Boolean(pendingStatsPeriod) ||
    Boolean(premiumProfile && (isLoadingPremium || isValidatingPremium)) ||
    Boolean(premiumProfile.stats.period && premiumProfile.stats.period !== statsPeriod);
  const handleStatsPeriodChange = (period: "current" | "all") => {
    if (period === statsPeriod) return;
    setPendingStatsPeriod(period);
    setPeriodSwitchStartedAt(Date.now());
    setStatsPeriod(period);
  };

  return (
    <div className="text-white w-full">
      <h1 className="sr-only">Meu Perfil – Estatísticas, Conquistas e Histórico | Fut7Pro</h1>
      {isPendingApproval && (
        <div className="mx-auto mb-6 max-w-5xl rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand-soft">
          <strong className="block text-brand-soft">Aguardando aprovacao do admin.</strong>
          Seu cadastro foi recebido e o acesso completo sera liberado em breve.
        </div>
      )}
      {(roleLabel || nivelAssiduidade) && (
        <div className="mx-auto mb-4 max-w-[1280px] px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-300">
            {roleLabel && (
              <span className="rounded-full border border-brand/50 px-3 py-1 text-brand-soft">
                {roleLabel}
              </span>
            )}
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-200">
              Assiduidade: {nivelAssiduidade}
            </span>
          </div>
        </div>
      )}

      <AthletePremiumProfileView
        mode="owner"
        athlete={premiumView.athlete}
        tenant={premiumView.tenant}
        stats={premiumView.stats}
        index={premiumView.index}
        achievements={premiumView.achievements}
        achievementGroups={premiumView.achievementGroups}
        badges={premiumView.badges}
        legendaryProgress={premiumView.legendaryProgress}
        statsPeriod={statsPeriod}
        isPeriodSwitching={isPeriodSwitching}
        onStatsPeriodChange={handleStatsPeriodChange}
        links={{
          statsUrl: publicHref("/estatisticas/ranking-geral"),
          achievementsUrl: publicHref(`/atletas/${athleteSlugForLinks}/conquistas`),
          historyUrl: publicHref(`/atletas/${athleteSlugForLinks}/historico`),
        }}
        publicProfilePath={
          premiumProfile.athlete.slug && publicSlug
            ? publicHref(`/atletas/${encodeURIComponent(premiumProfile.athlete.slug)}`)
            : null
        }
      />
      {showLegendaryModal && premiumProfile?.legendaryCelebration?.shouldShow && (
        <LegendaryUnlockedModal
          title={
            premiumProfile.legendaryCelebration.title ||
            `Você desbloqueou o Card Lendário ${premiumProfile.legendaryCelebration.seasonYear}!`
          }
          message={
            premiumProfile.legendaryCelebration.message ||
            "Sua presença, constância e conquistas como Campeão do Dia colocaram você entre os grandes da temporada."
          }
          primaryActionLabel={premiumProfile.legendaryCelebration.primaryActionLabel}
          secondaryActionLabel={premiumProfile.legendaryCelebration.secondaryActionLabel}
          medalAsset={premiumProfile.visual.medalAsset}
          athleteName={premiumProfile.athlete.publicName}
          isSubmitting={isMarkingLegendarySeen}
          onPrimaryAction={handleLegendaryCelebrationSeen}
          onSecondaryAction={handleLegendaryCelebrationSeen}
          onClose={handleLegendaryCelebrationSeen}
        />
      )}

      {/* Histórico */}
      {usuario.historico && usuario.historico.length > 0 && (
        <section className="mt-12 px-4">
          <HistoricoJogos historico={usuario.historico} />
          <div className="text-center mt-4">
            <span className="inline-block text-brand text-sm opacity-70 cursor-not-allowed">
              Ver histórico completo (apenas admin)
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
