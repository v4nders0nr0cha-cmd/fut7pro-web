import type { Metadata } from "next";
import LogsAdminClient from "./LogsAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logs de Administração | Fut7Pro Admin",
  description: "Auditoria completa das ações realizadas no painel do racha.",
};

export default function LogsAdminPage() {
  return <LogsAdminClient />;
}
