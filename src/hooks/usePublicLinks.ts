"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRacha } from "@/context/RachaContext";
import { buildPublicHref, resolvePublicTenantSlug } from "@/utils/public-links";
import { resolveActiveTenantSlug } from "@/utils/active-tenant";

export function usePublicLinks() {
  const pathname = usePathname() ?? "";
  const { tenantSlug } = useRacha();
  const isAdminScope = pathname.startsWith("/admin");
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const activeSlug = isAdminScope ? null : resolveActiveTenantSlug(pathname);
  const publicSlug = slugFromPath || tenantSlug || activeSlug || "";

  const publicHref = useCallback((href: string) => buildPublicHref(href, publicSlug), [publicSlug]);

  return useMemo(
    () => ({
      publicHref,
      publicSlug,
    }),
    [publicHref, publicSlug]
  );
}
