"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { guideDestination } from "@/lib/admin-guide-navigation";
import { ADMIN_GUIDE_CHANGED } from "@/lib/admin-guide-events";
import { STEP_HELP } from "@/lib/admin-onboarding";
const CONTEXT_STEPS: Record<string, string[]> = {
  SCHEDULE: [
    "Selecione o dia da semana.",
    "Preencha o horário do encontro.",
    "Clique em Adicionar e confira o horário salvo na lista.",
  ],
  ATHLETE_LEVELS: [
    "Encontre o atleta na lista.",
    "Informe as estrelas de habilidade e a condição física.",
    "As avaliações são salvas quando os dois campos estão definidos. Aguarde a confirmação antes de seguir.",
  ],
  ACTIVE_PLAYERS: [
    "Clique em Cadastrar Jogador.",
    "Preencha nome, apelido e posições. Adicione a foto se desejar.",
    "Salve o perfil. O guia confere o cadastro realizado.",
  ],
  OFFICIAL_TEAMS: [
    "Clique em Novo Time.",
    "Preencha Nome do time e confira cor e escudo.",
    "Clique em Adicionar time. Cadastre pelo menos dois times para concluir.",
  ],
  FIRST_MATCHDAY: [
    "Escolha Sorteio Inteligente ou partida clássica.",
    "Confira os jogadores e os times participantes.",
    "Defina data e local e salve ou publique a preparação do jogo.",
  ],
  RESULTS_RECORDED: [
    "Selecione o dia e abra a partida.",
    "Confira placar, gols e assistências e salve.",
    "Repita nas demais partidas do dia. Finalize a rodada após conferir os registros.",
  ],
  CHAMPION_PUBLISHED: [
    "Selecione a rodada e confira o Time Campeão do Dia.",
    "Revise os destaques e as informações solicitadas na página.",
    "Publique e aguarde a confirmação do sistema.",
  ],
};

export default function AdminGuideContext() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { guide, retry } = useAdminGuide();
  const id = params?.get("guia");
  const task = guide?.tasks.find((item) => item.id === id);
  const destination = guide && task ? guideDestination(guide, task) : null;
  const visible = Boolean(task && destination === pathname);
  useEffect(() => {
    if (!visible) return;
    const refresh = () => void retry();
    window.addEventListener(ADMIN_GUIDE_CHANGED, refresh);
    return () => window.removeEventListener(ADMIN_GUIDE_CHANGED, refresh);
  }, [visible, retry]);
  if (!visible || !task) return null;
  const targetLabel =
    task.id === "SCHEDULE"
      ? "Adicionar"
      : task.id === "ACTIVE_PLAYERS"
        ? "Cadastrar Jogador"
        : task.id === "OFFICIAL_TEAMS"
          ? "Novo Time"
          : null;
  const showAction = () => {
    const target = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) =>
        button.textContent?.trim() === targetLabel &&
        !button.disabled &&
        button.getClientRects().length > 0
    );
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus({ preventScroll: true });
  };
  return (
    <aside
      className="mx-4 mt-4 rounded-xl border border-yellow-400/30 bg-[#23272F] p-4 text-sm text-white md:mt-4"
      aria-label="Orientação do guia"
    >
      <h2 className="font-bold text-yellow-200">
        {task.completed ? "Etapa concluída" : task.title}
      </h2>
      <p className="mt-2">
        {task.id === "ACTIVE_PLAYERS"
          ? "Clique em Cadastrar Jogador, preencha o perfil e salve. Abrir o formulário mantém a etapa pendente até o cadastro ser concluído."
          : STEP_HELP[task.id]}
      </p>
      {!task.completed && (
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          {CONTEXT_STEPS[task.id]?.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      {!task.completed && targetLabel && (
        <button
          type="button"
          onClick={showAction}
          className="mr-4 mt-3 min-h-11 rounded-lg border border-yellow-400/40 px-3 text-yellow-200"
        >
          Mostrar {targetLabel}
        </button>
      )}
      <Link
        href="/admin/guia-fut7pro"
        className="mt-2 inline-flex min-h-11 items-center text-yellow-200 underline"
      >
        {task.completed ? "Continuar guia" : "Voltar ao guia"}
      </Link>
    </aside>
  );
}
