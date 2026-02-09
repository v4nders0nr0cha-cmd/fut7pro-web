import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getApiBase } from "@/lib/get-api-base";
import { getRachaTheme } from "@/config/rachaThemes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolvePublicThemeKey(slug?: string | null) {
  if (!slug) return null;
  try {
    const base = getApiBase().replace(/\/+$/, "");
    const res = await fetch(`${base}/public/${encodeURIComponent(slug)}/tenant`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      return null;
    }
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
  if (!themeKey) {
    notFound();
  }
  return <div data-theme={themeKey}>{children}</div>;
}
