import type { GlobalProfileResponse } from "@/types/global-profile";

export type AthleteRequestDecision = "APROVADA" | "REJEITADA";

export type AccountNotification = NonNullable<
  GlobalProfileResponse["accountNotifications"]
>[number];

export type AthleteRequestDecisionNotification = AccountNotification & {
  metadata: {
    kind: "ATHLETE_REQUEST_DECISION";
    tenantSlug: string;
    tenantName?: string | null;
    decision: AthleteRequestDecision;
    rejectionMessage?: string | null;
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function getDecisionNotification(
  notifications: GlobalProfileResponse["accountNotifications"] | undefined,
  tenantSlug?: string | null,
  decision?: AthleteRequestDecision
): AthleteRequestDecisionNotification | null {
  const slug = String(tenantSlug || "")
    .trim()
    .toLowerCase();
  if (!slug) return null;

  return (notifications?.find((notification) => {
    if (notification.readAt) return false;
    const metadata = asRecord(notification.metadata);
    const metadataTenantSlug = String(metadata?.tenantSlug || "")
      .trim()
      .toLowerCase();
    const metadataDecision = String(metadata?.decision || "")
      .trim()
      .toUpperCase();

    return (
      metadata?.kind === "ATHLETE_REQUEST_DECISION" &&
      metadataTenantSlug === slug &&
      (decision ? metadataDecision === decision : true)
    );
  }) ?? null) as AthleteRequestDecisionNotification | null;
}

export function getDecisionTenantName(
  notification: AthleteRequestDecisionNotification,
  memberships: GlobalProfileResponse["memberships"] | undefined
) {
  const metadataName = notification.metadata.tenantName?.trim();
  if (metadataName) return metadataName;

  const membership = memberships?.find(
    (item) => item.tenantSlug.toLowerCase() === notification.metadata.tenantSlug.toLowerCase()
  );
  return membership?.tenantName?.trim() || "este grupo";
}

export function getDecisionGroupReference(
  tenantName: string | null | undefined,
  mode: "membership" | "participation"
) {
  const name = tenantName?.trim();
  if (!name || name.toLowerCase() === "este grupo") {
    return mode === "participation" ? "participar deste grupo" : "deste grupo";
  }
  return mode === "participation" ? `participar do ${name}` : `do ${name}`;
}
