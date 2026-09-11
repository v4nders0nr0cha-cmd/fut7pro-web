import type { Metadata } from "next";
import EmbaixadoresGestaoClient from "./EmbaixadoresGestaoClient";

export const metadata: Metadata = {
  title: "SuperAdmin | Gestao de Creators",
  description:
    "Gestao avancada do programa Creators Fut7Pro com busca, indicadores e analise por estado, cidade e conversao.",
  robots: { index: false, follow: false },
};

export default function SuperAdminEmbaixadoresGestaoPage() {
  return <EmbaixadoresGestaoClient />;
}
