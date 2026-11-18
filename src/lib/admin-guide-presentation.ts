// Temporary dismissal belongs to an authenticated login and a membership,
// never to token expiry, a route, or the first welcome marker.
const dismissed = new Set<string>();
export function guideLoginScope(tenantId: string, membershipId: string, loginId: string) {
  return `${tenantId}:${membershipId}:${loginId}`;
}
export function isGuideTemporarilyDismissed(scope: string) {
  try {
    return dismissed.has(scope) || localStorage.getItem(`guide-closed:${scope}`) === "1";
  } catch {
    return dismissed.has(scope);
  }
}
export function dismissGuideForLogin(scope: string) {
  try {
    localStorage.setItem(`guide-closed:${scope}`, "1");
  } catch {
    dismissed.add(scope);
  }
}
