import { GUIDE_RECRUITING_CONTEXT, guideDestination } from "@/lib/admin-guide-navigation";
import { ONBOARDING_IDS } from "@/lib/admin-onboarding";
import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

type ContextDefinition = { capability: string; summary: string; details: string[] };
export const GUIDE_CONTEXT: Record<string, ContextDefinition> = {
  IDENTITY: {
    capability: "configureIdentity",
    summary: "Personalize a identidade do grupo usando os controles desta página.",
    details: [
      "Escolha o logotipo do grupo e confira as opções disponíveis.",
      "Salve as alterações e aguarde a confirmação. Esta orientação é complementar às oito etapas.",
    ],
  },
  MONTHLY_MODEL: {
    capability: "manageMonthlyPlayers",
    summary:
      "Organize os mensalistas nesta página. A escolha do modelo do grupo continua disponível no guia completo.",
    details: [
      "Confira os jogadores e as opções de mensalidade da página.",
      "Para definir o modelo do grupo no guia, retorne à página completa do Guia Interativo. Cadastrar um mensalista não substitui essa escolha.",
    ],
  },
  ACTIVE_PLAYERS: {
    capability: "managePlayers",
    summary:
      "Cadastre um jogador nesta página ou incentive os atletas a criar suas próprias contas.",
    details: [
      "Abra Cadastrar Jogador e preencha o perfil.",
      "Salve e aguarde a confirmação. Abrir o formulário não conclui a etapa.",
      "Sempre que possível, incentive cada atleta a criar sua conta. Solicitações pendentes não contam como entrada no grupo.",
    ],
  },
  SCHEDULE: {
    capability: "configureSchedule",
    summary: "Cadastre pelo menos um dia e horário em que seu grupo se reúne para jogar.",
    details: [
      "Escolha o dia da semana.",
      "Informe o horário do encontro.",
      "Clique em Adicionar e confira o horário na lista.",
    ],
  },
  OFFICIAL_TEAMS: {
    capability: "manageOfficialTeams",
    summary:
      "Cadastre pelo menos dois times oficiais ativos. Você pode adicionar todas as equipes que seu grupo utiliza.",
    details: [
      "Clique em Novo Time.",
      "Preencha o nome e confira a cor e o escudo.",
      "Clique em Adicionar time e aguarde a confirmação. Repita para os demais times do grupo.",
    ],
  },
  ATHLETE_LEVELS: {
    capability: "manageAthleteLevels",
    summary:
      "Avalie habilidade e condição física de todos os atletas elegíveis, com pelo menos dez atletas no grupo.",
    details: [
      "Encontre o atleta na lista.",
      "Defina as estrelas de habilidade e condição física.",
      "Aguarde a confirmação do salvamento dos dois campos antes de seguir.",
    ],
  },
  FIRST_MATCHDAY: {
    capability: "manageMatchesAndResults",
    summary:
      "Escolha o Sorteio Inteligente ou a Partida Clássica e salve a preparação do primeiro jogo.",
    details: [
      "Escolha o modo de criação da partida.",
      "Confira os times, os jogadores, a data e o local.",
      "Na Partida Clássica, salve a partida. No Sorteio Inteligente, publique a preparação após revisar os times. Apenas gerar um sorteio não conclui a etapa.",
    ],
  },
  RESULTS_RECORDED: {
    capability: "manageMatchesAndResults",
    summary: "Registre e salve os resultados de todas as partidas de um dia.",
    details: [
      "Selecione o dia e abra a partida.",
      "Confira placar, gols e assistências e salve os resultados.",
      "Repita nas demais partidas do dia. Registrar os resultados e finalizar oficialmente a rodada são ações distintas.",
    ],
  },
  CHAMPION_PUBLISHED: {
    capability: "publishChampion",
    summary:
      "Confira uma rodada com resultados válidos e partidas finalizadas e publique o Time Campeão do Dia.",
    details: [
      "Selecione a rodada e confira o time vencedor.",
      "Revise os destaques e as informações solicitadas na página.",
      "Publique e aguarde a confirmação do sistema. Abrir a prévia não conclui a etapa.",
    ],
  },
  MATCHES_FINISHED: {
    capability: "manageMatchesAndResults",
    summary: "Confira os resultados antes de finalizar oficialmente a rodada.",
    details: [
      "Selecione a rodada e revise os resultados salvos.",
      "Use a ação de finalização da página e aguarde a confirmação.",
    ],
  },
};

export function contextualTask(guide: AdminGuideData, id: string | null, pathname: string) {
  if (!id || !GUIDE_CONTEXT[id] || guide.administrator.status !== "APROVADO") return null;
  const task = guide.tasks.find((item) => item.id === id);
  if (!task || !guide.capabilities[GUIDE_CONTEXT[id].capability]) return null;
  const destination = guideDestination(guide, task);
  const matchdayPage =
    id === "FIRST_MATCHDAY" &&
    [
      "/admin/partidas/criar",
      "/admin/partidas/criar/classica",
      "/admin/partidas/sorteio-inteligente",
    ].includes(pathname);
  return destination && (destination === pathname || matchdayPage) ? task : null;
}

export function contextOrdinal(id: string) {
  const index = ONBOARDING_IDS.indexOf(id);
  return index < 0 ? "Orientação complementar" : `Etapa ${index + 1} de ${ONBOARDING_IDS.length}`;
}

