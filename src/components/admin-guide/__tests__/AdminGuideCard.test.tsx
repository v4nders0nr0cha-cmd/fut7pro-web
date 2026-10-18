import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminGuideCard from "../AdminGuideCard";
import AdminGuideClient from "@/app/(admin)/admin/guia-fut7pro/AdminGuideClient";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import type { AdminGuideData } from "@/types/admin-guide";

jest.mock("@/hooks/useAdminGuide", () => ({ useAdminGuide: jest.fn() }));

const guide: AdminGuideData = {
  guideVersion: 1,
  tenant: { id: "tenant-1", slug: "seu-racha", name: "Seu Racha" },
  administrator: { membershipId: "membership-1", role: "PRESIDENTE", status: "APROVADO" },
  capabilities: { manageOfficialTeams: true },
  pedagogicalState: {
    revision: 0,
    knownTips: [],
    dismissedTips: [],
    snoozedTips: {},
    viewedResources: [],
  },
  pedagogicalStateUpdatedAt: null,
  operationalState: {},
  tasks: [
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
      id: "MATCHES_FINISHED",
      title: "Finalize oficialmente as partidas",
      requirement: "RECOMMENDED",
      completed: false,
      canAct: true,
      applicable: true,
      route: "/admin/partidas/resultados-do-dia",
    },
  ],
  activationProgress: { completed: 1, total: 5, percentage: 20, complete: false },
  nextAction: {
    taskId: "OFFICIAL_TEAMS",
    title: "Cadastre os times oficiais",
    route: "/admin/partidas/criar-times",
  },
  laterRecommendations: [],
  notices: { identityAuthorization: "", sorteioPublication: "" },
};

const update = jest.fn().mockResolvedValue(true);
const retry = jest.fn();
const mockedHook = useAdminGuide as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedHook.mockReturnValue({
    guide,
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
});

