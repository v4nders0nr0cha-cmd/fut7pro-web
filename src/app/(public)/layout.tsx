import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "../providers";
import { ThemeProvider } from "@/context/ThemeContext";
import LayoutClient from "@/components/layout/LayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fut7Pro",
  description:
    "Fut7Pro – O primeiro sistema do mundo focado 100% no Futebol 7 entre amigos.",
  keywords:
    "fut7, racha, futebol 7, sistema de torneio, plataforma fut7, estatísticas futebol amador, gerenciamento de times",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} min-h-screen break-words bg-fundo text-white`}
    >
      <ThemeProvider>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </ThemeProvider>
    </div>
  );
}
