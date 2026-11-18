"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  guideLoginScope,
  isGuideTemporarilyDismissed,
  dismissGuideForLogin,
} from "@/lib/admin-guide-presentation";
import { GUIDE_CLOSED, notifyGuideAccess } from "@/lib/admin-guide-access";
import { useAdminGuideController, type AdminGuideControllerValue } from "./AdminGuideController";
import AdminOnboarding from "./AdminOnboarding";
import AdminGuideInvitationPanel from "./AdminGuideInvitationPanel";
import AdminGuidePhaseTransition, { type GuideTransitionKind } from "./AdminGuidePhaseTransition";
import AdminGuideDialog from "./AdminGuideDialog";
import AdminGuideRewardNotice from "./AdminGuideRewardNotice";

type GuideView = "STEPS" | "INVITATION" | GuideTransitionKind;
type Presentation = { owner: string; view: GuideView; first: boolean };
type ReadState = { scope: string; id: number; kind: "pending" | "ready" | "error" };
export default function AdminGuidePresenter() {
  const controller = useAdminGuideController();
  return controller ? <Presenter controller={controller} /> : null;
}
function Presenter({ controller }: { controller: AdminGuideControllerValue }) {
  const { scope, slug, loginId, request, openGuide, closeGuide } = controller;
  const { guide, updating, update, retry, loading, validating, error } = controller.state;
  const pathname = usePathname();
  const params = useSearchParams();
  const { replace } = useRouter();
  const manual = Boolean(scope && request?.scope === scope && request.pathname === pathname);
  const manualId = manual ? request!.id : 0;
  const owner = manual ? `${scope}:manual:${manualId}` : `${scope}:auto`;
  const [autoReady, setAutoReady] = useState("");
  const [read, setRead] = useState<ReadState | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [, setStorageVersion] = useState(0);
  const visitClosed = useRef("");
  const navigating = useRef("");
  const recorded = useRef(new Set<string>());
  const invitationOrigin = useRef<GuideTransitionKind>("CELEBRATION");
  const pendingHint = useRef("");
  const consumed = useRef("");
  const generation = useRef(0);
  const autoGeneration = useRef(0);
  const waitingAuto = useRef("");
  const waitingManual = useRef<{ scope: string; id: number; version: number } | null>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  const focusAfterRead = useRef<{ scope: string; id: number; button: HTMLButtonElement } | null>(
    null
  );
  const restoreReadFocus = useCallback((scope: string, id: number) => {
    const target = focusAfterRead.current;
    if (target?.scope === scope && target.id === id && target.button.isConnected)
      target.button.focus();
    focusAfterRead.current = null;
  }, []);
  const current = useRef({ scope, pathname, manualId, slug });
  current.current = { scope, pathname, manualId, slug };
  const query = useRef({ guide, error, loading, validating });
  query.current = { guide, error, loading, validating };
  const legacyScope =
    guide && loginId
      ? guideLoginScope(guide.tenant.id, guide.administrator.membershipId, loginId)
      : "";
  const temporary = Boolean(
    scope &&
      (isGuideTemporarilyDismissed(scope) ||
        (legacyScope && isGuideTemporarilyDismissed(legacyScope)))
  );
  const permanent = Boolean(guide?.pedagogicalState.dashboardInviteDismissedAt);

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === `guide-closed:${scope}` || event.key === `guide-closed:${legacyScope}`)
        setStorageVersion((value) => value + 1);
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [scope, legacyScope]);

  // Compatibilidade para os retornos contextuais antigos; os atalhos não usam URL.
  const requestedGroup = params?.get("grupoGuia");
  const legacyRequest = params?.get("retomarGuia") === "1";
  useEffect(() => {
    if (pathname !== "/admin/dashboard" || !legacyRequest) {
      consumed.current = "";
      return;
    }
    if (!scope) return;
    const command = `${scope}:${requestedGroup}`;
    if (consumed.current === command) return;
    consumed.current = command;
    replace("/admin/dashboard", { scroll: false });
    if (requestedGroup === slug) openGuide();
  }, [scope, slug, pathname, legacyRequest, requestedGroup, replace, openGuide]);

  useEffect(() => {
    const version = ++autoGeneration.current;
    waitingAuto.current = "";
    if (pathname !== "/admin/dashboard") {
      setAutoReady("");
      visitClosed.current = "";
      navigating.current = "";
      return;
    }
    if (!scope || legacyRequest || current.current.manualId) return;
    setAutoReady("");
    if (query.current.loading || query.current.validating) {
      waitingAuto.current = scope;
      return;
    }
    void retry()
      .then((fresh) => {
        if (
          version === autoGeneration.current &&
          current.current.scope === scope &&
          current.current.pathname === "/admin/dashboard" &&
          fresh?.tenant.slug === current.current.slug
        )
          setAutoReady(scope);
      })
      .catch(() => undefined);
  }, [scope, pathname, retry, legacyRequest]);
  useEffect(() => {
    if (
      waitingAuto.current !== scope ||
      !scope ||
      pathname !== "/admin/dashboard" ||
      loading ||
      validating
    )
      return;
    waitingAuto.current = "";
    if (guide && !error) setAutoReady(scope);
  }, [scope, pathname, loading, validating, guide, error]);

  const loadManual = useCallback(() => {
    const target = { ...current.current };
    if (!target.scope || !target.manualId) return;
    const version = ++generation.current;
    focusAfterRead.current = null;
    if (document.activeElement === retryButton.current) {
      const button = retryButton.current
        ?.closest('[role="dialog"]')
        ?.querySelector<HTMLButtonElement>('[aria-label="Fechar modal"]');
      if (button) focusAfterRead.current = { scope: target.scope, id: target.manualId, button };
    }
    const state = { scope: target.scope, id: target.manualId };
    setRead({ ...state, kind: "pending" });
    waitingManual.current = null;
    // Uma consulta já em andamento serve à abertura, sem outro mutate concorrente.
    if (query.current.loading || query.current.validating) {
      waitingManual.current = { ...state, version };
      return;
    }
    const stillOpen = () =>
      version === generation.current &&
      current.current.scope === target.scope &&
      current.current.pathname === target.pathname &&
      current.current.manualId === target.manualId;
    void retry()
      .then((fresh) => {
        if (!stillOpen()) return;
        if (!fresh && query.current.validating) {
          waitingManual.current = { ...state, version };
          return;
        }
        const valid = fresh?.tenant.slug === target.slug;
        if (valid && target.pathname === "/admin/dashboard") setAutoReady(target.scope);
        if (valid) restoreReadFocus(target.scope, target.manualId);
        setRead({ ...state, kind: valid ? "ready" : "error" });
      })
      .catch(() => {
        if (stillOpen()) setRead({ ...state, kind: "error" });
      });
  }, [retry, restoreReadFocus]);
  useEffect(() => {
    if (manualId) loadManual();
    else {
      generation.current += 1;
      waitingManual.current = null;
      setRead(null);
    }
  }, [manualId, scope, loadManual]);
  useEffect(() => {
    const waiting = waitingManual.current;
    if (!manualId || loading || validating) return;
    const waitingForThisRead =
      waiting?.scope === scope && waiting.id === manualId && waiting.version === generation.current;
    if (!waitingForThisRead) return;
    waitingManual.current = null;
    if (guide && !error) restoreReadFocus(scope, manualId);
    if (guide && !error && current.current.pathname === "/admin/dashboard") setAutoReady(scope);
    setRead({ scope, id: manualId, kind: guide && !error ? "ready" : "error" });
  }, [scope, manualId, loading, validating, guide, error, restoreReadFocus]);

  const manualConfirmed = read?.scope === scope && read.id === manualId && read.kind === "ready";
  const actionsReady = Boolean(
    guide && !error && !validating && (manual ? manualConfirmed : autoReady === scope)
  );
  const automaticallyAllowed =
    pathname === "/admin/dashboard" &&
    autoReady === scope &&
    !temporary &&
    !permanent &&
    visitClosed.current !== scope &&
    !guide?.activationProgress.complete;
  const visible = Boolean(scope && (manual || (guide && automaticallyAllowed)));
  const active = presentation?.owner === owner ? presentation : null;
  const view: GuideView = active?.view ?? "STEPS";
  const first =
    active?.first ??
    !(guide?.pedagogicalState.welcomePresentedAt || guide?.pedagogicalState.welcomeSeenAt);
  const failed =
    manual &&
    ((read?.scope === scope && read.id === manualId && read.kind === "error") ||
      (manualConfirmed && error && !validating));
  useEffect(() => {
    if (!visible || !guide) return;
    const milestoneKey = legacyScope;
    const candidate: GuideView =
      !actionsReady || guide.activationProgress.complete
        ? "STEPS"
        : guide.transition?.preparationCelebrationPending &&
            !recorded.current.has(`${milestoneKey}:CELEBRATION`)
          ? "CELEBRATION"
          : guide.transition?.footballInvitationPending &&
              !recorded.current.has(`${milestoneKey}:FOOTBALL_INVITE`)
            ? "FOOTBALL_INVITE"
            : "STEPS";
    setPresentation((previous) => {
      if (previous?.owner === owner && (previous.view !== "STEPS" || candidate === "STEPS"))
        return previous;
      return {
        owner,
        view: candidate,
        first:
          previous?.owner === owner
            ? previous.first
            : !(guide.pedagogicalState.welcomePresentedAt || guide.pedagogicalState.welcomeSeenAt),
      };
    });
  }, [visible, guide, owner, actionsReady, legacyScope]);
  useEffect(() => {
    if (!visible || !guide || !actionsReady || !active) return;
    const action =
      view === "CELEBRATION"
        ? "PREPARATION_CELEBRATED"
        : view === "FOOTBALL_INVITE"
          ? "FOOTBALL_INVITE_PRESENTED"
          : view === "STEPS" && first
            ? "WELCOME_PRESENTED"
            : null;
    const key = `${legacyScope}:${view}`;
    if (!action || recorded.current.has(key)) return;
    recorded.current.add(key);
    void update({ action });
  }, [visible, guide, actionsReady, active, view, first, legacyScope, update]);
  useEffect(() => {
    if (pendingHint.current !== scope || !scope || visible || !guide || validating || error) return;
    pendingHint.current = "";
    if (!guide.activationProgress.complete && !permanent)
      notifyGuideAccess(GUIDE_CLOSED, {
        tenantId: guide.tenant.id,
        membershipId: guide.administrator.membershipId,
      });
  }, [scope, visible, guide, validating, error, permanent]);
  useEffect(() => {
    pendingHint.current = "";
  }, [scope]);

  const close = (permanentlyDismissed = false) => {
    if (!permanentlyDismissed && scope) {
      dismissGuideForLogin(scope);
      if (legacyScope) dismissGuideForLogin(legacyScope);
    }
    visitClosed.current = scope;
    generation.current += 1;
    closeGuide();
    setPresentation(null);
    setStorageVersion((value) => value + 1);
  };
  const navigate = () => {
    navigating.current = scope;
    visitClosed.current = scope;
    generation.current += 1;
    closeGuide();
    setPresentation(null);
  };
  const steps = () => setPresentation({ owner, view: "STEPS", first });
  return (
    <>
      <AdminGuideRewardNotice
        allowPresentation={Boolean(
          pathname === "/admin/dashboard" &&
            autoReady === scope &&
            navigating.current !== scope &&
            !visible &&
            !permanent
        )}
      />
      <AdminGuideDialog
        key={scope}
        contentKey={`${owner}:${view}`}
        open={visible}
        onClose={() => close()}
        onCloseByButton={() => {
          if (view === "STEPS") pendingHint.current = scope;
        }}
      >
        {!guide ? (
          failed ? (
            <section role="alert" className="space-y-3 py-4 text-zinc-300">
              <p>Não foi possível carregar seu progresso.</p>
              <button
                ref={retryButton}
                type="button"
                onClick={loadManual}
                className="min-h-11 rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black"
              >
                Tentar novamente
              </button>
            </section>
          ) : (
            <section role="status" aria-live="polite" className="space-y-4 py-4 text-zinc-300">
              <p>Carregando seu progresso...</p>
              <div aria-hidden="true" className="animate-pulse space-y-3">
                <div className="h-2 w-2/3 rounded-full bg-white/10" />
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div className="h-2 w-4/5 rounded-full bg-white/10" />
              </div>
            </section>
          )
        ) : (
          <>
            {manual && !actionsReady && (
              <div className="mb-3 text-xs text-zinc-400" role={failed ? "alert" : "status"}>
                {failed ? (
                  <>
                    Não foi possível atualizar seu progresso.{" "}
                    <button ref={retryButton} className="min-h-11 underline" onClick={loadManual}>
                      Tentar novamente
                    </button>
                  </>
                ) : (
                  "Atualizando seu progresso..."
                )}
              </div>
            )}
            {view === "STEPS" ? (
              <AdminOnboarding
                key={owner}
                origin="dashboard"
                firstPresentation={first}
                onClose={close}
                onNavigate={navigate}
                actionsReady={actionsReady}
              />
            ) : view === "INVITATION" ? (
              <AdminGuideInvitationPanel
                guide={guide}
                updating={updating || !actionsReady}
                update={update}
                origin="dashboard"
                onNavigate={navigate}
                onBack={() =>
                  setPresentation({ owner, view: invitationOrigin.current, first: false })
                }
              />
            ) : (
              <AdminGuidePhaseTransition
                guide={guide}
                kind={view === "FOOTBALL_INVITE" ? "FOOTBALL_INVITE" : "CELEBRATION"}
                updating={updating || !actionsReady}
                onStart={() => {
                  const target = { ...current.current };
                  void update({ action: "FOOTBALL_STARTED" }).then((saved) => {
                    if (
                      saved &&
                      current.current.scope === target.scope &&
                      current.current.manualId === target.manualId &&
                      current.current.pathname === target.pathname
                    )
                      steps();
                  });
                }}
                onInvite={() => {
                  invitationOrigin.current =
                    view === "FOOTBALL_INVITE" ? "FOOTBALL_INVITE" : "CELEBRATION";
                  setPresentation({ owner, view: "INVITATION", first: false });
                }}
                onClose={steps}
              />
            )}
          </>
        )}
      </AdminGuideDialog>
    </>
  );
}
