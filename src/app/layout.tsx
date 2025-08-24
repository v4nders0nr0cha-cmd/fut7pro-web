import "@/styles/globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { rachaConfig } from "@/config/racha.config";
import CookieConsent from "@/components/layout/CookieConsent";
import MonitoringBootstrap from "@/components/layout/MonitoringBootstrap";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: rachaConfig.seo.title,
    template: `%s | ${rachaConfig.nome}`,
  },
  description: rachaConfig.seo.description,
  keywords: rachaConfig.seo.keywords,
  authors: [{ name: `${rachaConfig.nome} Team` }],
  creator: rachaConfig.nome,
  publisher: rachaConfig.nome,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: rachaConfig.seo.title,
    description: rachaConfig.seo.description,
    url: "/",
    siteName: rachaConfig.nome,
    images: [
      {
        url: rachaConfig.logo,
        width: 1200,
        height: 630,
        alt: `${rachaConfig.nome} Logo`,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: rachaConfig.seo.title,
    description: rachaConfig.seo.description,
    images: [rachaConfig.logo],
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} break-words bg-fundo text-white`}>
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
