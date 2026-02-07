import { resolvePublicTenantSlug } from "@/utils/public-links";

const STORAGE_KEY = "fut7pro_last_tenant_slug";
const COOKIE_KEY = "f7_active_slug";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const pairs = document.cookie ? document.cookie.split("; ") : [];
  for (const pair of pairs) {
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    const key = pair.slice(0, separator);
    if (key !== name) continue;
    const value = pair.slice(separator + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

export function getStoredTenantSlug() {
  if (typeof window === "undefined") return null;
  const cookieValue = readCookie(COOKIE_KEY)?.trim() || null;
  if (cookieValue) return cookieValue;
  const localValue = window.localStorage.getItem(STORAGE_KEY);
  return localValue ? localValue.trim() : null;
}

export function setStoredTenantSlug(slug: string) {
  if (typeof window === "undefined") return;
  const value = slug.trim();
  if (!value) return;
  window.localStorage.setItem(STORAGE_KEY, value);
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function resolveActiveTenantSlug(pathname?: string | null) {
  const slugFromPath = resolvePublicTenantSlug(pathname || "");
  if (slugFromPath) return slugFromPath;
  const cookieValue = readCookie(COOKIE_KEY)?.trim() || null;
  if (cookieValue) return cookieValue;
  if (typeof window === "undefined") return null;
  const localValue = window.localStorage.getItem(STORAGE_KEY);
  return localValue ? localValue.trim() : null;
}
