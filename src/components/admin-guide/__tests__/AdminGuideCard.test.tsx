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
  expect(screen.getByText("Pendente · Recomendado")).toBeInTheDocument();
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
