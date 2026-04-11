export type AccessCompensationScopeType = "SINGLE" | "MULTIPLE" | "GLOBAL";

export type AccessCompensationType = "INCIDENT" | "COURTESY" | "BILLING_FIX" | "MANUAL_ADJUSTMENT";

export type AccessCompensationReasonCategory =
  | "SYSTEM_UNAVAILABILITY"
  | "LOGIN_FAILURE"
  | "BILLING_ERROR"
  | "CRITICAL_BUG"
  | "EXTRAORDINARY_MAINTENANCE"
  | "COMMERCIAL_COURTESY"
  | "OTHER";

export type AccessCompensationStatus = "APPLIED" | "REVERTED";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "paused"
  | "expired";

export type AccessCompensationFilters = {
  statuses?: SubscriptionStatus[];
  planKeys?: string[];
  onlyActive?: boolean;
  onlyPaid?: boolean;
  onlyTrial?: boolean;
  onlyExpiredRecently?: boolean;
  expiredRecentlyDays?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  incidentCode?: string;
  search?: string;
};

export type PreviewAccessCompensationPayload = {
  scopeType: AccessCompensationScopeType;
  tenantId?: string;
  tenantIds?: string[];
  filters?: AccessCompensationFilters;
  days: number;
};

export type ApplyAccessCompensationPayload = PreviewAccessCompensationPayload & {
  clientRequestId: string;
  type: AccessCompensationType;
  reasonCategory: AccessCompensationReasonCategory;
  reasonDescription: string;
  incidentCode?: string;
  notifyCustomer?: boolean;
  confirmationText?: string;
};

export type RevertAccessCompensationPayload = {
  reasonDescription: string;
  notifyCustomer?: boolean;
  confirmationText?: string;
};

export type AccessCompensationSummaryResponse = {
  overview: {
    activeTenants: number;
    trialTenants: number;
    paidTenants: number;
    expiredTenants: number;
    adjustmentsLast30Days: number;
    daysGrantedLast30Days: number;
    tenantsCompensatedLast30Days: number;
  };
  safety: {
    maxDaysPerOperation: number;
    massConfirmationKeyword: string;
    typedConfirmationThreshold: number;
  };
  generatedAt: string;
};

export type AccessCompensationPreviewRow = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  planKey: string;
  subscriptionStatus: SubscriptionStatus;
  currentAccessUntil: string | null;
  newAccessUntil: string;
  daysGranted: number;
  isExpiredNow: boolean;
};

export type AccessCompensationPreviewResponse = {
  scopeType: AccessCompensationScopeType;
  generatedAt: string;
  filters: AccessCompensationFilters | null;
  totals: {
    tenants: number;
    totalDaysDistributed: number;
    activeNow: number;
    expiredNow: number;
  };
  safety: {
    requiresTypedConfirmation: boolean;
    massConfirmationKeyword: string | null;
  };
  rows: AccessCompensationPreviewRow[];
};

export type AccessCompensationApplyResponse = {
  ok: boolean;
  batchOperationId: string;
  scopeType: AccessCompensationScopeType;
  totalTenantsAffected: number;
  totalDaysDistributed: number;
  idempotentReplay: boolean;
  clientRequestId: string | null;
  requiresTypedConfirmation: boolean;
  notificationRequested: boolean;
  notificationFailures: number;
  appliedAt: string;
  rows: Array<{
    adjustmentId: string;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    previousAccessUntil: string | null;
    newAccessUntil: string;
    previousStatus: SubscriptionStatus;
    nextStatus: SubscriptionStatus;
  }>;
};

export type AccessCompensationHistoryItem = {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  days: number;
  type: AccessCompensationType;
  reasonCategory: AccessCompensationReasonCategory;
  reasonDescription: string;
  incidentCode: string | null;
  notifyCustomer: boolean;
  previousAccessUntil: string | null;
  newAccessUntil: string | null;
  status: AccessCompensationStatus;
  appliedAt: string;
  appliedBy: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;
  revertedAt: string | null;
  revertedBy: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;
  revertReason: string | null;
  batch: {
    id: string;
    scopeType: AccessCompensationScopeType;
    totalTenantsAffected: number;
    createdAt: string;
  } | null;
};

export type AccessCompensationHistoryResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: AccessCompensationHistoryItem[];
};
