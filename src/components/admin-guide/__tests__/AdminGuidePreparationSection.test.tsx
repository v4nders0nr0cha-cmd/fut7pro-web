import { fireEvent, render, screen } from "@testing-library/react";
import AdminGuidePreparationSection from "../AdminGuidePreparationSection";
import type { AdminGuideData, AdminGuideTask } from "@/types/admin-guide";

const tasks: AdminGuideTask[] = [
  {
    id: "PUBLIC_SITE",
    title: "Conheça o site da sua pelada",
    requirement: "OPTIONAL",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/",
  },
  {
    id: "IDENTITY",
    title: "Personalize a identidade visual",
    requirement: "RECOMMENDED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/personalizacao/identidade-visual",
  },
  {
    id: "SCHEDULE",
    title: "Configure os dias e horários",
    requirement: "RECOMMENDED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/proximos-rachas",
  },
  {
    id: "ACTIVE_PLAYERS",
    title: "Traga seus primeiros jogadores",
    requirement: "REQUIRED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/jogadores/listar-cadastrar",
  },
  {
    id: "OFFICIAL_TEAMS",
    title: "Cadastre os times oficiais",
    requirement: "REQUIRED",
    completed: false,
    canAct: true,
    applicable: true,
    route: "/admin/partidas/criar-times",
  },
];

function makeGuide({
  slug = "seu-racha",
  completed = [],
  players = 0,
  teams = 0,
  agenda = false,
  identity = false,
  capabilities = {},
}: {
  slug?: string;
  completed?: string[];
  players?: number;
  teams?: number;
  agenda?: boolean;
  identity?: boolean;
  capabilities?: Record<string, boolean>;
} = {}): AdminGuideData {
  return {
    guideVersion: 1,
    tenant: { id: slug, slug, name: slug },
    administrator: { membershipId: slug, role: "PRESIDENTE", status: "APROVADO" },
    capabilities: { configureIdentity: true, configureTheme: true, ...capabilities },
    pedagogicalState: {
      revision: 0,
      knownTips: [],
      dismissedTips: [],
      snoozedTips: {},
      viewedResources: [],
    },
    pedagogicalStateUpdatedAt: null,
    operationalState: {
      activeHumanPlayers: players,
      activeOfficialTeams: teams,
      agendaConfigured: agenda,
      identityConfigured: identity,
    },
    tasks: tasks.map((task) => ({ ...task, completed: completed.includes(task.id) })),
    activationProgress: { completed: 0, total: 5, percentage: 0, complete: false },
    nextAction: null,
    laterRecommendations: [],
    notices: { identityAuthorization: "", sorteioPublication: "" },
  };
}

const onPublicSiteOpen = jest.fn();

beforeEach(() => jest.clearAllMocks());

it("orienta uma pelada nova sem jogadores, times, agenda ou identidade personalizada", () => {
  render(<AdminGuidePreparationSection guide={makeGuide()} onPublicSiteOpen={onPublicSiteOpen} />);
  expect(screen.getByRole("heading", { name: "Prepare seu grupo" })).toBeInTheDocument();
  expect(screen.getByText(/Você ainda não possui jogadores ativos/)).toBeInTheDocument();
  expect(screen.getByText(/0 times oficiais ativos/)).toBeInTheDocument();
  expect(screen.getByText(/identidade visual ainda usa a configuração padrão/)).toBeInTheDocument();
  expect(screen.getByText(/agenda habitual ainda não foi cadastrada/)).toBeInTheDocument();
  expect(screen.getAllByText("Necessário para preparar jogos")).toHaveLength(2);
});

