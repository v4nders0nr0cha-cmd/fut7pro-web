import { resolvePublicTenantSlug } from "@/utils/public-links";

const STORAGE_KEY = "fut7pro_last_tenant_slug";

export function getStoredTenantSlug() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? raw.trim() : null;
}

export function setStoredTenantSlug(slug: string) {
  if (typeof window === "undefined") return;
  const value = slug.trim();
  if (!value) return;
  window.localStorage.setItem(STORAGE_KEY, value);
}

export function resolveActiveTenantSlug(pathname?: string | null) {
  const slugFromPath = resolvePublicTenantSlug(pathname || "");
  if (slugFromPath) return slugFromPath;
  return getStoredTenantSlug();
}