function count(guide: AdminGuideData, key: string): number | null {
  const value = guide.operationalState[key];
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

export function contextProgress(guide: AdminGuideData, task: AdminGuideTask): string | null {
  const state = guide.operationalState;
  if (task.id === "OFFICIAL_TEAMS") {
    const teams = count(guide, "activeOfficialTeams");
    if (task.completed && teams !== null && teams >= 2)
      return `${teams} times oficiais ativos cadastrados. Mínimo necessário: 2.`;
    return teams === null
      ? null
      : `${teams} de 2 times oficiais ativos cadastrados${teams === 1 && !task.completed ? " — falta mais um time." : "."}`;
  }
  if (task.id === "SCHEDULE")
    return state.agendaConfigured === false ? "Nenhum dia e horário válido cadastrado." : null;
  if (task.id === "ATHLETE_LEVELS") {
    const eligible = count(guide, "eligiblePlayerCount");
    const evaluated = count(guide, "evaluatedEligiblePlayers");
    return eligible !== null && evaluated !== null
      ? `${evaluated} de ${eligible} atletas elegíveis avaliados. Mínimo de dez atletas, todos com avaliação salva.`
      : null;
  }
  if (task.id === "ACTIVE_PLAYERS") {
    const players = count(guide, "invitedPlayers");
    return players === null
      ? null
      : `${players} ${players === 1 ? "jogador cadastrado ou admitido" : "jogadores cadastrados ou admitidos"} no grupo.`;
  }
  if (task.id === "FIRST_MATCHDAY") {
    const matches = count(guide, "validMatchCount");
    return matches === null
      ? null
      : `${matches} ${matches === 1 ? "partida válida salva" : "partidas válidas salvas"}.`;
  }
  return null;
}

export function contextSummary(guide: AdminGuideData, task: AdminGuideTask) {
  if (!task.completed)
    return task.id === "OFFICIAL_TEAMS" && count(guide, "activeOfficialTeams") === 1
      ? "Seu primeiro time já está cadastrado. Cadastre mais um para concluir esta etapa."
      : GUIDE_CONTEXT[task.id].summary;
  // A conquista histórica permanece; condições atuais continuam sendo verificadas pelo backend.
  if (task.id === "OFFICIAL_TEAMS" && (count(guide, "activeOfficialTeams") ?? 0) >= 2)
    return "Os dois times necessários já estão cadastrados. Se seu grupo utiliza mais equipes, você pode continuar adicionando times nesta página.";
  if (task.id === "SCHEDULE" && guide.operationalState.agendaConfigured === true)
    return "O dia e o horário dos jogos do seu grupo foram cadastrados com sucesso. Seu grupo joga em outros dias da semana? Você pode cadastrar mais horários no formulário abaixo.";
  if (task.id === "ACTIVE_PLAYERS")
    return "Você já deu o primeiro passo para trazer jogadores ao Fut7Pro. Continue incentivando cada atleta a criar sua conta. O cadastro manual permanece disponível como alternativa.";
  if (
    task.id === "ATHLETE_LEVELS" &&
    guide.operationalState.eligibleLevelCoverage === 100 &&
    (count(guide, "eligiblePlayerCount") ?? 0) >= 10
  )
    return "As avaliações dos atletas elegíveis estão salvas. Você pode continuar ajustando habilidade e condição física nesta página.";
  if (task.id === "FIRST_MATCHDAY" && (count(guide, "validMatchCount") ?? 0) > 0)
    return "A preparação do primeiro jogo foi salva. Você pode continuar organizando as partidas do grupo.";
  if (task.id === "RESULTS_RECORDED" && guide.operationalState.hasMatchdayWithAllResults === true)
    return "Os resultados de todas as partidas de um dia estão salvos. Confira os registros antes de finalizar oficialmente a rodada.";
  if (task.id === "CHAMPION_PUBLISHED" && guide.operationalState.championPublished === true)
    return "O Time Campeão do Dia foi publicado em um ciclo válido. Você pode continuar organizando as publicações nesta página.";
  if (
    task.id === "MATCHES_FINISHED" &&
    guide.operationalState.hasOfficiallyFinishedMatchday === true
  )
    return "A finalização oficial das partidas foi confirmada. A publicação do campeão continua sendo uma etapa própria.";
  return "Esta etapa já foi concluída. Você pode continuar trabalhando nesta página. As condições atuais da funcionalidade continuam valendo para novas ações.";
}

export const RECRUITING_CONTEXT = {
  title: "Reúna os jogadores para começar",
  summary: "Cadastre os atletas do seu grupo para liberar a próxima fase do Guia Interativo.",
  details: [
    "Abra Cadastrar Jogador e preencha o perfil do atleta.",
    "Salve e aguarde a confirmação. A contagem considera somente os atletas elegíveis confirmados pelo sistema.",
    "Use Continuar no Guia Interativo para retornar à Fase 2 com o progresso atualizado.",
  ],
};

export function isRecruitingContext(guide: AdminGuideData, id: string | null, pathname: string) {
  return (
    id === GUIDE_RECRUITING_CONTEXT &&
    pathname === "/admin/jogadores/listar-cadastrar" &&
    guide.administrator.status === "APROVADO" &&
    guide.capabilities.managePlayers === true &&
    guide.eligibility?.preparationComplete === true
  );
}

export function recruitingEligibility(guide: AdminGuideData) {
  const value = guide.eligibility;
  if (
    !value ||
    !Number.isInteger(value.eligiblePlayers) ||
    value.eligiblePlayers < 0 ||
    !Number.isInteger(value.minimumPlayers) ||
    value.minimumPlayers <= 0 ||
    !Number.isInteger(value.missingPlayers) ||
    value.missingPlayers < 0
  )
    return null;
  return value;
}
