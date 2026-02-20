import "@/styles/globals.css";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { rachaConfig } from "@/config/racha.config";
import CookieConsent from "@/components/layout/CookieConsent";
import MonitoringBootstrap from "@/components/layout/MonitoringBootstrap";
import { getApiBase } from "@/lib/get-api-base";
import { GaScripts } from "@/components/layout/GaScripts";

const inter = Inter({ subsets: ["latin"] });
const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
  "";

async function fetchBrandingMetadata() {
  const base = getApiBase();
  const slug = rachaConfig.slug;
  try {
    const res = await fetch(`${base}/public/${slug}/about`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data as any;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await fetchBrandingMetadata();
  const nome = branding?.nome || rachaConfig.nome;
  const logo = branding?.logoUrl || rachaConfig.logo;
  const description = rachaConfig.seo.description;
  const titleDefault = branding?.nome ? `${branding.nome} | Fut7Pro` : rachaConfig.seo.title;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: {
      default: titleDefault,
      template: `%s | ${nome}`,
    },
    description,
    keywords: rachaConfig.seo.keywords,
    authors: [{ name: `${nome} Team` }],
    creator: nome,
    publisher: nome,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: titleDefault,
      description,
      url: "/",
      siteName: nome,
      images: [
        {
          url: logo,
          width: 1200,
          height: 630,
          alt: `${nome} Logo`,
        },
      ],
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: [logo],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: googleVerification ? { google: googleVerification } : undefined,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-fundo text-white break-words`}>
        <GaScripts gaId={gaId} />
        <ErrorBoundary>
          <ThemeProvider>
            <Providers>
              {children}
              <CookieConsent />
              <MonitoringBootstrap />
            </Providers>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
