import type { AdminGuideTask } from "@/types/admin-guide";

export const ONBOARDING_IDS = [
  "ACCOUNT_READY",
  "ACTIVE_PLAYERS",
  "OFFICIAL_TEAMS",
  "FIRST_MATCHDAY",
  "RESULTS_RECORDED",
  "CHAMPION_PUBLISHED",
];
export const STEP_HELP: Record<string, string> = {
  ACCOUNT_READY: "Sua conta está pronta e o site do grupo já pode receber a galera.",
  ACTIVE_PLAYERS:
    "Compartilhe o link exclusivo do grupo para os atletas entrarem e montarem seus perfis.",
  OFFICIAL_TEAMS:
    "Cadastre os times que vocês usam para organizar partidas e rankings. Comece com pelo menos dois times.",
  FIRST_MATCHDAY:
    "Escolha entre o Sorteio Inteligente e a partida clássica. Confira jogadores, times, data e local e salve o primeiro jogo.",
  RESULTS_RECORDED:
    "Selecione o dia, registre os placares, gols e assistências e salve os resultados de todas as partidas. Confira os dados antes de finalizar oficialmente a rodada.",
  CHAMPION_PUBLISHED:
    "Selecione a rodada com resultados registrados e partidas finalizadas, confira o time vencedor e publique o Time Campeão do Dia.",
};

export function isOnboardingActionUnlocked(tasks: AdminGuideTask[], taskId: string) {
  const index = ONBOARDING_IDS.indexOf(taskId);
  return ONBOARDING_IDS.slice(0, Math.max(0, index)).every((id) =>
    tasks.some((task) => task.id === id && task.completed)
  );
}
