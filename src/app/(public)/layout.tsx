import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "../providers";
import { ThemeProvider } from "@/context/ThemeContext";
import LayoutClient from "@/components/layout/LayoutClient";
import JsonLd from "@/components/seo/JsonLd";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);
const SITE_NAME = process.env.SITE_NAME || "Fut7Pro";
const DEFAULT_TITLE = `${SITE_NAME} - Sistema Completo para Futebol 7 entre Amigos`;
const DEFAULT_DESCRIPTION =
  "Fut7Pro - O primeiro sistema do mundo focado 100% no Futebol 7 entre amigos. Gerencie rachas, torneios, estatisticas e muito mais!";
const DEFAULT_KEYWORDS = [
  "fut7",
  "racha",
  "futebol 7",
  "sistema de torneio",
  "plataforma fut7",
  "estatisticas futebol amador",
  "gerenciamento de times",
  "futebol entre amigos",
  "torneio de futebol",
  "classificacao de times",
];
const OG_IMAGE = new URL("/og-image.jpg", APP_URL).toString();
const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION || "your-google-verification-code";

export const metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  robots: { index: true, follow: true },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Sistema para Futebol 7 entre Amigos`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.className} bg-fundo text-white break-words min-h-screen`}>
      <ThemeProvider>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </ThemeProvider>
      <JsonLd siteName={SITE_NAME} siteUrl={APP_URL} logoUrl="/og-image.jpg" />
    </div>
  );
}
