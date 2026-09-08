import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gerenciar Times | Painel Admin | Fut7Pro",
  description:
    "Cadastre, edite, arquive e organize os times oficiais do seu racha sem perder o histórico esportivo.",
};

export default function CriarTimesLayout({ children }: { children: ReactNode }) {
  return children;
}