it("mostra progresso real e a rota oficial no card", () => {
  render(<AdminGuideCard />);
  expect(screen.getByText(/etapas concluídas/)).toHaveTextContent("1 de 5 etapas concluídas");
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "20");
  expect(screen.getByRole("link", { name: "Continuar configuração" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar-times"
  );
  expect(screen.getByRole("link", { name: "Ver meu Guia" })).toHaveAttribute(
    "href",
    "/admin/guia-fut7pro"
  );
});

it("mostra o primeiro jogo na seção própria sem duplicar a tarefa genérica", () => {
  mockedHook.mockReturnValue({
    guide: {
      ...guide,
      capabilities: { manageMatchesAndResults: true },
      tasks: [
        ...guide.tasks,
        {
          id: "FIRST_MATCHDAY",
          title: "Prepare o primeiro jogo",
          requirement: "REQUIRED",
          completed: false,
          canAct: true,
          applicable: true,
          route: "/admin/partidas/criar",
        },
      ],
      nextAction: {
        taskId: "FIRST_MATCHDAY",
        title: "Prepare o primeiro jogo",
        route: "/admin/partidas/criar",
      },
    },
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideClient />);
  expect(screen.getByText("Momento 2/2")).toBeInTheDocument();
  expect(screen.getAllByRole("heading", { name: "Primeiro jogo preparado" })).toHaveLength(1);
  expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar"
  );
});

it("leva do card e da página do Guia à configuração editável de horários", () => {
  const scheduleTask = {
    ...guide.tasks[0],
    id: "SCHEDULE",
    title: "Configure os dias e horários",
    requirement: "RECOMMENDED" as const,
    route: "/admin/partidas/proximos-rachas",
  };
  mockedHook.mockReturnValue({
    guide: {
      ...guide,
      tasks: [scheduleTask],
      nextAction: {
        taskId: scheduleTask.id,
        title: scheduleTask.title,
        route: scheduleTask.route,
      },
    },
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
  const card = render(<AdminGuideCard />);
  expect(screen.getByRole("link", { name: "Continuar configuração" })).toHaveAttribute(
    "href",
    "/admin/rachas"
  );
  card.unmount();
  render(<AdminGuideClient />);
  expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute("href", "/admin/rachas");
});

it("mostra carregamento sem bloquear o restante do painel", () => {
  mockedHook.mockReturnValue({ guide: null, loading: true, error: null, retry, update });
  render(<AdminGuideCard />);
  expect(screen.getByRole("status")).toHaveTextContent("Carregando seu progresso");
});

it("não registra boas-vindas ao renderizar, mas persiste após a escolha", async () => {
  render(<AdminGuideCard />);
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
  await waitFor(() => expect(update).toHaveBeenCalledWith({ action: "WELCOME_SEEN" }));
});

it("não oferece ação quando o cargo não pode executá-la", () => {
  mockedHook.mockReturnValue({
    guide: {
      ...guide,
      administrator: { ...guide.administrator, role: "DIRETOR_FINANCEIRO" },
      tasks: [{ ...guide.tasks[0], canAct: false }],
      nextAction: null,
    },
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideCard />);
  expect(screen.queryByRole("link", { name: "Continuar configuração" })).not.toBeInTheDocument();
  expect(screen.getByText(/Nenhuma ação disponível/)).toBeInTheDocument();
});

it("mantém a finalização oficial como orientação recomendada após 100%", () => {
  mockedHook.mockReturnValue({
    guide: {
      ...guide,
      pedagogicalState: { ...guide.pedagogicalState, welcomeSeenAt: "2026-10-16T00:00:00Z" },
      activationProgress: { completed: 5, total: 5, percentage: 100, complete: true },
      nextAction: null,
    },
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideClient />);
  expect(screen.getByText("5 de 5 etapas concluídas.")).toBeInTheDocument();
  expect(screen.getByText("Finalize oficialmente as partidas")).toBeInTheDocument();
  expect(screen.getByText(/Recomendado · A finalização oficial é recomendada/)).toBeInTheDocument();
  expect(screen.getByText("Sua pelada concluiu a jornada inicial!")).toBeInTheDocument();
  expect(
    screen.getByText(
      "Sua jornada inicial está concluída. Você pode consultar o Guia quando quiser."
    )
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Explore mais recursos do Fut7Pro" })
  ).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Outros recursos" })).not.toBeInTheDocument();
  fireEvent.click(
    screen.getAllByRole("link", { name: "Assistir tutorial (YouTube, nova aba)" })[0]
  );
  expect(screen.getByText("5 de 5 etapas concluídas.")).toBeInTheDocument();
  expect(update).toHaveBeenCalledWith({
    action: "RESOURCE_VIEWED",
    resourceId: "VIDEO_SORTEIO_INTELIGENTE",
  });
});

it("mantém a ativação concluída com revisão pendente em outra rodada, sem alterar dados ao abrir o Histórico", () => {
  mockedHook.mockReturnValue({
    guide: {
      ...guide,
      capabilities: { manageMatchesAndResults: true, publishChampion: true },
      pedagogicalState: { ...guide.pedagogicalState, welcomeSeenAt: "2026-10-16T00:00:00Z" },
      operationalState: {
        validMatchCount: 4,
        hasMatchdayWithAllResults: true,
        championPublished: true,
        championAwaitingReview: true,
      },
      tasks: [
        ...guide.tasks,
        {
          id: "CHAMPION_PUBLISHED",
          title: "Publique o Time Campeão do Dia",
          requirement: "REQUIRED",
          completed: true,
          canAct: true,
          applicable: true,
          route: "/admin/partidas/time-campeao-do-dia",
        },
      ],
      activationProgress: { completed: 5, total: 5, percentage: 100, complete: true },
      nextAction: null,
    },
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideClient />);
  expect(screen.getByText("5 de 5 etapas concluídas.")).toBeInTheDocument();
  const reviewLink = screen.getByRole("link", { name: "Localizar publicação para revisão" });
  expect(reviewLink).toHaveAttribute("href", "/admin/partidas/historico");
  fireEvent.click(reviewLink);
  expect(update).not.toHaveBeenCalled();
});

it("mostra os marcos pós-jogo uma única vez na seção própria", () => {
  mockedHook.mockReturnValue({
    guide: {
      ...guide,
      capabilities: { manageMatchesAndResults: true, publishChampion: true },
      operationalState: {
        validMatchCount: 2,
        hasMatchdayWithAllResults: true,
        hasOfficiallyFinishedMatchday: false,
        championPublished: false,
        championAwaitingReview: false,
      },
      tasks: [
        ...guide.tasks,
        {
          id: "RESULTS_RECORDED",
          title: "Registre os resultados",
          requirement: "REQUIRED",
          completed: true,
          canAct: true,
          applicable: true,
          route: "/admin/partidas/resultados-do-dia",
        },
        {
          id: "CHAMPION_PUBLISHED",
          title: "Publique o Time Campeão do Dia",
          requirement: "REQUIRED",
          completed: false,
          canAct: true,
          applicable: true,
          route: "/admin/partidas/time-campeao-do-dia",
        },
      ],
      nextAction: {
        taskId: "CHAMPION_PUBLISHED",
        title: "Publique o Time Campeão do Dia",
        route: "/admin/partidas/time-campeao-do-dia",
      },
    },
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideClient />);
  expect(screen.getAllByRole("heading", { name: "Registre os resultados" })).toHaveLength(1);
  expect(screen.getAllByRole("heading", { name: "Publique o Time Campeão do Dia" })).toHaveLength(
    1
  );
  expect(
    screen.queryByRole("heading", { name: "Próximas etapas da ativação" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
    "href",
    "/admin/partidas/time-campeao-do-dia"
  );
});

it("mostra progresso em cache e aviso discreto quando a revalidação falha", () => {
  mockedHook.mockReturnValue({
    guide,
    loading: false,
    error: Object.assign(new Error("Indisponível"), { status: 503 }),
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideCard />);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "20");
  expect(screen.getByRole("link", { name: "Continuar configuração" })).toBeInTheDocument();
  expect(screen.getByText(/As informações anteriores continuam disponíveis/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(retry).toHaveBeenCalled();
});

it("não exibe progresso protegido depois de revogação", () => {
  mockedHook.mockReturnValue({
    guide: null,
    loading: false,
    error: Object.assign(new Error("Acesso negado"), { status: 403 }),
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideClient />);
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(screen.getByText(/somente para administradores aprovados/)).toBeInTheDocument();
});

it("mostra falha discreta sem bloquear o painel", () => {
  mockedHook.mockReturnValue({
    guide: null,
    loading: false,
    error: new Error("indisponível"),
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideCard />);
  expect(screen.getByText("Não foi possível carregar o Guia Fut7Pro agora.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(retry).toHaveBeenCalled();
});

it("abre o site da pelada correta e registra a orientação pedagógica", () => {
  mockedHook.mockReturnValue({
    guide: {
      ...guide,
      nextAction: {
        taskId: "PUBLIC_SITE",
        title: "Conheça o site da sua pelada",
        route: "/",
      },
      tasks: [
        {
          id: "PUBLIC_SITE",
          title: "Conheça o site da sua pelada",
          requirement: "OPTIONAL",
          completed: false,
          canAct: true,
          applicable: true,
          route: "/",
        },
      ],
    },
    loading: false,
    error: null,
    actionError: null,
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideCard />);
  const link = screen.getByRole("link", { name: "Continuar configuração" });
  expect(link).toHaveAttribute("href", "/seu-racha");
  expect(link).toHaveAttribute("target", "_blank");
  fireEvent.click(link);
  expect(update).toHaveBeenCalledWith({ action: "PUBLIC_SITE_OPENED" });
});

it("orienta novamente após conflito de revisão", () => {
  mockedHook.mockReturnValue({
    guide,
    loading: false,
    error: null,
    actionError: Object.assign(new Error("Conflito"), { status: 409 }),
    updating: false,
    retry,
    update,
  });
  render(<AdminGuideCard />);
  expect(screen.getByRole("alert")).toHaveTextContent("Confira o estado atualizado");
});
