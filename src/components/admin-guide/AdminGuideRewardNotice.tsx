"use client";
import { useEffect, useRef, useState } from "react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { notifyBillingChanged } from "@/lib/billing-events";
import AdminGuideDialog from "./AdminGuideDialog";

export default function AdminGuideRewardNotice({
  allowPresentation,
}: {
  allowPresentation?: boolean;
}) {
  const { guide, update, updating } = useAdminGuide();
  const attempted = useRef("");
  const recorded = useRef(new Set<string>());
  const alive = useRef(true);
  const currentScope = useRef("");
  const [openScope, setOpenScope] = useState("");
  const [closedScope, setClosedScope] = useState("");
  const [failedScope, setFailedScope] = useState("");
  const [retry, setRetry] = useState(0);
  const presentationAllowed =
    allowPresentation ?? !guide?.pedagogicalState.dashboardInviteDismissedAt;
  const scope = guide ? `${guide.tenant.id}:${guide.administrator.membershipId}` : "";
  currentScope.current = scope;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!guide?.activationProgress.complete || !scope) return;
    const claimKey = `${scope}:${retry}`;
    if (guide.reward?.eligible && !guide.reward.granted && attempted.current !== claimKey) {
      attempted.current = claimKey;
      void update({ action: "REWARD_CLAIM" }).then((saved) => {
        if (!alive.current || currentScope.current !== scope) return;
        if (saved) notifyBillingChanged({ tenantId: guide.tenant.id, slug: guide.tenant.slug });
        else setFailedScope(scope);
      });
      return;
    }
    if (guide.reward?.eligible && !guide.reward.granted && failedScope !== scope) return;
    const unseenCompletion =
      !guide.pedagogicalState.completionPresentedAt && !guide.pedagogicalState.rewardPresentedAt;
    const unseenReward = guide.reward?.granted && !guide.pedagogicalState.rewardPresentedAt;
    if (presentationAllowed && closedScope !== scope && (unseenCompletion || unseenReward))
      setOpenScope(scope);
  }, [guide, scope, update, retry, presentationAllowed, closedScope, failedScope]);
  useEffect(() => {
    if (!presentationAllowed) setOpenScope("");
  }, [presentationAllowed]);
  const open = Boolean(presentationAllowed && openScope && openScope === scope);
  const confirmed = guide?.reward?.granted;
  // Persist the completion/reward presentation only after its visible DOM commit.
  useEffect(() => {
    if (!open || !guide) return;
    const action = confirmed ? "REWARD_PRESENTED" : "COMPLETION_PRESENTED";
    const key = `${scope}:${action}`;
    if (recorded.current.has(key)) return;
    recorded.current.add(key);
    void update({ action });
  }, [open, guide, confirmed, scope, update]);
  if (!guide) return null;
  const failed = Boolean(failedScope && failedScope === scope);
  const close = () => {
    setOpenScope("");
    setClosedScope(scope);
  };
  return (
    <AdminGuideDialog key={confirmed ? "reward" : "completion"} open={open} onClose={close}>
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
              onClick={close}
            >
              Continuar aproveitando o Fut7Pro
            </button>
          </>
        ) : (
          <>
            <p>
              Parabéns! Você concluiu as oito etapas do Guia Interativo e publicou seu primeiro Time
              Campeão do Dia.
            </p>
            <p className="text-zinc-300">
              Continue organizando sua pelada, acompanhando os atletas e celebrando as próximas
              conquistas. O guia continua disponível no seu perfil.
            </p>
            {failed && (
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
            <button
              className="min-h-11 rounded-lg border border-white/20 px-4 py-3"
              onClick={close}
            >
              Continuar aproveitando o Fut7Pro
            </button>
          </>
        )}
      </section>
    </AdminGuideDialog>
  );
}
