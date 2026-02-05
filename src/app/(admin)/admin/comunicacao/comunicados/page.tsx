import type { Metadata } from "next";
import ComunicadosClient from "./ComunicadosClient";

export const metadata: Metadata = {
  title: "Comunicados | Fut7Pro Admin",
  description:
    "Crie comunicados com periodo definido e controle automatico de exibicao no Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function ComunicadosPage() {
  return <ComunicadosClient />;
}
