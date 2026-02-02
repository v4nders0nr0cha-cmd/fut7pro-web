import type { Metadata } from "next";
import AdministradoresClient from "./AdministradoresClient";

export const metadata: Metadata = {
  title: "Administradores do Racha | Fut7Pro Admin",
  description:
    "Gerencie os administradores do racha com controle total e segurança no painel Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function AdministradoresPage() {
  return <AdministradoresClient />;
}
