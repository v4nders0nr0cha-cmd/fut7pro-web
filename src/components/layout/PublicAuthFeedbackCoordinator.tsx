"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import AthleteRequestDecisionDialog from "@/components/layout/AthleteRequestDecisionDialog";
import PublicAuthSuccessDialog from "@/components/layout/PublicAuthSuccessDialog";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import { getDecisionNotification } from "@/utils/account-notifications";
import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";
import { discardPublicAuthSuccessFeedback } from "@/utils/public-auth-feedback";
import { resolvePublicTenantSlug } from "@/utils/public-links";

export default function PublicAuthFeedbackCoordinator() {
  const pathname = usePathname() ?? "";
  const { data: session, status } = useSession();
  const tenantSlug = resolvePublicTenantSlug(pathname);
  const hasSession = hasUsableFut7ProSession(session, status);
  const { profile, isLoading, isError, mutate } = useGlobalProfile({
    enabled: hasSession && Boolean(tenantSlug),
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissedRecoveryForSlug, setDismissedRecoveryForSlug] = useState<string | null>(null);

  const decision = useMemo(() => {
    if (!tenantSlug) return null;
    return getDecisionNotification(profile?.accountNotifications, tenantSlug);
  }, [profile?.accountNotifications, tenantSlug]);

  const isResolvingDecision =
    status === "loading" || Boolean(hasSession && tenantSlug && (isLoading || !profile));
  const hasPriorityDecision = Boolean(decision);
  const showRecovery = Boolean(
    hasSession && tenantSlug && !profile && isError && dismissedRecoveryForSlug !== tenantSlug
  );

  const retryProfile = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await mutate();
    } catch {
      // O SWR preserva o erro e mantem este dialogo disponivel para nova tentativa.
    } finally {
      setIsRetrying(false);
    }
  };

  const dismissRecovery = () => {
    discardPublicAuthSuccessFeedback();
    setDismissedRecoveryForSlug(tenantSlug);
  };

  return (
    <>
      <AthleteRequestDecisionDialog />
      <PublicAuthSuccessDialog
        suppress={isResolvingDecision || hasPriorityDecision}
        discard={hasPriorityDecision}
      />
      <Fut7DialogBase
        open={showRecovery}
        title="Não foi possível verificar suas notificações"
        description="Seu acesso continua ativo. Tente novamente para confirmarmos se existe algum aviso prioritário antes de mostrar a confirmação do login."
        eyebrow="Verificação pendente"
        tone="warning"
        onClose={dismissRecovery}
        footer={
          <button
            type="button"
            onClick={() => void retryProfile()}
            disabled={isRetrying}
            className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black shadow-[0_14px_34px_rgba(250,204,21,0.22)] transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#111214] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRetrying ? "Verificando..." : "Tentar novamente"}
          </button>
        }
      />
    </>
  );
}
