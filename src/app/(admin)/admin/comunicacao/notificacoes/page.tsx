import type { Metadata } from "next";
import NotificacoesClient from "./NotificacoesClient";

export const metadata: Metadata = {
  title: "Notificacoes | Fut7Pro Admin",
  description:
    "Envie notificacoes em massa para grupos de atletas com historico e auditoria no Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function NotificacoesPage() {
  return <NotificacoesClient />;
}
