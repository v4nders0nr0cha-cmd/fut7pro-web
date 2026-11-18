// Guide access discovery is local to this browser and membership, not a login.
export const GUIDE_CLOSED = "fut7pro:guide-main-closed";
export const GUIDE_ACCESS_USED = "fut7pro:guide-access-used";
export type GuideAccessIdentity = { tenantId: string; membershipId: string };
const seen = new Set<string>();
export function guideAccessScope(identity: GuideAccessIdentity) {
  return `${identity.tenantId}:${identity.membershipId}`;
}
export function accessHintSeen(scope: string) {
  try {
    return seen.has(scope) || localStorage.getItem(`guide-access-hint:v1:${scope}`) === "1";
  } catch {
    return seen.has(scope);
  }
}
export function rememberAccessHint(scope: string) {
  try {
    localStorage.setItem(`guide-access-hint:v1:${scope}`, "1");
  } catch {
    seen.add(scope);
  }
}
export function notifyGuideAccess(
  event: typeof GUIDE_CLOSED | typeof GUIDE_ACCESS_USED,
  identity: GuideAccessIdentity
) {
  window.dispatchEvent(new CustomEvent(event, { detail: identity }));
}
