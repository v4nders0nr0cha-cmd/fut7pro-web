import type { Metadata } from "next";
import RecoveryCenterClient from "./RecoveryCenterClient";

export const metadata: Metadata = {
  title: "Central de Recuperação | Fut7Pro Admin",
  description: "Restaure registros elegíveis da sua pelada com segurança.",
  robots: { index: false, follow: false },
};

export default function RecoveryCenterPage() {
  return <RecoveryCenterClient />;
}
