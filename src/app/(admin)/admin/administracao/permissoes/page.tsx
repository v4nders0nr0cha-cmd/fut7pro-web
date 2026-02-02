import type { Metadata } from "next";
import PermissoesClient from "./PermissoesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Permissões dos Administradores | Fut7Pro Admin",
  description:
    "Detalhes das permissões por cargo no painel do racha: acesso, edição, exclusão e prazo.",
};

export default function PermissoesPage() {
  return <PermissoesClient />;
}
