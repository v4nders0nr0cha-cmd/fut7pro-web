"use client";
import { useEffect, useRef, useState } from "react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { notifyBillingChanged } from "@/lib/billing-events";
import AdminGuideDialog from "./AdminGuideDialog";

export default function AdminGuideRewardNotice() {
  const { guide, update, updating } = useAdminGuide();
  const attempted = useRef("");
  const alive = useRef(true);
  const dismissed = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [openScope, setOpenScope] = useState("");
  const [failedScope, setFailedScope] = useState("");
  const currentScope = useRef("");
  const scope = guide ? `${guide.tenant.id}:${guide.administrator.membershipId}` : "";
  currentScope.current = scope;
  dismissed.current = Boolean(guide?.pedagogicalState.dashboardInviteDismissedAt);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!guide?.activationProgress.complete || !guide.reward || !scope) return;
    if (!guide.reward.granted && !guide.reward.eligible) return;
    if (
      guide.reward.granted &&
      (guide.pedagogicalState.rewardPresentedAt ||
        guide.pedagogicalState.dashboardInviteDismissedAt)
    )
      return;
    const key = `${scope}:${guide.reward.granted}:${retry}`;
    if (attempted.current === key) return;
    attempted.current = key;
    void (async () => {
      if (!guide.reward!.granted) {
        const saved = await update({ action: "REWARD_CLAIM" });
        if (saved && alive.current && currentScope.current === scope)
          notifyBillingChanged({ tenantId: guide.tenant.id, slug: guide.tenant.slug });
        if (
          !saved &&
          alive.current &&
          currentScope.current === scope &&
          !guide.pedagogicalState.dashboardInviteDismissedAt
        )
          setFailedScope(scope);
        return; // Revalidation supplies the authoritative, granted state.
      }
      if (await update({ action: "REWARD_PRESENTED" })) {
        if (alive.current && currentScope.current === scope) {
          setFailedScope("");
          if (!dismissed.current) setOpenScope(scope);
        }
      }
    })();
  }, [guide, scope, update, retry]);
  if (!guide) return null;
  const confirmed = guide.reward?.granted;
  const failed = Boolean(failedScope && failedScope === scope);
  return (
    <AdminGuideDialog
      open={Boolean((openScope && openScope === scope) || failed)}
      onClose={() => {
        setOpenScope("");
        setFailedScope("");
      }}
    >
      <section className="space-y-5 text-white" aria-labelledby="guide-reward-title">
        <h2 id="guide-reward-title" className="text-2xl font-bold">
          {confirmed ? "Você entrou para o jogo! 🏆" : "Guia concluído!"}
        </h2>
        {confirmed ? (
          <>
            <p>
              Parabéns! Você concluiu o Guia Interativo Fut7Pro e publicou seu primeiro Time Campeão
              do Dia!
            </p>
            <p className="text-zinc-300">
              Organizar o futebol entre amigos exige dedicação, e queremos reconhecer todo esse
              esforço. Por isso, seu grupo recebeu mais dez dias para aproveitar o Fut7Pro!
            </p>
            <p className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-center text-2xl font-extrabold text-yellow-300">
              +10 DIAS DE FUT7PRO
            </p>
            {guide.reward?.trialEnd && (
              <p>
                Seu teste agora termina em{" "}
                {new Date(guide.reward.trialEnd).toLocaleDateString("pt-BR", {
                  timeZone: "America/Fortaleza",
                })}
                .
              </p>
            )}
            <p className="text-zinc-300">
              Conte com a gente para continuar organizando sua pelada, acompanhando os atletas e
              celebrando as próximas conquistas!
            </p>
            <button
              className="min-h-11 rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black"
              onClick={() => setOpenScope("")}
            >
              Continuar aproveitando o Fut7Pro
            </button>
          </>
        ) : (
          <>
            <p role="alert">
              Não foi possível confirmar o benefício agora. Seu progresso está salvo. Tente
              novamente para consultar a concessão com segurança.
            </p>
            <button
              disabled={updating}
              className="min-h-11 rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black"
              onClick={() => {
                setFailedScope("");
                setRetry((value) => value + 1);
              }}
            >
              Tentar novamente
            </button>
          </>
        )}
      </section>
    </AdminGuideDialog>
  );
}
