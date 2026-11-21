import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

export const FIRST_MATCHDAY_TITLE = "Crie sua primeira rodada";
export const FIRST_MATCHDAY_DESCRIPTION =
  "Organize o primeiro jogo do seu grupo. Experimente o Sorteio Inteligente para montar times equilibrados automaticamente ou escolha a Partida Clássica.";

const STEP_ACTIONS: Record<string, { pending: string; completed: string }> = {
  ACCOUNT_READY: { pending: "Ver site do grupo", completed: "Ver site do grupo" },
  ACTIVE_PLAYERS: { pending: "Convidar jogadores agora", completed: "Convidar mais jogadores" },
  SCHEDULE: { pending: "Definir dias e horários", completed: "Revisar dias e horários" },
  OFFICIAL_TEAMS: { pending: "Cadastrar times", completed: "Gerenciar times" },
  ATHLETE_LEVELS: { pending: "Avaliar atletas", completed: "Revisar avaliações" },
  // A etapa continua abrindo a escolha das modalidades, inclusive após a conclusão.
  FIRST_MATCHDAY: { pending: "Criar primeira rodada", completed: "Organizar próxima rodada" },
  RESULTS_RECORDED: { pending: "Registrar resultados", completed: "Ver resultados" },
  CHAMPION_PUBLISHED: { pending: "Publicar campeão", completed: "Revisar campeão" },
};

export function onboardingActionLabel(task: Pick<AdminGuideTask, "id" | "completed">) {
  return STEP_ACTIONS[task.id]?.[task.completed ? "completed" : "pending"];
}

export const PREPARATION_IDS = ["ACCOUNT_READY", "ACTIVE_PLAYERS", "SCHEDULE", "OFFICIAL_TEAMS"];
export const FOOTBALL_IDS = [
  "ATHLETE_LEVELS",
  "FIRST_MATCHDAY",
  "RESULTS_RECORDED",
  "CHAMPION_PUBLISHED",
];
export const ONBOARDING_IDS = [...PREPARATION_IDS, ...FOOTBALL_IDS];
export const STEP_HELP: Record<string, string> = {
  ACCOUNT_READY: "Sua conta está pronta e o site do grupo já pode receber a galera.",
  ACTIVE_PLAYERS:
    "Compartilhe o link exclusivo do grupo para os atletas entrarem e montarem seus perfis.",
  SCHEDULE:
    "Defina quando a galera se reúne. Escolha o dia da semana, preencha o horário e clique em Adicionar para salvar a rotina do grupo.",
  ATHLETE_LEVELS:
    "Avalie habilidade e físico de cada atleta. As avaliações salvas ajudam o balanceamento do Sorteio Inteligente. Você pode acompanhar a cobertura atual sem perder o progresso já conquistado.",
  OFFICIAL_TEAMS:
    "Cadastre os times que vocês usam para organizar partidas e rankings. Comece com pelo menos dois times.",
  FIRST_MATCHDAY:
    "Experimente o Sorteio Inteligente para usar as avaliações na formação dos times ou escolha a Partida Clássica. Confira jogadores, times, data e local e salve a preparação da rodada.",
  RESULTS_RECORDED:
    "Selecione o dia, registre os placares, gols e assistências e salve os resultados de todas as partidas. Confira os dados antes de finalizar oficialmente a rodada.",
  CHAMPION_PUBLISHED:
    "Selecione a rodada com resultados registrados e partidas finalizadas, confira o time vencedor e publique o Time Campeão do Dia.",
};

export function isOnboardingActionUnlocked(
  tasks: AdminGuideTask[],
  taskId: string,
  availability?: AdminGuideData["actionAvailability"]
) {
  if (availability) return availability[taskId]?.allowed === true;
  if (FOOTBALL_IDS.includes(taskId)) return false;
  const index = ONBOARDING_IDS.indexOf(taskId);
  return ONBOARDING_IDS.slice(0, Math.max(0, index)).every((id) =>
    tasks.some((task) => task.id === id && task.completed)
  );
}

export function onboardingBlockMessage(guide: AdminGuideData, taskId: string) {
  const reason = guide.actionAvailability?.[taskId]?.reason;
  if (reason === "PERMISSION")
    return "Esta ação cabe a outro responsável autorizado do grupo. Você pode consultar a orientação e acompanhar o progresso.";
  if (reason === "PHASE_LOCKED")
    return guide.eligibility?.preparationComplete
      ? "Reúna os atletas que faltam para liberar a Parte 2."
      : "Conclua a Parte 1 para liberar esta fase.";
  if (reason === "OPERATIONAL")
    return "Confira os times, as partidas e os resultados necessários na funcionalidade antes de continuar.";
  return "Conclua as etapas anteriores para liberar esta ação.";
}
