import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mensalistas | Financeiro Admin - Fut7Pro",
  description:
    "Controle mensalidades, competências e status de pagamento dos atletas mensalistas no painel financeiro.",
};

export default function MensalistasLayout({ children }: { children: ReactNode }) {
  return children;
}
