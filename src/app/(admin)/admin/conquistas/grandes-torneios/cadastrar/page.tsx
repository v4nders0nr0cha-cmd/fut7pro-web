import { redirect } from "next/navigation";

export default function RedirectCadastrarTorneio() {
  // Fluxo de Grandes Torneios foi unificado na tela principal com CRUD via modal.
  // Esta rota antiga era estática; direcionamos para o fluxo dinâmico conectado ao backend.
  redirect("/admin/conquistas/grandes-torneios");
}
