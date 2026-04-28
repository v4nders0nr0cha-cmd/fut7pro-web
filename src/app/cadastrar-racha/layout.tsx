import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cadastre seu racha no Fut7Pro",
  description:
    "Use um cupom de embaixador e ganhe mais dias grátis e desconto especial para começar.",
  openGraph: {
    title: "Cadastre seu racha no Fut7Pro",
    description:
      "Use um cupom de embaixador e ganhe mais dias grátis e desconto especial para começar.",
    url: "/cadastrar-racha",
  },
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
