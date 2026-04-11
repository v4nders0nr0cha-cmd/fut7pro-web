import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Partidas e Resultados | Painel Admin - Fut7Pro",
  description:
    "Gerencie confrontos, resultados e histórico de partidas do racha com fluxo centralizado no painel admin.",
};

export default function PartidasLayout({ children }: { children: ReactNode }) {
  return children;
}
