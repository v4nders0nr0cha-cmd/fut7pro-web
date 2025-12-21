import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cadastrar Racha | Fut7Pro",
  description:
    "Cadastre seu racha, defina o slug e crie o presidente do painel admin Fut7Pro. Multi-tenant pronto para produção.",
  robots: { index: false, follow: false, nocache: true },
};

export default function CadastroRachaLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} min-h-screen bg-gradient-to-br from-[#0f1014] via-[#13151b] to-[#0b0c10] text-white px-4 py-8 sm:py-12`}
    >
      {children}
    </div>
  );
}
