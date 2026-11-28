import { BillingApiError, type SubscriptionAccess, type FinancialStatus } from "./billing";

export interface Capabilities {
  canViewHistory: boolean;
  canReconcilePayments?: boolean;
  paymentConfirmationPending?: boolean;
  canPay: boolean;
  canUseRecurring: boolean;
  canUsePix: boolean;
  canCreateSubscription: boolean;
  canStartEnterprise: boolean;
  canChangePlan: boolean;
  canApplyCoupon: boolean;
  canCancel: boolean;
  changePlanRequiresSupport: boolean;
  operationPending: boolean;
}
export type CapabilityResponse = {
  tenantId: string;
  subscriptionId: string | null;
  capabilities: Capabilities;
};
export type Coverage = {
  recordedFrom: string | null;
  earlierEventsUnavailable: boolean;
  reconstructed: false;
};
export type Page<T> = {
  items: T[];
  page: { limit: number; hasMore: boolean; nextCursor: string | null };
  coverage?: Coverage;
};
export interface Overview {
  subscription: {
    id: string;
    tenantId: string;
    planKey: string;
    interval: string;
    amountCents: number;
    status: string;
    createdAt: string;
    trialEnd: string | null;
    currentPeriodEnd: string | null;
    firstPaymentAt?: string | null;
    periodIsProspective?: boolean;
  };
  access: SubscriptionAccess;
  financialStatus: FinancialStatus;
  historyAvailable: boolean;
  coverage?: Coverage;
  invoices?: {
    pending: number;
    confirmed: number;
    pixAttempts?: number;
    pixExpired?: number;
    pixCanceled?: number;
    confirmationPending?: number;
    overdueConfirmed?: number;
    assessmentComplete?: boolean;
    attemptsAreNotDebt?: boolean;
  };
  activeAccessBenefit?: {
    source: string;
    days: number | null;
    reasonCategory: string;
    customerReason: string;
    appliedAt: string | null;
    newAccessUntil: string;
  } | null;
}
export type InvoicePresentation = {
  pix: boolean;
  code: string;
  label: string;
  expiresAt: string | null;
  providerStatusDetail: string | null;
  needsReconciliation: boolean;
  overdueConfirmed: boolean;
};
export interface InvoiceRecord {
  id: string;
  type: "UPFRONT" | "RECURRING";
  createdAt: string;
  status: string;
  providerStatus: string | null;
  presentation?: InvoicePresentation;
  chargedAmountCents: number;
  paidAmountCents: number | null;
  refundedAmountCents: number | null;
  confirmedDiscountAmountCents: number | null;
  currency: string | null;
  paymentConfirmedAt: string | null;
  paymentMethod: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  commercialSnapshot: {
    basis?: string;
    planKey?: string | null;
    interval?: string | null;
    baseAmountCents?: number | null;
    discountAmountCents?: number | null;
    couponCode?: string | null;
  } | null;
  historicalTermsAvailable: boolean;
  receipt: null;
  receiptAvailability: "NOT_RECORDED";
}
export interface BenefitRecord {
  id: string;
  source: "GUIDE_REWARD" | "ADMIN_ADJUSTMENT";
  days: number;
  customerReason: string;
  reasonCategory: string;
  type: string;
  appliedAt: string;
  previousAccessUntil: string | null;
  newAccessUntil: string | null;
  grantStatus: "APPLIED" | "REVERTED";
  revertedAt: string | null;
  validity: "APPLIED" | "EXPIRED" | "REVERTED" | "UNAVAILABLE";
}
export type BenefitSummary = {
  initialTrial: {
    evidence: string;
    start: string | null;
    originalDays: number | null;
    originalEnd: string | null;
    originalPlanKey: string | null;
  };
  currentCouponTerms: {
    code: string;
    state: string;
    offeredExtraDays: number | null;
    grantedDays: null;
    discountPct: number | null;
    recurringAmountCents: number | null;
    appliesToRecurring: boolean;
    message: string;
  } | null;
};
export interface HistoryEvent {
  id: string;
  category: string;
  eventType: string;
  occurredAt: string;
  recordedAt: string;
  source: { type: string; id: string };
  facts: {
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown>;
    grantedDays?: number | null;
  };
}
export type HistoryFilters = {
  limit?: number;
  cursor?: string | null;
  status?: string;
  from?: string;
  to?: string;
  category?: string;
  eventType?: string;
  kind?: "adjustments" | "coupons";
};

export async function centralRequest<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/admin/billing/${path}`, { cache: "no-store", signal });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new BillingApiError(
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : "Não foi possível consultar a assinatura. Tente novamente.",
      response.status,
      data
    );
  return data as T;
}
export function historyRequest<T>(
  id: string,
  area: string,
  filters: HistoryFilters = {},
  signal?: AbortSignal
) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  return centralRequest<T>(
    `subscription/${encodeURIComponent(id)}/${area}${query.size ? `?${query}` : ""}`,
    signal
  );
}

export async function reconcileInvoice(subscriptionId: string, invoiceId: string) {
  const response = await fetch(
    `/api/admin/billing/subscription/${encodeURIComponent(subscriptionId)}/invoices/${encodeURIComponent(invoiceId)}/reconcile`,
    { method: "POST", cache: "no-store" }
  );
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new BillingApiError(
      typeof body?.message === "string"
        ? body.message
        : typeof body?.error === "string"
          ? body.error
          : "Não foi possível conferir o pagamento. Os registros foram preservados.",
      response.status,
      body
    );
  return body as {
    invoiceId: string;
    outcome: "UPDATED" | "UNCHANGED" | "PAYMENT_REQUIRES_CONFIRMATION";
    presentation: InvoicePresentation;
  };
}
