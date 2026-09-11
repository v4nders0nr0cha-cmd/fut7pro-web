import type { Metadata } from "next";
import EmbaixadoresClient from "./EmbaixadoresClient";

export const metadata: Metadata = {
  title: "SuperAdmin | Creators",
  description:
    "Gestao do programa Creators Fut7Pro: Creators, Cupom Creator, indicacoes, comissoes e configuracoes.",
  robots: { index: false, follow: false },
};

export default function SuperAdminEmbaixadoresPage() {
  return <EmbaixadoresClient />;
}
