"use client";

import { useEffect, useState } from "react";
import { useAdminGuide } from "@/hooks/useAdminGuide";

import AdminOnboarding from "./AdminOnboarding";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
export default function AdminGuideCard() {
  const { guide, updating, update, actionError } = useAdminGuide();
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
      if (!sessionStorage.getItem(`onboarding-offered:${scope}`)) {
        sessionStorage.setItem(`onboarding-offered:${scope}`, "1");
        setOpenScope(scope);
        if (!guide.pedagogicalState.welcomePresentedAt)
          void update({ action: "WELCOME_PRESENTED" });
      }
    } catch {
      /* Manual access remains available when storage is unavailable. */
    }
  }, [scope, guide]);
  if (
    !guide ||
    guide.activationProgress.complete ||
    guide.pedagogicalState.dashboardInviteDismissedAt
  )
    return null;
  const open = openScope === scope;
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
      <Fut7DialogBase
        open={open}
        title="Guia Interativo Fut7Pro"
        size="xl"
        onClose={() => setOpenScope(null)}
      >
        <AdminOnboarding key={scope} onClose={() => setOpenScope(null)} />
      </Fut7DialogBase>
    </>
  );
}
