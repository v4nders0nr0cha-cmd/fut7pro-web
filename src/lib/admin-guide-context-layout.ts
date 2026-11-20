import {
  CONTEXT_COMPLETED_SUMMARY,
  GUIDE_CONTEXT,
  RECRUITING_CONTEXT,
} from "./admin-guide-context";

// Somente geometria de carregamento. A autorização continua em contextualTask/isRecruitingContext.
export const CONTEXT_LAYOUT: Record<
  string,
  { title: string; routes: string[]; progress?: string }
> = {
  IDENTITY: {
    title: "Personalize a identidade do grupo",
    routes: ["/admin/personalizacao/identidade-visual"],
  },
  MONTHLY_MODEL: { title: "Organize os mensalistas", routes: ["/admin/jogadores/mensalistas"] },
  ACTIVE_PLAYERS: {
    title: "Traga seus primeiros jogadores",
    routes: ["/admin/jogadores/listar-cadastrar"],
    progress: "Quantidade de jogadores cadastrados ou admitidos no grupo.",
  },
  SCHEDULE: {
    title: "Defina os dias e horários",
    routes: ["/admin/rachas"],
    progress: "Dias e horários cadastrados nos encontros do grupo de futebol.",
  },
  OFFICIAL_TEAMS: {
    title: "Cadastre os times",
    routes: ["/admin/partidas/criar-times"],
    progress: "Quantidade de times oficiais ativos cadastrados. Mínimo necessário: dois times.",
  },
  ATHLETE_LEVELS: {
    title: "Avalie o nível dos atletas",
    routes: ["/admin/jogadores/nivel-dos-atletas"],
    progress:
      "Quantidade de atletas elegíveis avaliados. Mínimo de dez atletas, todos com avaliação salva.",
  },
  FIRST_MATCHDAY: {
    title: "Prepare a primeira rodada",
    routes: [
      "/admin/partidas/criar",
      "/admin/partidas/criar/classica",
      "/admin/partidas/sorteio-inteligente",
    ],
    progress: "Quantidade de partidas válidas salvas.",
  },
  RESULTS_RECORDED: {
    title: "Registre os resultados",
    routes: ["/admin/partidas/resultados-do-dia"],
  },
  CHAMPION_PUBLISHED: {
    title: "Publique o Time Campeão do Dia",
    routes: ["/admin/partidas/time-campeao-do-dia"],
  },
  MATCHES_FINISHED: {
    title: "Finalize as partidas",
    routes: ["/admin/partidas/resultados-do-dia"],
  },
  FOOTBALL_PLAYERS: {
    title: RECRUITING_CONTEXT.title,
    routes: ["/admin/jogadores/listar-cadastrar"],
  },
};

export const LAST_CONFIRMATION = "Última confirmação: ";
export const CONTEXT_READ_ERROR =
  "Tente novamente para conferir o progresso. Você pode continuar utilizando esta página.";
export const CONTEXT_STATUSES = [
  "Verificando progresso...",
  "Não foi possível verificar o progresso",
  "Etapa concluída!",
  "Em andamento",
  "Requisito atendido",
  "Reunindo jogadores",
];

export function contextSummaryReserves(id: string) {
  const copies =
    id === "FOOTBALL_PLAYERS"
      ? [RECRUITING_CONTEXT.summary]
      : [
          GUIDE_CONTEXT[id].summary,
          CONTEXT_COMPLETED_SUMMARY[id],
          CONTEXT_COMPLETED_SUMMARY.HISTORY,
          ...(id === "OFFICIAL_TEAMS"
            ? ["Seu primeiro time já está cadastrado. Cadastre mais um para concluir esta etapa."]
            : []),
        ];
  return [
    ...new Set([...copies.filter((copy): copy is string => Boolean(copy)), CONTEXT_READ_ERROR]),
  ];
}
