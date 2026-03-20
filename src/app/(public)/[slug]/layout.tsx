import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import { getApiBase } from "@/lib/get-api-base";
import { getRachaTheme } from "@/config/rachaThemes";
import { resolveCanonicalPathForPublicSlug } from "@/lib/seo/public-canonical";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

type PublicTenantLayoutData = {
  slug: string;
  name: string;
  themeKey: string;
};

const fetchPublicTenantLayoutData = cache(async (slug?: string | null) => {
  if (!slug) return null;
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  try {
    const base = getApiBase().replace(/\/+$/, "");
    const res = await fetch(`${base}/public/${encodeURIComponent(normalizedSlug)}/tenant`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return {
        slug: normalizedSlug,
        name: normalizedSlug,
        themeKey: getRachaTheme(null).key,
      } satisfies PublicTenantLayoutData;
    }
    const data = await res.json().catch(() => null);
    return {
      slug:
        String(data?.slug || normalizedSlug)
          .trim()
          .toLowerCase() || normalizedSlug,
      name: String(data?.name || normalizedSlug).trim() || normalizedSlug,
      themeKey: getRachaTheme(data?.themeKey ?? data?.theme_key).key,
    } satisfies PublicTenantLayoutData;
  } catch {
    return {
      slug: normalizedSlug,
      name: normalizedSlug,
      themeKey: getRachaTheme(null).key,
    } satisfies PublicTenantLayoutData;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params?.slug?.trim().toLowerCase() || "";
  const tenant = await fetchPublicTenantLayoutData(slug);
  const tenantName = tenant?.name || slug || "Fut7Pro";

  const hdrs = headers();
  const canonicalPath = resolveCanonicalPathForPublicSlug(slug, [
    hdrs.get("x-forwarded-uri"),
    hdrs.get("x-next-url"),
    hdrs.get("x-pathname"),
    hdrs.get("x-matched-path"),
    hdrs.get("x-nextjs-matched-path"),
    hdrs.get("x-invoke-path"),
  ]);

  const canonicalUrl = `${APP_URL}${canonicalPath}`;
  const title = `${tenantName} | Fut7Pro`;
  const description = `Acompanhe partidas, atletas, rankings e comunicacao do ${tenantName} no Fut7Pro.`;

  return {
    title: {
      default: title,
      template: `%s | ${tenantName}`,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Fut7Pro",
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const tenant = await fetchPublicTenantLayoutData(params?.slug ?? null);
  if (!tenant) {
    notFound();
  }
  return <div data-theme={tenant.themeKey}>{children}</div>;
}
