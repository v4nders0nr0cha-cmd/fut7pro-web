import type { Metadata } from "next";
import NossaHistoriaEditor from "./NossaHistoriaEditor";

export const metadata: Metadata = {
  title: "Editar Nossa História | Personalização | Painel Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditarNossaHistoriaPage() {
  return <NossaHistoriaEditor />;
}
