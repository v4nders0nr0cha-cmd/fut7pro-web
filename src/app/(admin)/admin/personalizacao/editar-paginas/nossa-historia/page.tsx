import type { Metadata } from "next";
import NossaHistoriaEditor from "./NossaHistoriaEditor";

export const metadata: Metadata = {
  title: "Editar Nossa Historia | Personalizacao | Painel Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditarNossaHistoriaPage() {
  return <NossaHistoriaEditor />;
}
