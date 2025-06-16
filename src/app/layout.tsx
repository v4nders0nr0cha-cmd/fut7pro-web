// src/app/layout.tsx

import "@/styles/globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import AppProviders from "@/components/layout/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fut7Pro",
  description: "Fut7Pro – O primeiro sistema do mundo focado 100% no Futebol 7 entre amigos.",
  keywords:
    "fut7, racha, futebol 7, sistema de torneio, plataforma fut7, estatísticas futebol amador, gerenciamento de times",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} bg-fundo text-white break-words`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
