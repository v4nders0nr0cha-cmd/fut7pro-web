"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAdminGuide } from "@/hooks/useAdminGuide";

import AdminOnboarding from "./AdminOnboarding";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
export default function AdminGuideCard() {
  const { guide, updating, update, actionError } = useAdminGuide();
  const { data: session } = useSession();
  const loginId = (session?.user as { onboardingLoginId?: string } | undefined)?.onboardingLoginId;
  const [openScope, setOpenScope] = useState<string | null>(null);
  const scope = guide ? `${guide.tenant.id}:${guide.administrator.membershipId}` : "";
  useEffect(() => {
    if (
      !scope ||
      !guide ||
      guide.activationProgress.complete ||
      guide.pedagogicalState.dashboardInviteDismissedAt
    )
      return;
    try {
      if (loginId && sessionStorage.getItem(`onboarding-offered:${scope}`) !== loginId) {
        sessionStorage.setItem(`onboarding-offered:${scope}`, loginId);
        setOpenScope(scope);
      }
    } catch {
      /* Manual access remains available when storage is unavailable. */
    }
  }, [scope, guide, loginId, update]);
  if (
    !guide ||
    guide.activationProgress.complete ||
    guide.pedagogicalState.dashboardInviteDismissedAt
  )
    return null;
  const open = openScope === scope;
  const close = (permanentlyDismissed = false) => {
    setOpenScope(null);
    if (!permanentlyDismissed && !guide.pedagogicalState.welcomePresentedAt)
      void update({ action: "WELCOME_PRESENTED" });
  };
  return (
    <>
      {!open && (
        <aside
          aria-label="Guia Fut7Pro"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#23272F] p-4 text-white"
        >
          <p className="text-sm">
            {guide.activationProgress.completed} de {guide.activationProgress.total} primeiros
            passos concluídos.
          </p>
          <button
            onClick={() => setOpenScope(scope)}
            className="min-h-11 rounded-lg border border-yellow-400/40 px-4 text-yellow-200"
          >
            {guide.pedagogicalState.welcomeSeenAt ? "Continuar guia" : "Conhecer o guia"}
          </button>
          <button
            disabled={updating}
            onClick={() => void update({ action: "DASHBOARD_INVITE_DISMISSED" })}
            className="min-h-11 text-sm text-zinc-300"
          >
            Não mostrar novamente
          </button>
          {actionError && <p role="alert">Não foi possível salvar sua preferência.</p>}
        </aside>
      )}
      <Fut7DialogBase open={open} title="Guia Interativo Fut7Pro" size="xl" onClose={() => close()}>
        <AdminOnboarding key={scope} onClose={close} />
      </Fut7DialogBase>
    </>
  );
}
