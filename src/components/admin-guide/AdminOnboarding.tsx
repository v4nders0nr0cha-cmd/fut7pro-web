"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  Circle,
  ExternalLink,
  LockKeyhole,
  Trophy,
  UserRoundPlus,
} from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import {
  ONBOARDING_IDS,
  PREPARATION_IDS,
  FOOTBALL_IDS,
  isOnboardingActionUnlocked,
  onboardingBlockMessage,
} from "@/lib/admin-onboarding";
import AdminGuideInvitationPanel from "./AdminGuideInvitationPanel";
import {
  contextualGuideHref,
  type GuideOrigin,
  guideDestination,
} from "@/lib/admin-guide-navigation";

const STEP_SUMMARY: Record<string, string> = {
  ACCOUNT_READY: "Sua conta está pronta e o site do grupo já pode receber a galera.",
  ACTIVE_PLAYERS: "Compartilhe o link do grupo para os atletas entrarem e montarem seus perfis.",
  SCHEDULE: "Escolha o dia e o horário dos jogos e salve a rotina do grupo.",
  OFFICIAL_TEAMS:
    "Cadastre as equipes que participam dos jogos. Dois times são o mínimo para começar.",
  ATHLETE_LEVELS:
    "Avalie habilidade e físico dos atletas para ajudar a montar times mais equilibrados.",
  FIRST_MATCHDAY:
    "Escolha entre o sorteio e a partida clássica e prepare a primeira rodada do grupo.",
  RESULTS_RECORDED: "Registre placares, gols e assistências. Revise os dados e finalize a rodada.",
  CHAMPION_PUBLISHED: "Confira a rodada finalizada e publique o time que conquistou o dia.",
};

