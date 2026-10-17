import { fireEvent, render, screen } from "@testing-library/react";
import AdminGuideFirstMatchSection from "../AdminGuideFirstMatchSection";
import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

const tasks: AdminGuideTask[] = [
  {
    id: "OFFICIAL_TEAMS",
    title: "Cadastre os times oficiais",
    requirement: "REQUIRED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/criar-times",
  },
  {
    id: "ATHLETE_LEVELS",
    title: "Defina o nível dos atletas",
    requirement: "CONDITIONAL",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/jogadores/nivel-dos-atletas",
  },
  {
    id: "MONTHLY_MODEL",
    title: "Defina o modelo de mensalistas",
    requirement: "OPTIONAL",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/jogadores/mensalistas",
  },
  {
    id: "FIRST_MATCHDAY",
    title: "Prepare o primeiro jogo",
    requirement: "REQUIRED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/criar",
  },
];

function makeGuide(
  options: {
    mode?: "INTELLIGENT_DRAW" | "CLASSIC_MATCH";
    monthlyModel?: "HAS_MONTHLY_PLAYERS" | "CASUAL_ONLY" | "DECIDE_LATER";
    matches?: number;
    players?: number;
    teams?: number;
    levels?: number;
    canManageMatches?: boolean;
    canManageMonthly?: boolean;
    slug?: string;
  } = {}
): AdminGuideData {
  const canManageMatches = options.canManageMatches ?? true;
  const canManageMonthly = options.canManageMonthly ?? true;
  return {
    guideVersion: 1,
    tenant: {
      id: options.slug || "seu-racha",
      slug: options.slug || "seu-racha",
      name: "Seu Racha",
    },
    administrator: { membershipId: "membership-1", role: "PRESIDENTE", status: "APROVADO" },
    capabilities: {
      manageMatchesAndResults: canManageMatches,
      manageOfficialTeams: canManageMatches,
      manageAthleteLevels: canManageMatches,
      manageMonthlyPlayers: canManageMonthly,
    },
    pedagogicalState: {
      revision: 1,
      firstMatchMode: options.mode,
      monthlyModel: options.monthlyModel,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources: [],
    },
    pedagogicalStateUpdatedAt: null,
    operationalState: {
      activeHumanPlayers: options.players ?? 0,
      activeOfficialTeams: options.teams ?? 0,
      athleteLevelCoverage: options.levels ?? 0,
      validMatchCount: options.matches ?? 0,
    },
    tasks: tasks.map((task) => {
      if (task.id === "FIRST_MATCHDAY")
        return { ...task, completed: (options.matches ?? 0) > 0, canAct: canManageMatches };
      if (task.id === "OFFICIAL_TEAMS")
        return { ...task, completed: (options.teams ?? 0) >= 2, canAct: canManageMatches };
      if (task.id === "ATHLETE_LEVELS")
        return {
          ...task,
          applicable: options.mode === "INTELLIGENT_DRAW" && canManageMatches,
          canAct: canManageMatches,
        };
      if (task.id === "MONTHLY_MODEL")
        return { ...task, applicable: canManageMonthly, canAct: canManageMonthly };
      return task;
    }),
    activationProgress: { completed: 0, total: 5, percentage: 0, complete: false },
    nextAction: null,
    laterRecommendations: [],
    notices: { identityAuthorization: "", sorteioPublication: "" },
  };
}

const update = jest.fn().mockResolvedValue(true);

beforeEach(() => jest.clearAllMocks());

function show(guide = makeGuide()) {
  return render(<AdminGuideFirstMatchSection guide={guide} updating={false} update={update} />);
}

it("apresenta o segundo momento e as duas modalidades sem criar partidas", () => {
  show();
  expect(screen.getByText("Momento 2/2")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Sorteio Inteligente" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Partida Clássica" })).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Sorteio Inteligente" }).closest("article")?.parentElement
  ).toHaveClass("md:grid-cols-2");
  expect(screen.getByText(/Você ainda não possui uma partida registrada/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Escolher como criar a partida" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar"
  );
  expect(update).not.toHaveBeenCalled();
});

