import { fireEvent, render, screen } from "@testing-library/react";
import AdminGuideContext from "../AdminGuideContext";
import { GUIDE_CONTEXT } from "@/lib/admin-guide-context";
const retry = jest.fn().mockResolvedValue(undefined);
const openGuide = jest.fn();
let params: string;
let pathname: string;
let controller: any;
let agenda: any;
jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(params),
}));
jest.mock("../AdminGuideController", () => ({ useAdminGuideController: () => controller }));
jest.mock("@/hooks/useRachaAgenda", () => ({ useRachaAgenda: () => agenda }));
beforeEach(() => {
  jest.clearAllMocks();
  pathname = "/admin/partidas/criar-times";
  params = "guia=OFFICIAL_TEAMS&guiaOrigem=dashboard";
  agenda = { items: [], isLoading: false, isError: false };
  controller = {
    scope: "user:group:login",
    openGuide,
    state: {
      retry,
      loading: false,
      validating: false,
      error: null,
      guide: {
        administrator: { status: "APROVADO" },
        capabilities: { manageOfficialTeams: true },
        operationalState: { activeOfficialTeams: 0 },
        tasks: [
          {
            id: "OFFICIAL_TEAMS",
            title: "Cadastre os times",
            route: pathname,
            applicable: true,
            canAct: true,
            completed: false,
          },
        ],
      },
    },
  };
});
const state = () => controller.state;
const guide = () => state().guide;
const task = () => guide().tasks[0];
it("identifies the guide, collapses instructions and removes artificial controls", () => {
  render(<AdminGuideContext />);
  expect(screen.getByText("Guia Interativo Fut7Pro")).toBeVisible();
  expect(screen.getByText("Etapa 4 de 8")).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("Em andamento");
  expect(screen.getByText("Use os controles da página abaixo.")).toBeVisible();
  expect(screen.getByText("Ver instruções detalhadas").closest("details")!.open).toBe(false);
  expect(screen.queryByRole("button", { name: /Mostrar|Cadastrar outro time/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Voltar ao guia" }));
  expect(openGuide).toHaveBeenCalledTimes(1);
  expect(retry).not.toHaveBeenCalled();
});
it.each(["", "guia=UNKNOWN", "guia=SCHEDULE"])("hides outside a valid context: %s", (query) => {
  params = query;
  render(<AdminGuideContext />);
  expect(screen.queryByRole("complementary")).toBeNull();
});
it.each(["scope", "permission", "membership", "route", "taskPermission", "applicability"])(
  "rejects invalid %s",
  (reason) => {
    if (reason === "scope") controller.scope = "";
    if (reason === "permission") guide().capabilities.manageOfficialTeams = false;
    if (reason === "membership") guide().administrator.status = "PENDENTE";
    if (reason === "route") pathname = "/admin/financeiro";
    if (reason === "taskPermission") task().canAct = false;
    if (reason === "applicability") task().applicable = false;
    render(<AdminGuideContext />);
    expect(screen.queryByRole("complementary")).toBeNull();
  }
);
it("uses confirmed counts, preserves drafts and focus, and keeps historical achievements", () => {
  const Page = () => (
    <>
      <AdminGuideContext />
      <input aria-label="Rascunho" defaultValue="Azul" />
    </>
  );
  const view = render(<Page />);
  const input = screen.getByRole("textbox");
  input.focus();
  expect(screen.getByText(/0 de 2 times/)).toBeVisible();
  guide().operationalState.activeOfficialTeams = 1;
  view.rerender(<Page />);
  expect(screen.getByText(/falta mais um time/)).toBeVisible();
  expect(screen.getByText(/Seu primeiro time/)).toBeVisible();
  guide().operationalState.activeOfficialTeams = 2;
  view.rerender(<Page />);
  expect(screen.getByRole("status")).toHaveTextContent("Em andamento");
  task().completed = true;
  view.rerender(<Page />);
  expect(screen.getByRole("status")).toHaveTextContent("Etapa concluída!");
  expect(screen.getByText(/Se seu grupo utiliza mais equipes/)).toBeVisible();
  expect(screen.queryByText("Use os controles da página abaixo.")).toBeNull();
  expect(input).toHaveValue("Azul");
  expect(input).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Continuar no Guia Interativo" }));
  expect(openGuide).toHaveBeenCalledTimes(1);
  guide().operationalState.activeOfficialTeams = 1;
  view.rerender(<Page />);
  expect(screen.getByRole("status")).toHaveTextContent("Etapa concluída!");
  expect(screen.queryByText(/Os dois times necessários já/)).toBeNull();
  expect(screen.getByText(/1 de 2 times/)).toBeVisible();
});
it("masks stale completion while verifying or failed and retries without changing the page", () => {
  task().completed = true;
  state().validating = true;
  const view = render(<AdminGuideContext />);
  expect(screen.getByRole("status")).toHaveTextContent("Verificando progresso...");
  expect(screen.queryByText(/0 de 2 times/)).toBeNull();
  state().validating = false;
  state().error = new Error("Offline");
  view.rerender(<AdminGuideContext />);
  expect(screen.getByRole("status")).not.toHaveTextContent("Etapa concluída");
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(retry).toHaveBeenCalledTimes(1);
  state().error = null;
  view.rerender(<AdminGuideContext />);
  expect(screen.getByRole("status")).toHaveTextContent("Etapa concluída!");
});
it("preserves full-page origin and ignores obsolete modal return intermediaries", () => {
  params += "&guiaRetorno=%2Fadmin%2Ffinanceiro";
  const view = render(<AdminGuideContext />);
  fireEvent.click(screen.getByRole("button", { name: "Voltar ao guia" }));
  expect(openGuide).toHaveBeenCalled();
  params = "guia=OFFICIAL_TEAMS&guiaOrigem=pagina";
  view.rerender(<AdminGuideContext />);
  expect(screen.getByRole("link", { name: "Voltar ao guia" })).toHaveAttribute(
    "href",
    "/admin/guia-fut7pro"
  );
});
it.each(Object.keys(GUIDE_CONTEXT))(
  "uses specific instructions and backend completion for %s",
  (id) => {
    const routes: Record<string, string> = {
      IDENTITY: "/admin/personalizacao/identidade-visual",
      MONTHLY_MODEL: "/admin/jogadores/mensalistas",
      ACTIVE_PLAYERS: "/admin/jogadores/listar-cadastrar",
      SCHEDULE: "/admin/rachas",
      OFFICIAL_TEAMS: "/admin/partidas/criar-times",
      ATHLETE_LEVELS: "/admin/jogadores/nivel-dos-atletas",
      FIRST_MATCHDAY: "/admin/partidas/criar",
      RESULTS_RECORDED: "/admin/partidas/resultados-do-dia",
      CHAMPION_PUBLISHED: "/admin/partidas/time-campeao-do-dia",
      MATCHES_FINISHED: "/admin/partidas/resultados-do-dia",
    };
    pathname = routes[id];
    params = `guia=${id}`;
    task().id = id;
    task().route = pathname;
    guide().capabilities[GUIDE_CONTEXT[id].capability] = true;
    guide().guideVersion = 3;
    const view = render(<AdminGuideContext />);
    expect(screen.getByRole("complementary")).toBeVisible();
    GUIDE_CONTEXT[id].details.forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("Em andamento");
    task().completed = true;
    view.rerender(<AdminGuideContext />);
    expect(screen.getByRole("status")).toHaveTextContent("Etapa concluída!");
  }
);
it("shows actual schedule entries and preserves the option to add days", () => {
  pathname = "/admin/rachas";
  params = "guia=SCHEDULE";
  Object.assign(task(), { id: "SCHEDULE", route: pathname });
  guide().capabilities.configureSchedule = true;
  guide().operationalState.agendaConfigured = false;
  const view = render(<AdminGuideContext />);
  expect(screen.getByText(/Nenhum dia e horário válido/)).toBeVisible();
  task().completed = true;
  guide().operationalState.agendaConfigured = true;
  agenda.items = [
    { id: "1", weekday: 6, time: "06:27" },
    { id: "2", weekday: 2, time: "20:00" },
    { id: "bad", weekday: 7, time: "24:00" },
  ];
  view.rerender(<AdminGuideContext />);
  expect(screen.getByText("Sábado, às 06:27")).toBeVisible();
  expect(screen.getByText("Terça-feira, às 20:00")).toBeVisible();
  expect(screen.queryByText(/24:00/)).toBeNull();
  expect(screen.getByText(/Você pode cadastrar mais horários/)).toBeVisible();
  agenda.isError = true;
  view.rerender(<AdminGuideContext />);
  expect(screen.queryByRole("list", { name: "Horários cadastrados" })).toBeNull();
});

it("reports evaluated eligible athletes without turning coverage into a client-side achievement", () => {
  pathname = "/admin/jogadores/nivel-dos-atletas";
  params = "guia=ATHLETE_LEVELS";
  Object.assign(task(), { id: "ATHLETE_LEVELS", route: pathname });
  guide().capabilities.manageAthleteLevels = true;
  Object.assign(guide().operationalState, {
    eligiblePlayerCount: 12,
    evaluatedEligiblePlayers: 9,
    eligibleLevelCoverage: 75,
  });
  const view = render(<AdminGuideContext />);
  expect(screen.getByText(/9 de 12 atletas elegíveis avaliados/)).toBeVisible();
  Object.assign(guide().operationalState, {
    evaluatedEligiblePlayers: 12,
    eligibleLevelCoverage: 100,
  });
  view.rerender(<AdminGuideContext />);
  expect(screen.getByRole("status")).toHaveTextContent("Em andamento");
  task().completed = true;
  view.rerender(<AdminGuideContext />);
  expect(screen.getByText(/As avaliações dos atletas elegíveis estão salvas/)).toBeVisible();
  guide().operationalState.eligiblePlayerCount = 13;
  guide().operationalState.eligibleLevelCoverage = 92;
  view.rerender(<AdminGuideContext />);
  expect(screen.getByRole("status")).toHaveTextContent("Etapa concluída!");
  expect(screen.getByText(/12 de 13 atletas elegíveis/)).toBeVisible();
  expect(screen.queryByText(/As avaliações dos atletas elegíveis estão salvas/)).toBeNull();
});

it.each([
  "/admin/partidas/criar",
  "/admin/partidas/criar/classica",
  "/admin/partidas/sorteio-inteligente",
])("keeps match preparation context on its real route %s", (route) => {
  pathname = route;
  params = "guia=FIRST_MATCHDAY";
  Object.assign(task(), { id: "FIRST_MATCHDAY", route: "/admin/partidas/criar" });
  guide().capabilities.manageMatchesAndResults = true;
  guide().guideVersion = 3;
  const view = render(<AdminGuideContext />);
  expect(screen.getByRole("complementary")).toBeVisible();
  pathname = "/admin/partidas/criar/unknown";
  view.rerender(<AdminGuideContext />);
  expect(screen.queryByRole("complementary")).toBeNull();
});

function recruit(players = 7, minimum = 10) {
  pathname = "/admin/jogadores/listar-cadastrar";
  params = "guia=FOOTBALL_PLAYERS&guiaOrigem=dashboard";
  guide().capabilities = { managePlayers: true };
  guide().eligibility = {
    eligiblePlayers: players,
    minimumPlayers: minimum,
    missingPlayers: Math.max(0, minimum - players),
    preparationComplete: true,
    footballUnlocked: players >= minimum,
  };
  Object.assign(task(), {
    id: "ACTIVE_PLAYERS",
    title: "Traga seus primeiros jogadores",
    route: pathname,
    completed: true,
    canAct: false,
  });
}
it.each([7, 9, 10, 12])(
  "shows recruitment eligibility %s without a phase-one achievement",
  (players) => {
    recruit(players);
    render(<AdminGuideContext />);
    expect(screen.getByRole("heading", { name: "Reúna os jogadores para começar" })).toBeVisible();
    expect(screen.getByText("Apoio à Fase 2")).toBeVisible();
    expect(screen.queryByText("Etapa 2 de 8")).toBeNull();
    expect(screen.queryByText("Etapa concluída!")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Traga seus primeiros jogadores" })).toBeNull();
    expect(screen.getByText(`${players} / 10`)).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      String(Math.min(players, 10))
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      players >= 10 ? "Requisito atendido" : "Reunindo jogadores"
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar no Guia Interativo" }));
    expect(openGuide).toHaveBeenCalledTimes(1);
    expect(task().completed).toBe(true);
    expect(retry).not.toHaveBeenCalled();
  }
);
it.each(["permission", "membership", "route", "preparation", "normal-menu", "unknown"])(
  "rejects recruitment context for %s",
  (reason) => {
    recruit();
    if (reason === "permission") guide().capabilities.managePlayers = false;
    if (reason === "membership") guide().administrator.status = "PENDENTE";
    if (reason === "route") pathname = "/admin/financeiro";
    if (reason === "preparation") guide().eligibility.preparationComplete = false;
    if (reason === "normal-menu") params = "";
    if (reason === "unknown") params = "guia=FOOTBALL_PLAYERS_OTHER";
    render(<AdminGuideContext />);
    expect(screen.queryByRole("complementary")).toBeNull();
  }
);
it("keeps the original ACTIVE_PLAYERS context, achievement and ordinal", () => {
  recruit();
  task().canAct = true;
  params = "guia=ACTIVE_PLAYERS";
  render(<AdminGuideContext />);
  expect(screen.getByText("Etapa 2 de 8")).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("Etapa concluída!");
  expect(screen.getByRole("heading", { name: "Traga seus primeiros jogadores" })).toBeVisible();
  expect(screen.queryByRole("progressbar")).toBeNull();
});
it("uses fresh official recruitment counts and minimum, preserving form drafts and history", () => {
  recruit(7, 12);
  const Page = () => (
    <>
      <AdminGuideContext />
      <input aria-label="Jogador em edição" defaultValue="Nome preservado" />
    </>
  );
  const view = render(<Page />);
  const input = screen.getByRole("textbox");
  input.focus();
  expect(screen.getByText("7 / 12")).toBeVisible();
  expect(screen.getByText("Faltam 5 atletas para liberar")).toBeVisible();
  guide().eligibility = { ...guide().eligibility, eligiblePlayers: 8, missingPlayers: 4 };
  view.rerender(<Page />);
  expect(screen.getByText("8 / 12")).toBeVisible();
  expect(input).toHaveFocus();
  expect(input).toHaveValue("Nome preservado");
  expect(task().completed).toBe(true);
  params = "guia=FOOTBALL_PLAYERS&guiaOrigem=pagina";
  view.rerender(<Page />);
  expect(screen.getByRole("link", { name: "Continuar no Guia Interativo" })).toHaveAttribute(
    "href",
    "/admin/guia-fut7pro"
  );
});
it("hides stale eligibility during loading/errors and never fabricates zero counts", () => {
  recruit();
  state().validating = true;
  const view = render(<AdminGuideContext />);
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(screen.queryByText("7 / 10")).toBeNull();
  state().validating = false;
  state().error = new Error("offline");
  view.rerender(<AdminGuideContext />);
  expect(screen.queryByRole("progressbar")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(retry).toHaveBeenCalledTimes(1);
  state().error = null;
  guide().eligibility.eligiblePlayers = undefined;
  view.rerender(<AdminGuideContext />);
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(screen.queryByText("0 / 10")).toBeNull();
  expect(screen.getByText(/A contagem de atletas elegíveis não está disponível/)).toBeVisible();
});

it("keeps the official nine for ten active participants including a president without matches", () => {
  recruit(9);
  guide().administrator.role = "PRESIDENTE";
  guide().operationalState.activeHumanPlayers = 10;
  guide().operationalState.validMatchCount = 0;
  render(<AdminGuideContext />);
  expect(screen.getByText("9 / 10")).toBeVisible();
  expect(screen.getByText("Falta 1 atleta para liberar")).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("Reunindo jogadores");
  expect(task().completed).toBe(true);
});
