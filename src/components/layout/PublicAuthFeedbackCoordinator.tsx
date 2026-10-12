"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import AthleteRequestDecisionDialog from "@/components/layout/AthleteRequestDecisionDialog";
import PublicAuthSuccessDialog from "@/components/layout/PublicAuthSuccessDialog";
import { useGlobalProfile } from "@/hooks/useGlobalProfile";
import { getDecisionNotification } from "@/utils/account-notifications";
import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";
import { resolvePublicTenantSlug } from "@/utils/public-links";

export default function PublicAuthFeedbackCoordinator() {
  const pathname = usePathname() ?? "";
  const { data: session, status } = useSession();
  const tenantSlug = resolvePublicTenantSlug(pathname);
  const hasSession = hasUsableFut7ProSession(session, status);
  const { profile, isLoading } = useGlobalProfile({
    enabled: hasSession && Boolean(tenantSlug),
  });

  const decision = useMemo(() => {
    if (!tenantSlug) return null;
    return getDecisionNotification(profile?.accountNotifications, tenantSlug);
  }, [profile?.accountNotifications, tenantSlug]);

  const isResolvingDecision =
    status === "loading" || Boolean(hasSession && tenantSlug && isLoading);
  const hasPriorityDecision = Boolean(decision);

  return (
    <>
      <AthleteRequestDecisionDialog />
      <PublicAuthSuccessDialog
        suppress={isResolvingDecision || hasPriorityDecision}
        discard={hasPriorityDecision}
      />
    </>
  );
}
