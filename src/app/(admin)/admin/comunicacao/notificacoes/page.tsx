import type { Metadata } from "next";
import NotificacoesClient from "./NotificacoesClient";

export const metadata: Metadata = {
  title: "Notificações | Fut7Pro Admin",
  description:
    "Acompanhe notificações reais do seu painel admin: sugestões recebidas, atualizações e alertas do Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function NotificacoesPage() {
  return <NotificacoesClient />;
}
