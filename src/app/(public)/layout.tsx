import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "../providers";
import { ThemeProvider } from "@/context/ThemeContext";
import LayoutClient from "@/components/layout/LayoutClient";
import JsonLd from "@/components/seo/JsonLd";
import { getApiBase } from "@/lib/get-api-base";
import { getRachaTheme } from "@/config/rachaThemes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fut7Pro - Sistema Completo para Futebol 7 entre Amigos",
  description:
    "Fut7Pro – O primeiro sistema do mundo focado 100% no Futebol 7 entre amigos. Gerencie rachas, torneios, estatísticas e muito mais!",
  keywords: [
    "fut7",
    "racha",
    "futebol 7",
    "sistema de torneio",
    "plataforma fut7",
    "estatísticas futebol amador",
    "gerenciamento de times",
    "futebol entre amigos",
    "torneio de futebol",
    "classificação de times",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://app.fut7pro.com.br",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://app.fut7pro.com.br",
    siteName: "Fut7Pro",
    title: "Fut7Pro - Sistema Completo para Futebol 7 entre Amigos",
    description:
      "Fut7Pro – O primeiro sistema do mundo focado 100% no Futebol 7 entre amigos. Gerencie rachas, torneios, estatísticas e muito mais!",
    images: [
      {
        url: "https://app.fut7pro.com.br/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fut7Pro - Sistema para Futebol 7 entre Amigos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fut7Pro - Sistema Completo para Futebol 7 entre Amigos",
    description:
      "Fut7Pro – O primeiro sistema do mundo focado 100% no Futebol 7 entre amigos. Gerencie rachas, torneios, estatísticas e muito mais!",
    images: ["https://app.fut7pro.com.br/og-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code", // Substitua pelo código real do Search Console
  },
};

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

export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params?: { slug?: string };
}) {
  const themeKey = await resolvePublicThemeKey(params?.slug ?? null);
  return (
    <div
      data-theme={themeKey}
      className={`${inter.className} bg-fundo text-white break-words min-h-screen`}
    >
      <ThemeProvider>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </ThemeProvider>
      <JsonLd siteName="Fut7Pro" siteUrl="https://app.fut7pro.com.br" logoUrl="/og-image.jpg" />
    </div>
  );
}
