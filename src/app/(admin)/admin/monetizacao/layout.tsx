import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Monetização | Painel Admin - Fut7Pro",
  description:
    "Acesse estratégias de monetização, materiais comerciais e recursos para ampliar receita do racha.",
};

export default function MonetizacaoLayout({ children }: { children: ReactNode }) {
  return children;
}
