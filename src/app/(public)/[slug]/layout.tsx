import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import { getApiBase } from "@/lib/get-api-base";
import { getRachaTheme } from "@/config/rachaThemes";
import { resolveCanonicalPathForPublicSlug } from "@/lib/seo/public-canonical";
import {
  isPrestacaoDeContasPathForSlug,
  PUBLIC_PATH_HEADER_CANDIDATES,
  resolvePathnameFromHeaders,
} from "./layout-path-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

const ROBOTS_PREVIEW_DIRECTIVES = {
  "max-video-preview": -1,
  "max-image-preview": "large",
  "max-snippet": -1,
} as const;

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

function resolvePublicPageSeo(canonicalPath: string, tenantName: string) {
  const segments = canonicalPath.split("/").filter(Boolean);
  const path = `/${segments.slice(1).join("/")}`;

  const routeSeo: Record<string, { title: string; description: string; noindex?: boolean }> = {
    "/": {
      title: `${tenantName} | Site oficial do racha no Fut7Pro`,
      description: `Acompanhe partidas, atletas, rankings, campeões e comunicados do ${tenantName} no site público do Fut7Pro.`,
    },
    "/atletas": {
      title: `Atletas do ${tenantName} | Fut7Pro`,
      description: `Veja a lista de atletas do ${tenantName}, perfis, estatísticas, histórico e conquistas no Fut7Pro.`,
    },
    "/partidas": {
      title: `Partidas do ${tenantName} | Fut7Pro`,
      description: `Confira partidas recentes, resultados, Times do Dia e histórico de jogos do ${tenantName}.`,
    },
    "/partidas/historico": {
      title: `Histórico de partidas do ${tenantName} | Fut7Pro`,
      description: `Consulte o histórico de partidas, placares e registros oficiais do ${tenantName}.`,
    },
    "/partidas/times-do-dia": {
      title: `Times do Dia do ${tenantName} | Fut7Pro`,
      description: `Veja os times sorteados para a rodada do ${tenantName} no Fut7Pro.`,
    },
    "/estatisticas": {
      title: `Estatísticas do ${tenantName} | Fut7Pro`,
      description: `Acompanhe rankings, artilheiros, assistências, classificação dos times e métricas do ${tenantName}.`,
    },
    "/estatisticas/ranking-geral": {
      title: `Ranking geral do ${tenantName} | Fut7Pro`,
      description: `Veja a classificação geral dos atletas do ${tenantName} com pontuação e desempenho acumulado.`,
    },
    "/estatisticas/artilheiros": {
      title: `Artilheiros do ${tenantName} | Fut7Pro`,
      description: `Confira os maiores goleadores do ${tenantName} no ranking de artilharia do Fut7Pro.`,
    },
    "/estatisticas/assistencias": {
      title: `Assistências do ${tenantName} | Fut7Pro`,
      description: `Veja os atletas com mais assistências registradas no ${tenantName}.`,
    },
    "/estatisticas/classificacao-dos-times": {
      title: `Classificação dos times do ${tenantName} | Fut7Pro`,
      description: `Acompanhe a classificação dos times, vitórias, derrotas e desempenho coletivo do ${tenantName}.`,
    },
    "/estatisticas/melhores-por-posicao": {
      title: `Melhores por posição do ${tenantName} | Fut7Pro`,
      description: `Compare goleiros, zagueiros, meias e atacantes do ${tenantName} por desempenho no Fut7Pro.`,
    },
    "/estatisticas/tira-teima": {
      title: `Tira-teima do ${tenantName} | Fut7Pro`,
      description: `Compare atletas do ${tenantName} lado a lado com estatísticas e histórico no Fut7Pro.`,
    },
    "/os-campeoes": {
      title: `Campeões do ${tenantName} | Fut7Pro`,
      description: `Veja os campeões, títulos e conquistas oficiais do ${tenantName}.`,
    },
    "/grandes-torneios": {
      title: `Grandes torneios do ${tenantName} | Fut7Pro`,
      description: `Acompanhe torneios especiais, campeões e memória competitiva do ${tenantName}.`,
    },
    "/sobre-nos": {
      title: `Sobre o ${tenantName} | Fut7Pro`,
      description: `Conheça a história, estatuto, contatos, parceiros e informações institucionais do ${tenantName}.`,
    },
    "/sobre-nos/nossa-historia": {
      title: `Nossa história | ${tenantName} no Fut7Pro`,
      description: `Leia a história oficial do ${tenantName} publicada no site público do Fut7Pro.`,
    },
    "/sobre-nos/nossos-parceiros": {
      title: `Parceiros do ${tenantName} | Fut7Pro`,
      description: `Conheça patrocinadores, parceiros e apoiadores do ${tenantName}.`,
    },
    "/sobre-nos/prestacao-de-contas": {
      title: `Prestação de contas do ${tenantName} | Fut7Pro`,
      description: `Veja informações públicas de transparência e prestação de contas do ${tenantName}.`,
    },
    "/comunicacao": {
      title: `Comunicação do ${tenantName} | Fut7Pro`,
      description: `Acesse comunicados, enquetes, sugestões e canais de relacionamento do ${tenantName}.`,
    },
    "/comunicacao/comunicados": {
      title: `Comunicados do ${tenantName} | Fut7Pro`,
      description: `Leia os comunicados oficiais publicados pelo ${tenantName}.`,
    },
    "/comunicacao/enquetes": {
      title: `Enquetes do ${tenantName} | Fut7Pro`,
      description: `Participe e acompanhe decisões coletivas do ${tenantName} no Fut7Pro.`,
    },
    "/sorteio-inteligente": {
      title: `Sorteio inteligente do ${tenantName} | Fut7Pro`,
      description: `Entenda como o ${tenantName} usa sorteio inteligente para formar times equilibrados.`,
    },
    "/contato": {
      title: `Contato do ${tenantName} | Fut7Pro`,
      description: `Veja os canais de contato oficiais do ${tenantName}.`,
    },
    "/entrar": {
      title: `Entrar no ${tenantName} | Fut7Pro`,
      description: `Área de acesso dos atletas e administradores do ${tenantName}.`,
      noindex: true,
    },
    "/login": {
      title: `Login do ${tenantName} | Fut7Pro`,
      description: `Área de login dos atletas e administradores do ${tenantName}.`,
      noindex: true,
    },
    "/register": {
      title: `Cadastro no ${tenantName} | Fut7Pro`,
      description: `Solicite acesso ou crie sua conta para participar do ${tenantName}.`,
      noindex: true,
    },
    "/esqueci-senha": {
      title: `Recuperar senha | ${tenantName} no Fut7Pro`,
      description: `Área de recuperação de senha do ${tenantName}.`,
      noindex: true,
    },
    "/resetar-senha": {
      title: `Redefinir senha | ${tenantName} no Fut7Pro`,
      description: `Área de redefinição de senha do ${tenantName}.`,
      noindex: true,
    },
  };

  if (routeSeo[path]) return routeSeo[path];

  const readable = segments
    .slice(1)
    .filter((segment) => !/^[0-9a-f-]{8,}$/i.test(segment))
    .map((segment) => segment.replace(/-/g, " "))
    .join(" - ");

  return {
    title: readable ? `${readable} | ${tenantName} no Fut7Pro` : `${tenantName} | Fut7Pro`,
    description: readable
      ? `Página ${readable} do ${tenantName} no site público do Fut7Pro.`
      : `Acompanhe o ${tenantName} no Fut7Pro.`,
  };
}

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
  const pageSeo = resolvePublicPageSeo(canonicalPath, tenantName);
  const title = pageSeo.title;
  const description = pageSeo.description;
  const shouldIndex = !pageSeo.noindex;

  return {
    title: {
      default: title,
      template: `%s | ${tenantName}`,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        ...ROBOTS_PREVIEW_DIRECTIVES,
      },
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
