import type { Metadata } from "next";
import EmbaixadoresGestaoClient from "./EmbaixadoresGestaoClient";

export const metadata: Metadata = {
  title: "SuperAdmin | Gestao de Embaixadores",
  description:
    "Gestao avancada do programa de embaixadores Fut7Pro com busca, indicadores e analise por estado, cidade e conversao.",
  robots: { index: false, follow: false },
};

export default function SuperAdminEmbaixadoresGestaoPage() {
  return <EmbaixadoresGestaoClient />;
}
