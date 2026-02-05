import type { Metadata } from "next";
import EnquetesClient from "./EnquetesClient";

export const metadata: Metadata = {
  title: "Enquetes | Fut7Pro Admin",
  description:
    "Crie enquetes, acompanhe resultados e engaje os atletas com votações rápidas no Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function EnquetesPage() {
  return <EnquetesClient />;
}