const primary =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50";
const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10 disabled:opacity-50";
export default function AdminOnboarding({
  onClose,
  onNavigate,
  origin = "pagina",
  initialStep,
  firstPresentation = false,
  actionsReady = true,
  onInvitationChange,
  returnTo,
}: {
  onClose?: (permanentlyDismissed?: boolean) => void;
  onNavigate?: () => void;
  origin?: GuideOrigin;
  initialStep?: string;
  firstPresentation?: boolean;
  actionsReady?: boolean;
  onInvitationChange?: (open: boolean) => void;
  returnTo?: string;
}) {
  const { guide, updating, update, actionError, error, validating, retry } = useAdminGuide();
  const { data: session } = useSession();
  const returning =
    !firstPresentation &&
    Boolean(guide?.pedagogicalState.welcomePresentedAt || guide?.pedagogicalState.welcomeSeenAt);
  const stepDetailsId = useId();
  const [selected, setSelected] = useState<string | undefined>(initialStep);
  const preparationComplete = Boolean(
    guide?.phases?.preparation.complete ?? guide?.eligibility?.preparationComplete
  );
  const reviewScope = guide ? `${guide.tenant.id}:${guide.administrator.membershipId}` : "";
  const [reviewingScope, setReviewingScope] = useState("");
  useEffect(() => setReviewingScope(""), [reviewScope, preparationComplete]);
  const reviewingPreparation = Boolean(reviewScope && reviewingScope === reviewScope);
  const footballActive = preparationComplete && !reviewingPreparation;
  const footballUnlocked = Boolean(guide?.eligibility?.footballUnlocked);
  const previousPhase = useRef(footballActive);
  useEffect(() => {
    if (previousPhase.current !== footballActive) setSelected(undefined);
    previousPhase.current = footballActive;
  }, [footballActive]);
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [invitationOpen, setInvitationOpen] = useState(false);
  // O contexto é fixado ao abrir: concluir a Fase 1 durante o convite não reinicia o painel.
  const [invitationMode, setInvitationMode] = useState<"onboarding" | "reinvite">("onboarding");
  const invitationButtonRef = useRef<HTMLButtonElement>(null);
  const stepButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const stepsHeadingRef = useRef<HTMLHeadingElement>(null);
  const selectedCompleted = guide?.tasks.find((task) => task.id === selected)?.completed;
  const previousCompletion = useRef({ id: selected, completed: selectedCompleted });
  useEffect(() => {
    if (
      selectedCompleted &&
      previousCompletion.current.id === selected &&
      previousCompletion.current.completed === false
    )
      setSelected(undefined);
    previousCompletion.current = { id: selected, completed: selectedCompleted };
  }, [selected, selectedCompleted]);
  if (!guide) return <p role="status">Carregando seus primeiros passos...</p>;
  const tasks = ONBOARDING_IDS.flatMap((id) => guide.tasks.filter((task) => task.id === id));
  const phaseIds = footballActive ? FOOTBALL_IDS : PREPARATION_IDS;
  const phaseTasks = phaseIds.flatMap((id) => tasks.filter((task) => task.id === id));
  const phaseTitle = footballActive ? "Entre em campo" : "Prepare seu grupo";
  const waitingForPlayers = preparationComplete && !footballUnlocked;
  const compactLockedPhase = footballActive && waitingForPlayers;
  const showStepDetails = !compactLockedPhase || phaseTasks.some((task) => task.id === selected);
  const eligibility = guide.eligibility;
  const eligibilityKnown = Boolean(
    eligibility &&
      Number.isFinite(eligibility.eligiblePlayers) &&
      eligibility.eligiblePlayers >= 0 &&
      Number.isFinite(eligibility.minimumPlayers) &&
      eligibility.minimumPlayers > 0 &&
      Number.isFinite(eligibility.missingPlayers) &&
      eligibility.missingPlayers >= 0
  );
  const active =
    phaseTasks.find((item) => item.id === selected) ??
    phaseTasks.find((item) => !item.completed) ??
    phaseTasks[phaseTasks.length - 1];
  if (!active) return null;
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "organizador";
  const select = (id: string) => {
    setSelected(id);
  };
  const destination = guideDestination(guide, active);
  const actionUnlocked =
    (!FOOTBALL_IDS.includes(active.id) || footballUnlocked) &&
    isOnboardingActionUnlocked(guide.tasks, active.id, guide.actionAvailability);
  const canUseActions = actionsReady && !validating && !error;
  if (invitationOpen)
    return (
      <AdminGuideInvitationPanel
        guide={guide}
        mode={invitationMode}
        origin={origin}
        returnTo={returnTo}
        onNavigate={onNavigate}
        updating={updating || !canUseActions}
        update={update}
        onContinue={() => {
          onInvitationChange?.(false);
          setSelected(undefined);
          setInvitationOpen(false);
          window.setTimeout(() => {
            const heading = stepsHeadingRef.current;
            const scroller = heading
              ?.closest('[role="dialog"]')
              ?.querySelector<HTMLElement>(".overflow-y-auto");
            if (scroller) scroller.scrollTop = 0;
            heading?.focus({ preventScroll: true });
          }, 0);
        }}
        onBack={() => {
          onInvitationChange?.(false);
          setInvitationOpen(false);
          window.setTimeout(
            () => (invitationButtonRef.current ?? stepsHeadingRef.current)?.focus(),
            0
          );
        }}
      />
    );
  return (
    <div className="grid min-w-0 gap-4 text-white md:gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
      <aside className="min-w-0 text-center md:border-r md:border-white/15 md:pr-6">
        <div className="relative mx-auto max-w-sm md:max-w-none">
          <div
            className="relative h-20 overflow-hidden rounded-2xl border border-white/10 bg-[#24272d] md:h-36"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 35% 10%, rgba(211,172,87,0.18), transparent 70%), linear-gradient(135deg, #30343b, #1d2026)",
            }}
          >
            {guide.tenant.logoUrl ? (
              <Image
                unoptimized
                src={guide.tenant.logoUrl}
                alt={`Escudo de ${guide.tenant.name}`}
                fill
                sizes="(min-width: 768px) 250px, 400px"
                className="object-cover object-[center_43%] scale-[1.35] opacity-80 mix-blend-luminosity saturate-50 contrast-110"
                style={{
                  maskImage:
                    "radial-gradient(ellipse 75% 100% at 50% 42%, black 20%, transparent 80%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 75% 100% at 50% 42%, black 20%, transparent 80%)",
                }}
              />
            ) : (
              <Trophy
                className="absolute -bottom-4 left-1/2 h-28 w-28 -translate-x-1/2 -rotate-12 text-amber-200/25 md:h-40 md:w-40"
                aria-hidden="true"
              />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1d2026]/75 via-transparent to-[#1d2026]/10 shadow-[inset_0_0_35px_rgba(20,22,27,0.45)]"
            />
          </div>
          {session?.user?.image && (
            <Image
              unoptimized
              src={session.user.image}
              alt="Sua foto de perfil"
              width={68}
              height={68}
              className="absolute -bottom-4 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full border-2 border-amber-300 object-cover shadow-[0_0_0_5px_#111214] md:-bottom-6 md:h-16 md:w-16"
            />
          )}
        </div>
        <h2 className="mt-6 text-lg font-bold md:mt-9 md:text-xl">
          {returning
            ? `Bem-vindo de volta, ${firstName}!`
            : `Olá, ${firstName}! Bem-vindo ao Fut7Pro!`}
        </h2>
        <p className="mt-2 break-words text-sm text-zinc-300 md:mt-3">
          {guide.phases?.preparation.complete ? (
            guide.eligibility?.footballUnlocked ? (
              "A galera já está chegando! Vamos avaliar os atletas e preparar sua primeira rodada?"
            ) : (
              "Sua pelada já está configurada! Agora falta reunir a galera para começarmos a próxima fase."
            )
          ) : returning ? (
            "Bom ter você de volta, professor! ⚽ Vamos continuar de onde paramos e deixar sua pelada pronta para entrar em campo?"
          ) : (
            <>
              Seu grupo <strong className="text-yellow-300">{guide.tenant.name}</strong> já está no
              ar! Vamos dar os primeiros passos juntos e preparar tudo para a galera começar a
              jogar?
            </>
          )}
        </p>
      </aside>
      <section className="min-w-0 space-y-4" aria-label="Primeiros passos do grupo">
        <div>
          <h2 ref={stepsHeadingRef} tabIndex={-1} className="text-xl font-bold focus:outline-none">
            Primeiros passos do grupo
          </h2>
          <p className="mt-1 text-sm text-zinc-300">
            {guide.activationProgress.percentage}% concluído · {guide.activationProgress.completed}{" "}
            de {guide.activationProgress.total} etapas
          </p>
          <div
            role="progressbar"
            aria-label="Progresso do grupo"
            aria-valuenow={guide.activationProgress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-200"
              style={{ width: `${guide.activationProgress.percentage}%` }}
            />
          </div>
        </div>
        <section aria-label={phaseTitle}>
          <div className="mb-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
                Fase {footballActive ? "2" : "1"}
              </span>
              {footballActive && (
                <span className="text-[10px] font-semibold text-emerald-400">Fase 1 concluída</span>
              )}
            </div>
            <h3 className="mt-0.5 text-base font-semibold">{phaseTitle}</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              {footballActive
                ? footballUnlocked
                  ? "Avalie a galera, organize a rodada e dê início à história do grupo."
                  : "Conheça os próximos passos para começar a organizar os jogos do seu grupo."
                : "Deixe sua pelada pronta para começar, um passo de cada vez."}
            </p>
          </div>
          {compactLockedPhase && (
            <section
              aria-label="Requisito para liberar a Fase 2"
              className="mb-3 grid grid-cols-[20px_minmax(0,1fr)] gap-x-2.5 rounded-xl border border-amber-200/25 bg-amber-200/[0.04] px-3 py-2"
            >
              <LockKeyhole size={19} className="mt-0.5 text-amber-200" aria-hidden="true" />
              <div className="min-w-0">
                {error ? (
                  <p role="status" className="text-xs leading-5 text-zinc-300">
                    Não foi possível atualizar a contagem de atletas.
                  </p>
                ) : !canUseActions || !eligibilityKnown ? (
                  <p role="status" className="text-xs leading-5 text-zinc-400">
                    Atualizando a contagem de atletas...
                  </p>
                ) : eligibility ? (
                  <div aria-live="polite">
                    <div className="flex items-start justify-between gap-2 text-xs leading-5 sm:text-sm">
                      <p className="min-w-0 font-semibold">
                        {eligibility.missingPlayers === 1
                          ? "Falta 1 atleta para liberar"
                          : `Faltam ${eligibility.missingPlayers} atletas para liberar`}
                      </p>
                      <p className="shrink-0 whitespace-nowrap font-medium tabular-nums text-zinc-200">
                        {eligibility.eligiblePlayers} / {eligibility.minimumPlayers}
                      </p>
                    </div>
                    <div
                      role="progressbar"
                      aria-label="Atletas elegíveis para a Fase 2"
                      aria-valuenow={Math.min(
                        eligibility.eligiblePlayers,
                        eligibility.minimumPlayers
                      )}
                      aria-valuemin={0}
                      aria-valuemax={eligibility.minimumPlayers}
                      className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15"
                    >
                      <div
                        className="h-full rounded-full bg-amber-200"
                        style={{
                          width: `${Math.min(100, (eligibility.eligiblePlayers / eligibility.minimumPlayers) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                <button
                  ref={invitationButtonRef}
                  type="button"
                  className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-yellow-300 underline underline-offset-4 hover:text-yellow-200 disabled:opacity-50 sm:min-h-9"
                  disabled={updating || !canUseActions}
                  onClick={() => {
                    setInvitationMode("reinvite");
                    onInvitationChange?.(true);
                    setInvitationOpen(true);
                  }}
                >
                  <UserRoundPlus size={14} aria-hidden="true" />
                  Convidar jogadores
                  <ChevronRight size={13} aria-hidden="true" />
                </button>
              </div>
            </section>
          )}
          <ol className="space-y-1" aria-label={`Etapas de ${phaseTitle}`}>
            {phaseTasks.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  ref={(node) => {
                    stepButtonRefs.current[item.id] = node;
                  }}
                  aria-current={active.id === item.id ? "step" : undefined}
                  aria-expanded={compactLockedPhase ? selected === item.id : undefined}
                  aria-controls={compactLockedPhase ? stepDetailsId : undefined}
                  aria-describedby={
                    !item.completed &&
                    !isOnboardingActionUnlocked(guide.tasks, item.id, guide.actionAvailability)
                      ? "onboarding-step-locked"
                      : undefined
                  }
                  onClick={() => select(item.id)}
                  className={`group flex min-h-11 w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 ${
                    active.id === item.id
                      ? "border-amber-200/20 bg-amber-200/[0.07] text-amber-100"
                      : "border-transparent text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <span className="w-3 shrink-0 text-xs text-zinc-500" aria-hidden="true">
                    {index + 1 + (footballActive ? PREPARATION_IDS.length : 0)}
                  </span>
                  {item.completed ? (
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-400"
                      aria-label="Concluída"
                    />
                  ) : !isOnboardingActionUnlocked(
                      guide.tasks,
                      item.id,
                      guide.actionAvailability
                    ) ? (
                    <LockKeyhole size={16} className="shrink-0 text-zinc-500" aria-hidden="true" />
                  ) : (
                    <Circle
                      size={18}
                      className={`shrink-0 ${active.id === item.id ? "text-amber-200" : "text-zinc-600"}`}
                      aria-hidden="true"
                    />
                  )}
                  <span className={item.completed ? "text-zinc-400" : ""}>{item.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <p id="onboarding-step-locked" className="sr-only">
            Você pode consultar esta etapa. A execução depende dos requisitos do grupo e das suas
            permissões.
          </p>
        </section>
        {showStepDetails && (
          <section
            id={stepDetailsId}
            className="space-y-3 rounded-xl border border-white/10 bg-[#202329]/70 p-4"
            aria-label={active.title}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold">{active.title}</h3>
              {compactLockedPhase && (
                <button
                  type="button"
                  aria-label="Recolher orientação"
                  className="inline-flex min-h-9 shrink-0 items-center gap-1 text-xs text-zinc-400 underline underline-offset-4 hover:text-zinc-200"
                  onClick={() => {
                    setSelected(undefined);
                    stepButtonRefs.current[active.id]?.focus();
                  }}
                >
                  Recolher <ChevronUp size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="text-sm text-zinc-300">{STEP_SUMMARY[active.id]}</p>
            {active.id === "ACTIVE_PLAYERS" ? (
              <button
                ref={invitationButtonRef}
                type="button"
                className={primary}
                disabled={updating || !actionUnlocked || !canUseActions}
                aria-describedby={!actionUnlocked ? "onboarding-action-locked" : undefined}
                onClick={() => {
                  setSelected("ACTIVE_PLAYERS");
                  setInvitationMode(preparationComplete ? "reinvite" : "onboarding");
                  onInvitationChange?.(true);
                  setInvitationOpen(true);
                }}
              >
                Convidar jogadores agora
              </button>
            ) : actionUnlocked && canUseActions && destination ? (
              <Link
                className={primary}
                href={
                  active.id === "ACCOUNT_READY"
                    ? destination
                    : contextualGuideHref(destination, active.id, origin)
                }
                target={active.id === "ACCOUNT_READY" ? "_blank" : undefined}
                rel={active.id === "ACCOUNT_READY" ? "noopener noreferrer" : undefined}
                onClick={() => {
                  if (active.id === "ACCOUNT_READY") return;
                  onNavigate?.();
                  if (FOOTBALL_IDS.includes(active.id) && !guide.pedagogicalState.footballStartedAt)
                    void update({ action: "FOOTBALL_STARTED" });
                  else void update({ action: "STEP_SELECTED", tipId: active.id });
                }}
              >
                {active.id === "ACCOUNT_READY"
                  ? "Ver site do grupo"
                  : active.completed
                    ? "Consultar funcionalidade"
                    : "Continuar"}
                {active.id === "ACCOUNT_READY" && (
                  <ExternalLink size={14} className="ml-2 shrink-0" aria-hidden="true" />
                )}
              </Link>
            ) : (
              <button
                type="button"
                className={primary}
                disabled
                aria-describedby={!actionUnlocked ? "onboarding-action-locked" : undefined}
              >
                {active.id === "ACCOUNT_READY"
                  ? "Ver site do grupo"
                  : active.completed
                    ? "Consultar funcionalidade"
                    : "Continuar"}
              </button>
            )}
            {!actionUnlocked && (
              <p id="onboarding-action-locked" className="text-sm text-zinc-300">
                {onboardingBlockMessage(guide, active.id)}
              </p>
            )}
            {!active.completed && !active.canAct && active.id !== "ACTIVE_PLAYERS" && (
              <p className="text-sm text-zinc-300">
                Esta ação depende de outro administrador autorizado do grupo.
              </p>
            )}
          </section>
        )}
        {preparationComplete && (
          <button
            type="button"
            className="min-h-11 w-full text-left text-xs text-zinc-400 underline underline-offset-4 hover:text-zinc-200"
            onClick={() => {
              setSelected(undefined);
              setReviewingScope(reviewingPreparation ? "" : reviewScope);
              stepsHeadingRef.current?.focus();
            }}
          >
            {reviewingPreparation ? "Voltar à Fase 2" : "Rever etapas da Fase 1"}
          </button>
        )}
        {guide.reward?.granted && (
          <p className="rounded-xl border border-yellow-400/25 p-3 text-sm text-yellow-200">
            Conquista do guia: +{guide.reward.days} dias de Fut7Pro concedidos ao grupo.
            {guide.reward.trialEnd
              ? ` Término atual do teste: ${new Date(guide.reward.trialEnd).toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" })}.`
              : ""}
          </p>
        )}
        {guide.activationProgress.complete && (
          <p role="status" className="text-emerald-300">
            Primeiros passos concluídos! Continue organizando os próximos jogos.
          </p>
        )}
        {error && (
          <p role="status" className="text-sm text-yellow-200">
            Não foi possível atualizar a exibição do progresso.{" "}
            <button className="min-h-11 underline" onClick={() => void retry()}>
              Tentar atualizar
            </button>
          </p>
        )}
        {actionError && (
          <p role="alert" className="text-sm text-red-300">
            {actionError.status === 409
              ? "O guia mudou em outra sessão. Confira o progresso atualizado e tente novamente."
              : "Não foi possível salvar sua escolha. Tente novamente."}
          </p>
        )}
      </section>
      {onClose && (
        <footer
          className="border-t border-white/10 pt-3 text-center md:col-span-2"
          aria-label="Preferências do guia"
        >
          <button
            ref={dismissButtonRef}
            disabled={updating || !actionsReady}
            className="min-h-11 text-xs text-zinc-400 underline decoration-white/20 hover:text-zinc-200 underline-offset-4"
            onClick={() => setConfirmDismiss(true)}
          >
            Não mostrar este Guia novamente
          </button>
          {confirmDismiss && (
            <section
              role="alertdialog"
              aria-modal="false"
              aria-labelledby="guide-dismiss-title"
              className="mt-3 space-y-3 rounded-xl border border-white/15 bg-[#23262b] p-4 text-left"
            >
              <h3 id="guide-dismiss-title" className="font-semibold">
                Deseja deixar de receber este guia?
              </h3>
              <p className="text-sm text-zinc-300">
                O Guia Interativo não aparecerá mais automaticamente para você neste grupo.
              </p>
              <p className="text-sm text-zinc-300">
                Se quiser acessá-lo novamente, ele continuará disponível no menu do seu perfil, em
                Ajuda e orientação → Guia Interativo.
              </p>
              <button
                autoFocus
                className={secondary}
                disabled={updating || !actionsReady}
                onClick={() => {
                  setConfirmDismiss(false);
                  dismissButtonRef.current?.focus();
                }}
              >
                Manter o guia
              </button>
              <button
                className="ml-2 min-h-11 text-sm text-red-300 underline"
                disabled={updating || !actionsReady}
                onClick={async () => {
                  if (await update({ action: "DASHBOARD_INVITE_DISMISSED" })) {
                    setConfirmDismiss(false);
                    onClose?.(true);
                  }
                }}
              >
                Não mostrar novamente
              </button>
            </section>
          )}
        </footer>
      )}
    </div>
  );
}
