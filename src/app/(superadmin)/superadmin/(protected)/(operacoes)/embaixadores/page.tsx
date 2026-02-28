import type { Metadata } from "next";
import EmbaixadoresClient from "./EmbaixadoresClient";

export const metadata: Metadata = {
  title: "SuperAdmin | Embaixadores",
  description:
    "Gestao do programa de embaixadores Fut7Pro: embaixadores, cupons, indicacoes, comissoes e configuracoes.",
  robots: { index: false, follow: false },
};

export default function SuperAdminEmbaixadoresPage() {
  return <EmbaixadoresClient />;
}
