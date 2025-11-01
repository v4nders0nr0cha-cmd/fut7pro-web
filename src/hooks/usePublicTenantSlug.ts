import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { rachaConfig } from "@/config/racha.config";

const RESERVED_SEGMENTS = new Set([
  "sobre-nos",
  "contato",
  "estatisticas",
  "partidas",
  "login",
  "register",
  "sorteio-inteligente",
  "como-funciona",
  "privacy",
  "termos",
  "api",
]);

export const DEFAULT_PUBLIC_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? rachaConfig.slug ?? "fut7pro";

export function resolvePublicSlug(pathname: string | null): string | null {
  if (!pathname) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return null;
  const first = segments[0];
  if (RESERVED_SEGMENTS.has(first)) return null;
  if (!/^[a-z0-9-]{1,60}$/i.test(first)) return null;
  return first;
}

export function usePublicTenantSlug(): string {
  const pathname = usePathname();
  return useMemo(() => resolvePublicSlug(pathname) ?? DEFAULT_PUBLIC_SLUG, [pathname]);
}
