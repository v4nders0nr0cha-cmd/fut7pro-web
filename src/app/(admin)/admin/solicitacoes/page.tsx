import { redirect } from "next/navigation";

export default function LegacySolicitacoesPage() {
  redirect("/admin/jogadores/listar-cadastrar#solicitacoes");
}
