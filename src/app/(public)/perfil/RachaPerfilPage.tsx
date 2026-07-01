"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
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

function MembershipStatusCard({
  variant,
  rachaName,
  onConfirm,
}: {
  variant: "active" | "request" | "pending";
  rachaName: string;
  onConfirm?: () => Promise<void>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!onConfirm || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onConfirm();
      setModalOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRequest = variant === "request";
  const title =
    variant === "active"
      ? "Mensalista neste racha"
      : variant === "pending"
        ? "Solicitação em análise"
        : "Solicitar vaga de mensalista";
  const description =
    variant === "active"
      ? `Você já tem status de mensalista no ${rachaName}.`
      : variant === "pending"
        ? `Seu pedido de mensalista no ${rachaName} foi enviado e está aguardando avaliação do administrador.`
        : `Solicite uma vaga de mensalista no ${rachaName}. O administrador irá avaliar e aprovar caso exista vaga disponível.`;

  return (
    <>
      <button
        type="button"
        className={`group relative w-full overflow-hidden rounded-xl border border-[#f8c64a]/35 bg-[linear-gradient(135deg,rgba(16,12,4,0.94),rgba(3,4,4,0.96))] px-4 py-3 text-left shadow-[0_14px_28px_rgba(0,0,0,0.35)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8c64a]/60 ${
          isRequest ? "hover:border-[#f8c64a]/70" : "cursor-default"
        }`}
        onClick={() => {
          if (isRequest) setModalOpen(true);
        }}
        title={title}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(248,198,74,0.16),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(248,198,74,0.10),transparent_38%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex w-fit rounded-full border border-[#f8c64a]/45 bg-[#f8c64a]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffe08a]">
              Mensalista
            </span>
            <h3 className="mt-2 text-lg font-extrabold leading-tight text-white">{title}</h3>
            <p className="mt-1 max-w-[58ch] text-sm leading-relaxed text-zinc-200">{description}</p>
          </div>
          {isRequest && (
            <span className="inline-flex w-fit shrink-0 items-center rounded-lg bg-gradient-to-r from-[#b97808] via-[#f8c64a] to-[#fff0a8] px-4 py-2 text-sm font-black text-black transition group-hover:brightness-110">
              Solicitar vaga
            </span>
          )}
        </div>
      </button>
      {isRequest && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#f8c64a]/55 bg-zinc-950 p-6 shadow-xl sm:p-8">
            <div className="mb-2 text-center text-lg font-semibold text-[#f8c64a]">
              Solicitar vaga de mensalista
            </div>
            <div className="mb-6 text-center text-sm text-zinc-100">
              Ao confirmar, seu pedido de mensalista no {rachaName} será enviado ao administrador.
              <br />
              <span className="text-[#ffe08a]">
                A aprovação depende da disponibilidade de vaga e das regras do racha.
              </span>
              <br />
              Deseja realmente enviar este pedido?
            </div>
            {submitError && (
              <p className="mb-3 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
                {submitError}
              </p>
            )}
            <div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded bg-[#f8c64a] px-5 py-2 font-semibold text-zinc-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8c64a]/70 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Confirmar"}
              </button>
              <button
                type="button"
                className="rounded bg-zinc-700 px-5 py-2 font-semibold text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Página ---
export default function PerfilUsuarioPage() {
  const { usuario, roleLabel, isLoading, isError, isAuthenticated, isPendingApproval } =
    usePerfil();
  const router = useRouter();
  const { publicHref, publicSlug } = usePublicLinks();
  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", publicHref("/perfil"));
    return `${publicHref("/entrar")}?${params.toString()}`;
  }, [publicHref]);
  const [statsPeriod, setStatsPeriod] = useState<"current" | "all">("current");
  const [pendingStatsPeriod, setPendingStatsPeriod] = useState<"current" | "all" | null>(null);
  const [periodSwitchStartedAt, setPeriodSwitchStartedAt] = useState<number | null>(null);
  const [pedidoEnviado, setPedidoEnviado] = useState<boolean>(
    usuario?.mensalistaRequestStatus === "PENDING"
  );
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
    enabled: Boolean(publicSlug && isAuthenticated && !isPendingApproval),
    statsPeriod,
  });

  async function solicitarVagaMensalista() {
    if (!publicSlug) {
      throw new Error("Não foi possível identificar o racha para enviar sua solicitação.");
    }

    const response = await fetch(
      `/api/public/${encodeURIComponent(publicSlug)}/mensalistas/request`,
      {
        method: "POST",
        cache: "no-store",
      }
    );

    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text || null;
    }

    if (!response.ok) {
      const payload = typeof body === "object" && body ? (body as Record<string, unknown>) : null;
      const message =
        (typeof payload?.message === "string" ? payload.message : null) ||
        (typeof payload?.error === "string" ? payload.error : null) ||
        (typeof body === "string" ? body : null) ||
        "Não foi possível enviar sua solicitação agora.";
      throw new Error(message);
    }

    setPedidoEnviado(true);
  }

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
    if (usuario?.mensalistaRequestStatus === "PENDING") {
      setPedidoEnviado(true);
    }
  }, [usuario?.mensalistaRequestStatus]);

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

  if (isError || !usuario) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-red-200">
        Não foi possível carregar o perfil. Tente novamente mais tarde.
      </div>
    );
  }

  if (isPendingApproval) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
        Redirecionando para a tela de aguardando aprovacao...
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
            Não foi possível carregar o contrato oficial do seu Perfil Premium neste racha. Tente
            novamente em instantes.
          </p>
          {premiumError && <p className="mt-3 text-xs text-red-200/70">{premiumError}</p>}
        </div>
      </div>
    );
  }

  const athleteSlugForLinks = premiumProfile.athlete.slug || usuario.slug;
  const premiumView = mapPremiumPayloadToView(premiumProfile, premiumProfile.stats.titles);
  const {
    titulosGrandesTorneios = [],
    titulosAnuais = [],
    titulosQuadrimestrais = [],
  } = premiumView.achievementGroups ?? {};
  const rachaName =
    premiumProfile.tenant.name || premiumProfile.tenant.slug || publicSlug || "racha";
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
        ownerActions={
          usuario.mensalista ? (
            <MembershipStatusCard variant="active" rachaName={rachaName} />
          ) : !pedidoEnviado ? (
            <MembershipStatusCard
              variant="request"
              rachaName={rachaName}
              onConfirm={solicitarVagaMensalista}
            />
          ) : (
            <MembershipStatusCard variant="pending" rachaName={rachaName} />
          )
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

      {/* Conquistas */}
      <section className="mt-12 px-4">
        <ConquistasDoAtleta
          slug={athleteSlugForLinks}
          titulosGrandesTorneios={titulosGrandesTorneios}
          titulosAnuais={titulosAnuais}
          titulosQuadrimestrais={titulosQuadrimestrais}
        />
      </section>

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