it("registra Sorteio Inteligente somente no clique e aguarda o estado confirmado", () => {
  const { rerender } = show();
  fireEvent.click(screen.getByRole("button", { name: "Escolher Sorteio Inteligente" }));
  expect(update).toHaveBeenCalledWith({
    action: "FIRST_MATCH_MODE_SELECTED",
    mode: "INTELLIGENT_DRAW",
  });
  expect(screen.getByText(/Você ainda não possui uma partida registrada/)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Abrir Sorteio Inteligente" })).not.toBeInTheDocument();
  rerender(
    <AdminGuideFirstMatchSection
      guide={makeGuide({ mode: "INTELLIGENT_DRAW", players: 8, teams: 2, levels: 75 })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getByRole("link", { name: "Abrir Sorteio Inteligente" })).toHaveAttribute(
    "href",
    "/admin/partidas/sorteio-inteligente"
  );
  expect(
    screen.getByText("75% dos jogadores ativos possuem avaliação completa.")
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Avaliar jogadores" })).toHaveAttribute(
    "href",
    "/admin/jogadores/nivel-dos-atletas"
  );
});

it("permite escolher e depois alterar a preferência para Partida Clássica", () => {
  const { rerender } = show(makeGuide({ mode: "INTELLIGENT_DRAW" }));
  fireEvent.click(screen.getByRole("button", { name: "Escolher Partida Clássica" }));
  expect(update).toHaveBeenCalledWith({
    action: "FIRST_MATCH_MODE_SELECTED",
    mode: "CLASSIC_MATCH",
  });
  rerender(
    <AdminGuideFirstMatchSection
      guide={makeGuide({ mode: "CLASSIC_MATCH", players: 6, teams: 2 })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getByRole("link", { name: "Criar Partida Clássica" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar/classica"
  );
  expect(
    screen.queryByRole("heading", { name: "Avalie o nível dos atletas" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Modalidade escolhida" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

it("reconhece partidas persistidas somente pelo estado retornado pelo backend", () => {
  const { rerender } = show(makeGuide({ mode: "INTELLIGENT_DRAW" }));
  expect(screen.getByText(/Você ainda não possui uma partida registrada/)).toBeInTheDocument();
  rerender(
    <AdminGuideFirstMatchSection
      guide={makeGuide({ mode: "INTELLIGENT_DRAW", matches: 3, players: 12, teams: 2 })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getByText(/Sua pelada já possui partidas registradas/)).toBeInTheDocument();
  expect(screen.getByText(/12 jogadores ativos/)).toBeInTheDocument();
  expect(screen.getByText(/2 times oficiais ativos/)).toBeInTheDocument();
});

it("orienta sobre times insuficientes sem tratar elenco como presença confirmada", () => {
  show(makeGuide({ players: 8, teams: 1 }));
  expect(screen.getByRole("link", { name: "Gerenciar Times" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar-times"
  );
  expect(screen.getByText(/não a presença confirmada no dia do jogo/)).toBeInTheDocument();
});

it("registra as três escolhas de mensalistas sem criar cobranças", () => {
  const { rerender } = show();
  fireEvent.click(screen.getByRole("button", { name: "Sim, temos mensalistas" }));
  expect(update).toHaveBeenCalledWith({
    action: "MONTHLY_MODEL_SELECTED",
    monthlyModel: "HAS_MONTHLY_PLAYERS",
  });
  rerender(
    <AdminGuideFirstMatchSection
      guide={makeGuide({ monthlyModel: "HAS_MONTHLY_PLAYERS" })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getByRole("link", { name: "Gerenciar mensalistas" })).toHaveAttribute(
    "href",
    "/admin/jogadores/mensalistas"
  );
  fireEvent.click(screen.getByRole("button", { name: "Não trabalhamos com mensalistas" }));
  expect(update).toHaveBeenCalledWith({
    action: "MONTHLY_MODEL_SELECTED",
    monthlyModel: "CASUAL_ONLY",
  });
  rerender(
    <AdminGuideFirstMatchSection
      guide={makeGuide({ monthlyModel: "CASUAL_ONLY" })}
      updating={false}
      update={update}
    />
  );
  expect(screen.queryByRole("link", { name: "Gerenciar mensalistas" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Decidir depois" }));
  expect(update).toHaveBeenCalledWith({
    action: "MONTHLY_MODEL_SELECTED",
    monthlyModel: "DECIDE_LATER",
  });
});

it("mostra o progresso compartilhado sem oferecer ações esportivas ou financeiras sem permissão", () => {
  show(makeGuide({ players: 10, teams: 2, canManageMatches: false, canManageMonthly: false }));
  expect(screen.getByText(/10 jogadores ativos/)).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Escolher como criar a partida" })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Gerenciar mensalistas" })).not.toBeInTheDocument();
  expect(screen.getByText(/não criar partidas/)).toBeInTheDocument();
});

it("não troca visualmente a pelada ou modalidade antes da resposta do servidor", () => {
  const { rerender } = show(makeGuide({ slug: "pelada-a" }));
  fireEvent.click(screen.getByRole("button", { name: "Escolher Sorteio Inteligente" }));
  rerender(
    <AdminGuideFirstMatchSection
      guide={makeGuide({ slug: "pelada-b", mode: "CLASSIC_MATCH" })}
      updating={false}
      update={update}
    />
  );
  expect(screen.getByRole("link", { name: "Criar Partida Clássica" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar/classica"
  );
  expect(screen.queryByRole("link", { name: "Abrir Sorteio Inteligente" })).not.toBeInTheDocument();
});

it("bloqueia escolhas repetidas durante a atualização", () => {
  render(<AdminGuideFirstMatchSection guide={makeGuide()} updating update={update} />);
  expect(screen.getByRole("button", { name: "Escolher Sorteio Inteligente" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Decidir depois" })).toBeDisabled();
  expect(update).not.toHaveBeenCalled();
});
