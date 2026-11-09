"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useAdminGuide } from "@/hooks/useAdminGuide";

export default function AdminGuideCard() {
  const { guide, updating, actionError, update } = useAdminGuide();

  // Only the server-provided membership state decides whether to show this invitation.
  if (
    !guide ||
    guide.activationProgress.complete ||
    guide.pedagogicalState.dashboardInviteDismissedAt
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Guia Fut7Pro"
      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#23272F] px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between"
      data-testid="admin-guide-invite"
    >
      <div className="flex min-w-0 items-start gap-2 sm:items-center">
        <BookOpen
          size={18}
          className="mt-0.5 shrink-0 text-yellow-300 sm:mt-0"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-200">
          {guide.pedagogicalState.welcomeSeenAt ? (
            <>
              <strong className="text-white">Continue sua jornada.</strong> Retome o Guia Fut7Pro
              quando quiser.
            </>
          ) : (
            <>
              <strong className="text-white">Começando a organizar o grupo?</strong> O Guia Fut7Pro
              pode ajudar nos primeiros passos.
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 pl-6 sm:pl-0">
        <Link
          href="/admin/guia-fut7pro"
          className="rounded-lg border border-yellow-400/40 px-3 py-1.5 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
        >
          {guide.pedagogicalState.welcomeSeenAt ? "Continuar guia" : "Conhecer o guia"}
        </Link>
        <button
          type="button"
          disabled={updating}
          onClick={() => void update({ action: "DASHBOARD_INVITE_DISMISSED" })}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 disabled:opacity-60"
        >
          Não mostrar novamente
        </button>
        {actionError && (
          <p role="alert" className="w-full text-xs text-red-300">
            Não foi possível salvar sua preferência. Tente novamente.
          </p>
        )}
      </div>
    </aside>
  );
}
