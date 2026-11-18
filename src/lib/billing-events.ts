export const BILLING_CHANGED = "fut7pro:billing-changed";
export type BillingChangedDetail = { tenantId: string; slug: string };
export function notifyBillingChanged(detail: BillingChangedDetail) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent(BILLING_CHANGED, { detail }));
}
