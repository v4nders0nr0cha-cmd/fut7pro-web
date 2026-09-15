"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import {
  getDecisionNotification,
  getDecisionGroupReference,
  getDecisionTenantName,
  type AthleteRequestDecisionNotification,
} from "@/utils/account-notifications";
import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";
import { resolvePublicTenantSlug } from "@/utils/public-links";

type Props = {
  onVisibilityChange?: (visible: boolean) => void;
};

async function markAccountNotificationRead(notification: AthleteRequestDecisionNotification) {
  const response = await fetch(
    `/api/perfil/account-notifications/${encodeURIComponent(notification.id)}/read`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        expectedDecision: notification.metadata.decision,
        expectedRejectionMessage: notification.metadata.rejectionMessage ?? null,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (response.status === 409 || body?.code === "DECISION_CHANGED") {
      return "changed" as const;
    }
    throw new Error("Não foi possível marcar a decisão como lida.");
  }
  return "read" as const;
}

export default function AthleteRequestDecisionDialog({ onVisibilityChange }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { data: session, status } = useSession();
  const tenantSlug = resolvePublicTenantSlug(pathname);
  const hasSession = hasUsableFut7ProSession(session, status);
  const { profile, isLoading, mutate } = useGlobalProfile({
    enabled: hasSession && Boolean(tenantSlug),
  });
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const notification = useMemo(() => {
    if (!tenantSlug) return null;
    const current = getDecisionNotification(profile?.accountNotifications, tenantSlug);
    if (!current || dismissedIds.has(current.id)) return null;
    return current;
  }, [dismissedIds, profile?.accountNotifications, tenantSlug]);

  const visible = Boolean(notification);
  const shouldSuppressAuthSuccess =
    status === "loading" || Boolean(hasSession && tenantSlug && (isLoading || visible));
  useEffect(() => {
    onVisibilityChange?.(shouldSuppressAuthSuccess);
  }, [onVisibilityChange, shouldSuppressAuthSuccess]);

  const acknowledge = useCallback(
    async (targetHref?: string) => {
      if (!notification) return;
      setIsAcknowledging(true);
      try {
        const result = await markAccountNotificationRead(notification);
        await mutate();
        if (result === "changed") {
          return;
        }
        setDismissedIds((prev) => new Set(prev).add(notification.id));
      } catch {
        // Mantem readAt como fonte de verdade; se falhar, a decisao pode reaparecer depois.
        setDismissedIds((prev) => new Set(prev).add(notification.id));
      } finally {
        setIsAcknowledging(false);
        if (targetHref) {
          router.push(targetHref);
        }
      }
    },
    [mutate, notification, router]
  );

  if (!notification || !tenantSlug) return null;

  const tenantName = getDecisionTenantName(notification, profile?.memberships);
  const isApproved = notification.metadata.decision === "APROVADA";

  return (
    <DecisionDialogContent
      disabled={isAcknowledging}
      isApproved={isApproved}
      notification={notification}
      tenantName={tenantName}
      onClose={() => acknowledge()}
      onPrimary={() => acknowledge(isApproved ? `/${tenantSlug}/perfil` : `/${tenantSlug}`)}
      onSecondary={() => acknowledge(isApproved ? `/${tenantSlug}` : "/perfil")}
    />
  );
}

function DecisionDialogContent({
  disabled,
  isApproved,
  notification,
  tenantName,
  onClose,
  onPrimary,
  onSecondary,
}: {
  disabled: boolean;
  isApproved: boolean;
  notification: AthleteRequestDecisionNotification;
  tenantName: string;
  onClose: () => void;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const rejectionMessage = notification.metadata.rejectionMessage?.trim();
  const membershipReference = getDecisionGroupReference(tenantName, "membership");
  const participationReference = getDecisionGroupReference(tenantName, "participation");

  return (
    <Fut7DialogBase
      open
      eyebrow={isApproved ? "Acesso ao grupo liberado" : "Atualização da solicitação"}
      title={isApproved ? "Entrada aprovada!" : "Solicitação não aprovada"}
      tone={isApproved ? "success" : "warning"}
      icon={isApproved ? <CheckCircle2 size={25} /> : <AlertTriangle size={25} />}
      onClose={onClose}
      description={
        isApproved ? (
          <>
            <p>O administrador aprovou sua solicitação.</p>
            <p className="mt-2">Agora você faz parte {membershipReference}.</p>
            <p className="mt-2">
              Seu desempenho e os recursos disponíveis para atletas neste grupo já estão liberados.
            </p>
          </>
        ) : (
          <>
            <p>Sua solicitação para {participationReference} não foi aprovada.</p>
            <p className="mt-2">Sua Conta Fut7Pro continua ativa normalmente.</p>
            {rejectionMessage ? (
              <p className="mt-2">
                <strong>Motivo informado:</strong> {rejectionMessage}
              </p>
            ) : null}
          </>
        )
      }
      footer={
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={onSecondary}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-emerald-300/45 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isApproved ? "Continuar no grupo" : "Minha conta Fut7Pro"}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onPrimary}
            className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-black shadow-[0_14px_34px_rgba(250,204,21,0.22)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isApproved ? "Acompanhar meu desempenho" : "Continuar no site do grupo"}
          </button>
        </>
      }
    />
  );
}