it("reconhece jogadores, dois times, agenda e identidade já configurados sem exigir refazer etapas", () => {
  render(
    <AdminGuidePreparationSection
      guide={makeGuide({
        completed: ["ACTIVE_PLAYERS", "OFFICIAL_TEAMS", "SCHEDULE", "IDENTITY"],
        players: 8,
        teams: 2,
        agenda: true,
        identity: true,
      })}
      onPublicSiteOpen={onPublicSiteOpen}
    />
  );
  expect(screen.getByText(/8 jogadores ativos neste grupo/)).toBeInTheDocument();
  expect(screen.getByText(/2 times oficiais ativos neste grupo/)).toBeInTheDocument();
  expect(screen.getByText(/identidade visual já foi personalizada/)).toBeInTheDocument();
  expect(screen.getByText(/agenda habitual já está cadastrada/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Gerenciar Times" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar-times"
  );
});

it("direciona para o cadastro real de horários e para as páginas oficiais de jogadores e times", () => {
  render(
    <AdminGuidePreparationSection
      guide={makeGuide({ players: 1, teams: 1 })}
      onPublicSiteOpen={onPublicSiteOpen}
    />
  );
  expect(screen.getByText(/1 jogador ativo neste grupo/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Configurar horários" })).toHaveAttribute(
    "href",
    "/admin/rachas"
  );
  expect(screen.getByRole("link", { name: "Gerenciar jogadores" })).toHaveAttribute(
    "href",
    "/admin/jogadores/listar-cadastrar"
  );
  expect(screen.getByRole("link", { name: "Gerenciar Times" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar-times"
  );
});

it("oferece ao Vice apenas a personalização de tema quando essa é sua capacidade", () => {
  const guide = makeGuide({ capabilities: { configureIdentity: false, configureTheme: true } });
  guide.tasks = guide.tasks.map((task) =>
    task.id === "IDENTITY" ? { ...task, canAct: false, applicable: false } : task
  );
  render(<AdminGuidePreparationSection guide={guide} onPublicSiteOpen={onPublicSiteOpen} />);
  expect(screen.getByRole("link", { name: "Personalizar tema" })).toHaveAttribute(
    "href",
    "/admin/personalizacao/visual-temas"
  );
  expect(screen.queryByRole("link", { name: "Personalizar identidade" })).not.toBeInTheDocument();
});

it("não oferece botões de edição a quem só pode consultar o estado da pelada", () => {
  const guide = makeGuide({ capabilities: { configureIdentity: false, configureTheme: false } });
  guide.tasks = guide.tasks.map((task) =>
    task.id === "PUBLIC_SITE" ? task : { ...task, canAct: false, applicable: false }
  );
  render(<AdminGuidePreparationSection guide={guide} onPublicSiteOpen={onPublicSiteOpen} />);
  expect(screen.getByRole("link", { name: "Ver meu site" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Gerenciar jogadores" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Gerenciar Times" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Configurar horários" })).not.toBeInTheDocument();
  expect(screen.getAllByText(/Sua função não permite realizar esta configuração/)).toHaveLength(4);
});

it("abre o site da pelada ativa em outra aba e registra a visita apenas no clique", () => {
  const { rerender } = render(
    <AdminGuidePreparationSection guide={makeGuide()} onPublicSiteOpen={onPublicSiteOpen} />
  );
  const first = screen.getByRole("link", { name: "Ver meu site" });
  expect(first).toHaveAttribute("href", "/seu-racha");
  expect(first).toHaveAttribute("target", "_blank");
  expect(onPublicSiteOpen).not.toHaveBeenCalled();
  rerender(
    <AdminGuidePreparationSection
      guide={makeGuide({ slug: "outra-pelada" })}
      onPublicSiteOpen={onPublicSiteOpen}
    />
  );
  const second = screen.getByRole("link", { name: "Ver meu site" });
  expect(second).toHaveAttribute("href", "/outra-pelada");
  fireEvent.click(second);
  expect(onPublicSiteOpen).toHaveBeenCalledTimes(1);
});

it("mantém explicações sobre jogadores e times disponíveis sob demanda", () => {
  render(<AdminGuidePreparationSection guide={makeGuide()} onPublicSiteOpen={onPublicSiteOpen} />);
  expect(
    screen.getByText(/Solicitações pendentes não contam como jogadores ativos/)
  ).toBeInTheDocument();
  expect(screen.getByText(/Times oficiais são cadastrados em Gerenciar Times/)).toBeInTheDocument();
  expect(screen.getAllByText("Saiba mais")).toHaveLength(5);
});

it("reflete o novo estado operacional recebido após a revalidação do Guia", () => {
  const { rerender } = render(
    <AdminGuidePreparationSection guide={makeGuide()} onPublicSiteOpen={onPublicSiteOpen} />
  );
  expect(screen.getByText(/Você ainda não possui jogadores ativos/)).toBeInTheDocument();
  rerender(
    <AdminGuidePreparationSection
      guide={makeGuide({ completed: ["ACTIVE_PLAYERS", "OFFICIAL_TEAMS"], players: 3, teams: 2 })}
      onPublicSiteOpen={onPublicSiteOpen}
    />
  );
  expect(screen.getByText(/3 jogadores ativos neste grupo/)).toBeInTheDocument();
  expect(screen.getByText(/2 times oficiais ativos neste grupo/)).toBeInTheDocument();
  expect(screen.queryByText(/Você ainda não possui jogadores ativos/)).not.toBeInTheDocument();
});
