"use client";

import Image from "next/image";
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

// --- Card Mensalista Premium ---
function CartaoMensalistaPremium({
  nome,
  logoRacha,
  ativo = true,
}: {
  nome: string;
  logoRacha: string;
  ativo?: boolean;
}) {
  return (
    <div
      className={`
        relative w-[340px] h-[160px] rounded-2xl overflow-hidden
        border flex
        bg-[url('/images/bg-campo-fut7.jpg')] bg-cover bg-center
        transition
        shadow-[0_12px_28px_rgba(0,0,0,0.45)]
        ${ativo ? "border-emerald-400/40" : "border-white/10 opacity-90"}
      `}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-transparent to-black/40" />
      <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-emerald-400/70 via-emerald-200/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
      {/* Lado esquerdo */}
      <div className="relative flex flex-col justify-between pl-5 py-4 flex-1">
        <div>
          <div className="text-emerald-200 font-extrabold text-base drop-shadow-sm tracking-wide">
            MENSALISTA
          </div>
        </div>
      </div>
      {/* Lado direito */}
      <div className="relative flex flex-col items-center justify-between w-[140px] py-3 pr-5">
        <div className="text-emerald-200 font-semibold text-xs mb-1 mt-1">Ativo no mês</div>
        <Image
          src={logoRacha}
          alt="Logo do Racha"
          width={54}
          height={54}
          className="rounded-lg border border-white/20 mb-1 bg-black/20"
          draggable={false}
        />
        <div
          className="text-white font-bold text-sm mt-2 text-center"
          style={{
            textShadow: "0px 2px 8px #000, 0px 1px 0px #222, 0px 0px 2px #000",
          }}
        >
          {nome}
        </div>
      </div>
      {/* Tooltip - canto inferior esquerdo */}
      {ativo && (
        <div className="absolute left-2 bottom-2 bg-black/70 px-2 py-1 rounded text-[10px] text-emerald-200 pointer-events-none select-none">
          Mensalista, prioridade garantida
        </div>
      )}
    </div>
  );
}

// --- Card Solicitar Mensalista ---
function CardSolicitarMensalista({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleConfirm() {
    if (isSubmitting) return;
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

  return (
    <>
      <button
        type="button"
        className="group relative w-full max-w-[360px] min-h-[176px] overflow-hidden rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#0b1220_0%,#0f172a_55%,#111827_100%)] px-5 py-5 text-left shadow-[0_18px_36px_rgba(0,0,0,0.45)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/70 hover:shadow-[0_22px_46px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
        onClick={() => setModalOpen(true)}
        title="Solicitar vaga de mensalista"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(16,185,129,0.22),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(16,185,129,0.16),transparent_38%)]" />
        <div className="relative flex h-full flex-col">
          <span className="inline-flex w-fit rounded-full border border-emerald-300/45 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
            Plano mensal
          </span>
          <h3 className="mt-3 text-[22px] font-extrabold leading-tight text-white">
            Torne-se mensalista
          </h3>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-zinc-200">
            Garanta prioridade nas partidas, benefícios exclusivos e mais previsibilidade para jogar
            toda semana.
          </p>
          <span className="mt-4 inline-flex w-fit items-center rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-zinc-950 transition group-hover:bg-emerald-300">
            Solicitar vaga agora
          </span>
        </div>
      </button>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-emerald-400/60 bg-zinc-900 p-6 shadow-xl sm:p-8">
            <div className="text-lg font-semibold text-brand mb-2 text-center">
              Solicitar vaga de Mensalista
            </div>
            <div className="text-sm text-zinc-100 text-center mb-6">
              Ao confirmar, seu pedido para se tornar mensalista será enviado ao administrador.
              <br />
              <span className="text-brand-soft">
                Caso todas as vagas já estejam ocupadas, você entrará automaticamente na lista de
                espera por ordem de solicitação.
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
                className="rounded px-5 py-2 font-semibold text-zinc-950 transition bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
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
  const [pedidoEnviado, setPedidoEnviado] = useState<boolean>(
    usuario?.mensalistaRequestStatus === "PENDING"
  );
  const [showLegendaryModal, setShowLegendaryModal] = useState(false);
  const [isMarkingLegendarySeen, setIsMarkingLegendarySeen] = useState(false);
  const {
    premiumProfile,
    isError: isErrorPremium,
    isLoading: isLoadingPremium,
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
  const nivelAssiduidade = premiumProfile.stats.attendancePercent
    ? `${premiumProfile.stats.attendancePercent}%`
    : "Sem dados";

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
        onStatsPeriodChange={setStatsPeriod}
        links={{
          statsUrl: publicHref("/estatisticas/ranking-geral"),
          achievementsUrl: publicHref(`/atletas/${athleteSlugForLinks}/conquistas`),
          historyUrl: publicHref(`/atletas/${athleteSlugForLinks}/historico`),
        }}
        ownerActions={
          <div className="grid gap-4">
            <div className="rounded-xl border border-[#f7b91b]/35 bg-black/45 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#f7b91b]">
                Ações do atleta
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#f7b91b]/50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#f7b91b] opacity-70"
                  disabled
                >
                  Editar aparência em breve
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#f7b91b]/50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#f7b91b] opacity-70"
                  disabled
                >
                  Alterar foto em breve
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              {isPendingApproval ? (
                <div className="flex h-[160px] w-[340px] flex-col items-center justify-center rounded-2xl border-4 border-brand-strong/60 bg-brand-soft text-center text-lg font-semibold text-brand-strong shadow-md">
                  Cadastro em analise.
                  <br />
                  <span className="text-sm font-normal text-brand-soft">
                    Aguarde a aprovacao para liberar as acoes do perfil.
                  </span>
                </div>
              ) : usuario.mensalista ? (
                <CartaoMensalistaPremium
                  nome={usuario.nome}
                  logoRacha="/images/logos/logo_fut7pro.png"
                  ativo={usuario.mensalista}
                />
              ) : !pedidoEnviado ? (
                <CardSolicitarMensalista onConfirm={solicitarVagaMensalista} />
              ) : (
                <div className="flex h-[160px] w-[340px] flex-col items-center justify-center rounded-2xl border-4 border-green-500 bg-green-900/80 text-center text-lg font-semibold text-green-200 shadow-md">
                  Pedido enviado! Aguarde a análise do administrador.
                  <br />
                  <span className="text-sm font-normal text-green-300">
                    Sua solicitação entrou na fila de avaliação do racha.
                  </span>
                </div>
              )}
            </div>
          </div>
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
