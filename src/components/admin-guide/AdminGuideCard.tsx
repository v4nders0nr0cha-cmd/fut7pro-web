"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import AdminOnboarding from "./AdminOnboarding";
import AdminGuideInvitationPanel from "./AdminGuideInvitationPanel";
import AdminGuidePhaseTransition, { type GuideTransitionKind } from "./AdminGuidePhaseTransition";
import AdminGuideDialog from "./AdminGuideDialog";

type GuideView = "STEPS" | "INVITATION" | GuideTransitionKind;
export default function AdminGuideCard() {
  const { guide, updating, update, actionError } = useAdminGuide();
  const { data: session } = useSession();
  const loginId = (session?.user as { onboardingLoginId?: string } | undefined)?.onboardingLoginId;
  const [openScope, setOpenScope] = useState<string | null>(null);
  const [view, setView] = useState<GuideView>("STEPS");
  const invitationOrigin = useRef<GuideTransitionKind>("CELEBRATION");
  const [initialStep, setInitialStep] = useState<string>();
  const offeredLogin = useRef("");
  const preparationClaim = useRef("");
  const currentOpen = useRef<string | null>(null);
  const currentScope = useRef("");
  const alive = useRef(true);
  const scope = guide ? `${guide.tenant.id}:${guide.administrator.membershipId}` : "";
  currentScope.current = scope;
  currentOpen.current = openScope;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (
      !guide ||
      !scope ||
      !loginId ||
      guide.activationProgress.complete ||
      guide.pedagogicalState.dashboardInviteDismissedAt
    )
      return;
    const loginKey = `${scope}:${loginId}`;
    if (offeredLogin.current === loginKey) return;
    offeredLogin.current = loginKey;
    const candidate: GuideView | null = guide.transition?.preparationCelebrationPending
      ? "CELEBRATION"
      : guide.transition?.footballInvitationPending
        ? "FOOTBALL_INVITE"
        : !guide.phases?.preparation.complete
          ? "STEPS"
          : null;
    if (!candidate) return;
    const offerKey = `${loginId}:${guide.guideVersion}:${candidate}`;
    try {
      if (sessionStorage.getItem(`onboarding-offered:${scope}`) === offerKey) return;
    } catch {
      /* Persistent membership state still controls phase transitions. */
    }
    const present = async () => {
      if (candidate === "CELEBRATION") preparationClaim.current = scope;
      if (candidate === "CELEBRATION" && !(await update({ action: "PREPARATION_CELEBRATED" })))
        return;
      if (
        candidate === "FOOTBALL_INVITE" &&
        !(await update({ action: "FOOTBALL_INVITE_PRESENTED" }))
      )
        return;
      if (!alive.current || currentScope.current !== scope) return;
      try {
        sessionStorage.setItem(`onboarding-offered:${scope}`, offerKey);
      } catch {
        /* A tab without storage can continue using the guide. */
      }
      setView(candidate);
      setOpenScope(scope);
    };
    void present();
  }, [guide, scope, loginId, update]);
  useEffect(() => {
    if (
      !guide?.transition?.preparationCelebrationPending ||
      openScope !== scope ||
      preparationClaim.current === scope ||
      guide.pedagogicalState.dashboardInviteDismissedAt
    )
      return;
    preparationClaim.current = scope;
    void update({ action: "PREPARATION_CELEBRATED" }).then((claimed) => {
      if (
        claimed &&
        alive.current &&
        currentScope.current === scope &&
        currentOpen.current === scope
      )
        setView("CELEBRATION");
    });
  }, [guide, openScope, scope, update]);
  if (
    !guide ||
    guide.activationProgress.complete ||
    guide.pedagogicalState.dashboardInviteDismissedAt
  )
    return null;
  const open = openScope === scope;
  const close = (permanent = false) => {
    setOpenScope(null);
    if (
      !permanent &&
      (view === "FOOTBALL_INVITE" ||
        (view === "INVITATION" && invitationOrigin.current === "FOOTBALL_INVITE"))
    )
      void update({ action: "FOOTBALL_INVITE_DEFERRED" });
    else if (!permanent && !guide.pedagogicalState.welcomePresentedAt)
      void update({ action: "WELCOME_PRESENTED" });
  };
  const startFootball = async () => {
    if (await update({ action: "FOOTBALL_STARTED" })) {
      setInitialStep(
        ["ATHLETE_LEVELS", "FIRST_MATCHDAY", "RESULTS_RECORDED", "CHAMPION_PUBLISHED"].find((id) =>
          guide.tasks.some((task) => task.id === id && !task.completed)
        ) ?? "ATHLETE_LEVELS"
      );
      setView("STEPS");
    }
  };
  return (
    <>
      {!open && (
        <aside
          aria-label="Guia Fut7Pro"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#23272F] p-4 text-white"
        >
          <p className="text-sm">
            {guide.phases?.preparation.complete
              ? guide.eligibility?.footballUnlocked
                ? "Parte 2 liberada. Hora de entrar em campo!"
                : `${guide.eligibility?.eligiblePlayers ?? 0} de ${guide.eligibility?.minimumPlayers ?? 10} atletas para a próxima fase.`
              : `${guide.activationProgress.completed} de ${guide.activationProgress.total} primeiros passos concluídos.`}
          </p>
          <button
            onClick={() => {
              setView("STEPS");
              setOpenScope(scope);
            }}
            className="min-h-11 rounded-lg border border-yellow-400/40 px-4 text-yellow-200"
          >
            Continuar guia
          </button>
          <button
            disabled={updating}
            onClick={() => void update({ action: "DASHBOARD_INVITE_DISMISSED" })}
            className="min-h-11 text-sm text-zinc-300"
          >
            Não mostrar novamente
          </button>
          {actionError && (
            <p role="alert">Não foi possível salvar sua preferência. Tente novamente.</p>
          )}
        </aside>
      )}
      <AdminGuideDialog open={open} onClose={() => close()}>
        {view === "STEPS" ? (
          <AdminOnboarding
            key={`${scope}:${initialStep ?? ""}`}
            initialStep={initialStep}
            onClose={close}
          />
        ) : view === "INVITATION" ? (
          <AdminGuideInvitationPanel
            guide={guide}
            updating={updating}
            update={update}
            onBack={() => setView(invitationOrigin.current)}
          />
        ) : (
          <AdminGuidePhaseTransition
            guide={guide}
            kind={view}
            updating={updating}
            onStart={() => void startFootball()}
            onInvite={() => {
              invitationOrigin.current = view;
              setView("INVITATION");
            }}
            onClose={() => close()}
          />
        )}
      </AdminGuideDialog>
    </>
  );
}
