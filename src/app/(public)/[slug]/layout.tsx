import type { ReactNode } from "react";
import { getApiBase } from "@/lib/get-api-base";
import { getRachaTheme } from "@/config/rachaThemes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolvePublicThemeKey(slug?: string | null) {
  if (!slug) return getRachaTheme(null).key;
  try {
    const base = getApiBase().replace(/\/+$/, "");
    const res = await fetch(`${base}/public/${encodeURIComponent(slug)}/tenant`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return getRachaTheme(null).key;
    }
    const data = await res.json().catch(() => null);
    return getRachaTheme(data?.themeKey ?? data?.theme_key).key;
  } catch {
    return getRachaTheme(null).key;
  }
}

export default async function PublicSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const themeKey = await resolvePublicThemeKey(params?.slug ?? null);
  return <div data-theme={themeKey}>{children}</div>;
}
