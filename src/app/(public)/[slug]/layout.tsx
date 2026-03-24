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

const PUBLIC_PATH_HEADER_CANDIDATES = [
  "x-fut7pro-pathname",
  "x-forwarded-uri",
  "x-next-url",
  "x-pathname",
  "x-matched-path",
  "x-nextjs-matched-path",
  "x-invoke-path",
] as const;

function normalizePathnameCandidate(value?: string | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let pathname = trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      pathname = new URL(trimmed).pathname;
    } catch {
      pathname = trimmed;
    }
  }

  const withoutQuery = pathname.split("?")[0]?.split("#")[0] ?? "";
  const normalized = withoutQuery
    .trim()
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");

  if (!normalized) return "/";
  return normalized.startsWith("/") ? normalized.toLowerCase() : `/${normalized.toLowerCase()}`;
}

function resolvePathnameFromHeaders(hdrs: { get(name: string): string | null }): string | null {
  for (const headerName of PUBLIC_PATH_HEADER_CANDIDATES) {
    const candidate = normalizePathnameCandidate(hdrs.get(headerName));
    if (candidate) return candidate;
  }
  return null;
}

export function isPrestacaoDeContasPathForSlug(pathname: string | null, slug: string): boolean {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return false;
  const normalizedPathname = normalizePathnameCandidate(pathname);
  if (!normalizedPathname) return false;
  return normalizedPathname === `/${normalizedSlug}/sobre-nos/prestacao-de-contas`;
}

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
    ...PUBLIC_PATH_HEADER_CANDIDATES.map((headerName) => hdrs.get(headerName)),
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
    const hdrs = headers();
    const requestPathname = resolvePathnameFromHeaders(hdrs);
    const requestedSlug = params?.slug ?? "";

    // Permite que a rota de prestação pública trate slug inválido com UX dedicada,
    // em vez de cair no 404 genérico do framework.
    if (isPrestacaoDeContasPathForSlug(requestPathname, requestedSlug)) {
      return <div data-theme={getRachaTheme(null).key}>{children}</div>;
    }

    notFound();
  }
  return <div data-theme={tenant.themeKey}>{children}</div>;
}
