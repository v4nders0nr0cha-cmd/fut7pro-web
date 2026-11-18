"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import {
  guideLoginScope,
  isGuideTemporarilyDismissed,
  dismissGuideForLogin,
} from "@/lib/admin-guide-presentation";
import { GUIDE_CLOSED, notifyGuideAccess } from "@/lib/admin-guide-access";
import AdminOnboarding from "./AdminOnboarding";
import AdminGuideInvitationPanel from "./AdminGuideInvitationPanel";
import AdminGuidePhaseTransition, { type GuideTransitionKind } from "./AdminGuidePhaseTransition";
import AdminGuideDialog from "./AdminGuideDialog";
import AdminGuideRewardNotice from "./AdminGuideRewardNotice";

type GuideView = "STEPS" | "INVITATION" | GuideTransitionKind;
type Presentation = { scope: string; view: GuideView; first: boolean };
export default function AdminGuidePresenter() {
  const { guide, updating, update, retry } = useAdminGuide();
  const { data: session } = useSession();
  const pathname = usePathname();
  const params = useSearchParams();
  const { replace } = useRouter();
  const loginId = (session?.user as { onboardingLoginId?: string } | undefined)?.onboardingLoginId;
  const scope =
    guide && loginId
      ? guideLoginScope(guide.tenant.id, guide.administrator.membershipId, loginId)
      : "";
  const current = useRef(scope);
  current.current = pathname === "/admin/dashboard" ? scope : "";
  const [, setStorageVersion] = useState(0);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === `guide-closed:${scope}`) setStorageVersion((value) => value + 1);
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [scope]);
  const [ready, setReady] = useState("");
  const [manualError, setManualError] = useState("");
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [manualScope, setManualScope] = useState("");
  const leaving = useRef("");
  const navigating = useRef("");
  const recorded = useRef(new Set<string>());
  const invitationOrigin = useRef<GuideTransitionKind>("CELEBRATION");
  const manual = Boolean(
    scope && params?.get("retomarGuia") === "1" && params?.get("grupoGuia") === guide?.tenant.slug
  );
  const manualRef = useRef("");
  const requestedGroup = params?.get("grupoGuia");
  const requestedManually = params?.get("retomarGuia") === "1";
  useEffect(() => {
    if (
      scope &&
      pathname === "/admin/dashboard" &&
      requestedManually &&
      requestedGroup !== guide?.tenant.slug
    )
      replace("/admin/dashboard", { scroll: false });
  }, [scope, pathname, requestedManually, requestedGroup, guide?.tenant.slug, replace]);
  const entryManual = useRef(manual);
  entryManual.current = manual;
  // Every Dashboard entry reads current persisted operations before offering the guide.
  useEffect(() => {
    if (pathname !== "/admin/dashboard") {
      setReady("");
      setPresentation(null);
      setManualScope("");
      manualRef.current = "";
      leaving.current = "";
      navigating.current = "";
      return;
    }
    if (!scope) return;
    let alive = true;
    const manuallyRequested = entryManual.current;
    if (manuallyRequested) manualRef.current = scope;
    void retry()
      .then((fresh) => {
        if (alive && current.current === scope && fresh) {
          if (manuallyRequested) {
            manualRef.current = scope;
            leaving.current = "";
            navigating.current = "";
            setManualScope(scope);
            setManualError("");
            replace("/admin/dashboard", { scroll: false });
          }
          setReady(scope);
        } else if (alive && current.current === scope && manuallyRequested) {
          setManualError(scope);
          replace("/admin/dashboard", { scroll: false });
        }
      })
      .catch(() => {
        if (alive && current.current === scope && manuallyRequested) {
          setManualError(scope);
          replace("/admin/dashboard", { scroll: false });
        }
      });
    return () => {
      alive = false;
    };
  }, [scope, pathname, retry, replace]);
  const temporary = scope ? isGuideTemporarilyDismissed(scope) : false;
  const permanent = Boolean(guide?.pedagogicalState.dashboardInviteDismissedAt);
  const allowed = manual || manualScope === scope || (!temporary && !permanent);
  useEffect(() => {
    if (!guide || !scope || current.current !== scope) return;
    if (!manual) manualRef.current = "";
    if (manual && manualRef.current !== scope) {
      manualRef.current = scope;
      setReady("");
      setManualError("");
      void retry()
        .then((fresh) => {
          if (current.current !== scope) return;
          if (fresh) {
            leaving.current = "";
            navigating.current = "";
            setPresentation(null);
            setManualScope(scope);
            setReady(scope);
          } else setManualError(scope);
          replace("/admin/dashboard", { scroll: false });
        })
        .catch(() => {
          if (current.current !== scope) return;
          setManualError(scope);
          replace("/admin/dashboard", { scroll: false });
        });
      return;
    }
    if (ready !== scope || (leaving.current === scope && !manual)) return;
    if (!allowed || (guide.activationProgress.complete && manualScope !== scope && !manual)) return;
    const candidate: GuideView = guide.activationProgress.complete
      ? "STEPS"
      : guide.transition?.preparationCelebrationPending &&
          !recorded.current.has(`${scope}:CELEBRATION`)
        ? "CELEBRATION"
        : guide.transition?.footballInvitationPending &&
            !recorded.current.has(`${scope}:FOOTBALL_INVITE`)
          ? "FOOTBALL_INVITE"
          : "STEPS";
    setPresentation((previous) => {
      if (previous?.scope === scope) {
        // New milestones may supersede normal steps; saving their marker must not
        // immediately replace their visible celebration with the next candidate.
        if (previous.view !== "STEPS" || candidate === "STEPS") return previous;
      }
      return {
        scope,
        view: candidate,
        first: !guide.pedagogicalState.welcomePresentedAt && !guide.pedagogicalState.welcomeSeenAt,
      };
    });
  }, [guide, scope, ready, allowed, manual, manualScope, replace, retry]);
  const visible = Boolean(
    presentation?.scope === scope &&
      allowed &&
      ready === scope &&
      pathname === "/admin/dashboard" &&
      (!guide?.activationProgress.complete || manualScope === scope)
  );
  // These effects run only after the corresponding dialog has committed to the DOM.
  useEffect(() => {
    if (!visible || !presentation || !guide) return;
    const view = presentation.view;
    const action =
      view === "CELEBRATION"
        ? "PREPARATION_CELEBRATED"
        : view === "FOOTBALL_INVITE"
          ? "FOOTBALL_INVITE_PRESENTED"
          : view === "STEPS" && presentation.first
            ? "WELCOME_PRESENTED"
            : null;
    const key = `${scope}:${view}`;
    if (!action || recorded.current.has(key)) return;
    recorded.current.add(key);
    void update({ action });
  }, [visible, presentation, guide, scope, update]);
  if (!guide || !scope) return null;
  const close = (permanentlyDismissed = false) => {
    if (!permanentlyDismissed) dismissGuideForLogin(scope);
    leaving.current = scope;
    setPresentation(null);
    setManualScope("");
  };
  const navigate = () => {
    navigating.current = scope;
    leaving.current = scope;
    setPresentation(null);
  };
  const steps = () =>
    setPresentation({
      scope,
      view: "STEPS",
      first: !guide.pedagogicalState.welcomePresentedAt && !guide.pedagogicalState.welcomeSeenAt,
    });
  return (
    <>
      {manualError === scope && pathname === "/admin/dashboard" && (
        <p role="status" className="text-sm text-zinc-300">
          Não foi possível abrir o guia. Tente novamente pelo acesso de ajuda.
        </p>
      )}
      <AdminGuideRewardNotice
        allowPresentation={
          pathname === "/admin/dashboard" &&
          navigating.current !== scope &&
          ready === scope &&
          !visible &&
          (manual || manualScope === scope || !permanent)
        }
      />
      <AdminGuideDialog
        key={`${scope}:${presentation?.view}`}
        open={visible}
        onClose={() => close()}
        onCloseByButton={() => {
          if (presentation?.view === "STEPS" && !guide.activationProgress.complete && !permanent)
            notifyGuideAccess(GUIDE_CLOSED, {
              tenantId: guide.tenant.id,
              membershipId: guide.administrator.membershipId,
            });
        }}
      >
        {presentation?.view === "STEPS" ? (
          <AdminOnboarding
            key={scope}
            origin="dashboard"
            firstPresentation={presentation.first}
            onClose={close}
            onNavigate={navigate}
          />
        ) : presentation?.view === "INVITATION" ? (
          <AdminGuideInvitationPanel
            guide={guide}
            updating={updating}
            update={update}
            origin="dashboard"
            onNavigate={navigate}
            onBack={() => setPresentation({ scope, view: invitationOrigin.current, first: false })}
          />
        ) : (
          <AdminGuidePhaseTransition
            guide={guide}
            kind={presentation?.view === "FOOTBALL_INVITE" ? "FOOTBALL_INVITE" : "CELEBRATION"}
            updating={updating}
            onStart={() =>
              void update({ action: "FOOTBALL_STARTED" }).then((saved) => {
                if (saved && current.current === scope) steps();
              })
            }
            onInvite={() => {
              invitationOrigin.current =
                presentation?.view === "FOOTBALL_INVITE" ? "FOOTBALL_INVITE" : "CELEBRATION";
              setPresentation({ scope, view: "INVITATION", first: false });
            }}
            onClose={steps}
          />
        )}
      </AdminGuideDialog>
    </>
  );
}
