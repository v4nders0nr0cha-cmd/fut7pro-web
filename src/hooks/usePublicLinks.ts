"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { rachaConfig } from "@/config/racha.config";
import { useRacha } from "@/context/RachaContext";
import { buildPublicHref, resolvePublicTenantSlug } from "@/utils/public-links";

export function usePublicLinks() {
  const pathname = usePathname() ?? "";
  const { tenantSlug } = useRacha();
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const publicSlug = slugFromPath || tenantSlug || rachaConfig.slug;

  const publicHref = useCallback((href: string) => buildPublicHref(href, publicSlug), [publicSlug]);

  return useMemo(
    () => ({
      publicHref,
      publicSlug,
    }),
    [publicHref, publicSlug]
  );
}
