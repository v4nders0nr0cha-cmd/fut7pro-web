"use client";

import AdminGuidePreparationNotice from "@/components/admin-guide/AdminGuidePreparationNotice";
import AdminOnboarding from "@/components/admin-guide/AdminOnboarding";
import AdminGuideFirstMatchSection from "@/components/admin-guide/AdminGuideFirstMatchSection";
import AdminGuideResourcesSection from "@/components/admin-guide/AdminGuideResourcesSection";
import { isOnboardingActionUnlocked } from "@/lib/admin-onboarding";
import { useAdminGuide } from "@/hooks/useAdminGuide";
export default function AdminGuideClient() {
  const { guide, loading, retry, update, updating } = useAdminGuide();
  return (
    <main className="min-w-0 px-4 pb-24 pt-20 text-white md:p-7">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">Guia Interativo Fut7Pro</h1>
        {loading ? (
          <p role="status">Carregando seu guia...</p>
        ) : !guide ? (
          <section>
            <p>
              Não foi possível carregar o guia deste grupo. Confira sua sessão e suas permissões.
            </p>
            <button onClick={() => void retry()} className="mt-3 min-h-11 text-yellow-300">
              Tentar novamente
            </button>
          </section>
        ) : (
          <>
            <AdminGuidePreparationNotice />
            <AdminOnboarding
              key={`${guide.administrator.membershipId}:${guide.pedagogicalState.footballStartedAt ?? ""}`}
            />
            <details className="rounded-xl border border-white/15 p-4">
              <summary className="cursor-pointer font-semibold">
                Organização dos jogos e outros recursos
              </summary>
              <div className="mt-4 space-y-6">
                {isOnboardingActionUnlocked(
                  guide.tasks,
                  "FIRST_MATCHDAY",
                  guide.actionAvailability
                ) ? (
                  <AdminGuideFirstMatchSection guide={guide} updating={updating} update={update} />
                ) : (
                  <p className="text-sm text-zinc-300">
                    Conclua as etapas anteriores para liberar a organização dos jogos pelo guia.
                  </p>
                )}
                <AdminGuideResourcesSection guide={guide} updating={updating} update={update} />
              </div>
            </details>
          </>
        )}
      </div>
    </main>
  );
}
