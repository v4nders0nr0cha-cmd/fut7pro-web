// src/lib/tenant.ts
export function getTenantSlugClient(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)tenantSlug=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
