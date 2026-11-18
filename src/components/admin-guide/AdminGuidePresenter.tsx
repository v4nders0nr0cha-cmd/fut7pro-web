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
  const router = useRouter();
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
    void retry()
      .then((fresh) => {
        if (alive && current.current === scope && fresh) setReady(scope);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [scope, pathname, retry]);
  const temporary = scope ? isGuideTemporarilyDismissed(scope) : false;
  const permanent = Boolean(guide?.pedagogicalState.dashboardInviteDismissedAt);
  const allowed = manual || manualScope === scope || (!temporary && !permanent);
  useEffect(() => {
    if (
      !guide ||
      !scope ||
      ready !== scope ||
      current.current !== scope ||
      (leaving.current === scope && !manual)
    )
      return;
    if (!manual) manualRef.current = "";
    if (manual && manualRef.current !== scope) {
      leaving.current = "";
      navigating.current = "";
      manualRef.current = scope;
      setManualScope(scope);
      router.replace("/admin/dashboard", { scroll: false });
    }
    if (!allowed || guide.activationProgress.complete) return;
    const candidate: GuideView =
      guide.transition?.preparationCelebrationPending &&
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
  }, [guide, scope, ready, allowed, manual, router]);
  const visible = Boolean(
    presentation?.scope === scope &&
      allowed &&
      ready === scope &&
      pathname === "/admin/dashboard" &&
      !guide?.activationProgress.complete
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
      <AdminGuideRewardNotice
        allowPresentation={
          pathname === "/admin/dashboard" &&
          navigating.current !== scope &&
          ready === scope &&
          (manual || manualScope === scope || !permanent)
        }
      />
      <AdminGuideDialog
        key={`${scope}:${presentation?.view}`}
        open={visible}
        onClose={() => close()}
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
