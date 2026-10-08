import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type React from "react";
import Page from "../page";
import type { Jogador } from "@/types/jogador";

const deleteJogador = jest.fn();
const archiveJogador = jest.fn();
const restoreJogador = jest.fn();
const toggleAutoApprove = jest.fn();
let jogadores: Jogador[] = [];
let autoApproveAthletes = false;
let autoApproveAthletesUntil: string | null = null;

jest.mock(
  "next/head",
  () =>
    function HeadMock({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
    }
);
jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: (_target, element: string) => {
        function MotionMock({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
          const Component = element as React.ElementType;
          return <Component {...props}>{children}</Component>;
        }
        return MotionMock;
      },
    }
  ),
}));
jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ rachaId: "tenant-1", tenantSlug: "racha-1" }),
}));
jest.mock("@/hooks/useJogadores", () => ({
  useJogadores: () => ({
    jogadores,
    isLoading: false,
    isError: false,
    error: null,
    deleteJogador,
    archiveJogador,
    restoreJogador,
    mutate: jest.fn(),
    addJogador: jest.fn(),
    updateJogador: jest.fn(),
  }),
}));
jest.mock("@/hooks/useAthleteRequests", () => ({
  useAthleteRequests: () => ({
    solicitacoes: [],
    isLoading: false,
    isError: false,
    error: null,
    approve: jest.fn(),
    reject: jest.fn(),
  }),
}));
jest.mock("@/hooks/useAutoApproveAthletes", () => ({
  useAutoApproveAthletes: () => ({
    autoApproveAthletes,
    autoApproveAthletesUntil,
    isLoading: false,
    isUpdating: false,
    isError: false,
    error: null,
    toggleAutoApprove,
  }),
}));
jest.mock(
  "@/components/admin/JogadorForm",
  () =>
    function JogadorFormMock() {
      return <div>Formulário</div>;
    }
);
jest.mock(
  "@/components/ui/AvatarFut7Pro",
  () =>
    function AvatarMock() {
      return <div data-testid="avatar" />;
    }
);

function atleta(overrides: Partial<Jogador> = {}): Jogador {
  return {
    id: "athlete-1",
    nome: "João",
    apelido: "Joca",
    email: "",
    posicao: "Meia",
    avatar: "",
    status: "Ativo",
    mensalista: false,
    timeId: "",
    managedByGlobalProfile: false,
    isAdministrativeMember: false,
    archivedAt: null,
    hasHistoricalUsage: false,
    canDelete: true,
    ...overrides,
  };
}

describe("Gerenciar jogadores - lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    autoApproveAthletes = false;
    autoApproveAthletesUntil = null;
    deleteJogador.mockResolvedValue({ id: "athlete-1" });
    archiveJogador.mockResolvedValue({ id: "athlete-1" });
    restoreJogador.mockResolvedValue({ id: "athlete-1" });
  });

  it("oferece Excluir somente quando canDelete=true e não há histórico", () => {
    jogadores = [atleta()];
    render(<Page />);

    expect(screen.getByRole("button", { name: "Excluir João" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Arquivar João" })).not.toBeInTheDocument();
  });

  it("oferece Arquivar e nunca hard delete para atleta histórico", () => {
    jogadores = [atleta({ hasHistoricalUsage: true, canDelete: false })];
    render(<Page />);

    expect(screen.getByRole("button", { name: "Arquivar João" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir João" })).not.toBeInTheDocument();
  });

  it("explica a preservação histórica no modal de arquivamento", () => {
    jogadores = [atleta({ hasHistoricalUsage: true, canDelete: false })];
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Arquivar João" }));

    expect(screen.getByRole("heading", { name: "Arquivar jogador" })).toBeInTheDocument();
    expect(
      screen.getByText(/preservar partidas, rankings, conquistas e estatísticas/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/removido de todos os rankings/i)).not.toBeInTheDocument();
  });

  it("mostra Restaurar na aba de arquivados", () => {
    jogadores = [
      atleta({
        archivedAt: "2026-09-23T10:00:00.000Z",
        hasHistoricalUsage: true,
        canDelete: false,
      }),
    ];
    render(<Page />);
    fireEvent.click(screen.getByRole("tab", { name: /Arquivados/ }));

    expect(screen.getByRole("button", { name: "Restaurar João" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir João" })).not.toBeInTheDocument();
  });

  it("mostra feedback compreensível quando o backend recusa hard delete", async () => {
    jogadores = [atleta()];
    deleteJogador.mockRejectedValue(
      new Error(
        "Este jogador já possui histórico no racha e não pode ser excluído. Arquive-o para preservar o histórico."
      )
    );
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir João" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir jogador" }));

    await waitFor(() => {
      const modal = screen.getByRole("dialog", { name: "Excluir jogador definitivamente" });
      expect(within(modal).getByText(/não pode ser excluído.*Arquive-o/i)).toBeInTheDocument();
      expect(within(modal).getByRole("button", { name: "Excluir jogador" })).toBeEnabled();
    });
    expect(screen.getByRole("button", { name: "Excluir João" })).toBeInTheDocument();
  });

  it("mantem o erro e o retry visiveis dentro do modal de arquivamento", async () => {
    jogadores = [atleta({ hasHistoricalUsage: true, canDelete: false })];
    archiveJogador.mockRejectedValue(new Error("Não foi possível arquivar este jogador agora."));
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Arquivar João" }));
    fireEvent.click(screen.getByRole("button", { name: "Arquivar jogador" }));

    await waitFor(() => {
      const modal = screen.getByRole("dialog", { name: "Arquivar jogador" });
      expect(
        within(modal).getByText("Não foi possível arquivar este jogador agora.")
      ).toBeInTheDocument();
      expect(within(modal).getByRole("button", { name: "Arquivar jogador" })).toBeEnabled();
    });
  });
});

describe("Gerenciar jogadores - apresentação dos cards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    autoApproveAthletes = false;
    autoApproveAthletesUntil = null;
  });

  it("ordena os quatro cargos pela hierarquia antes dos jogadores comuns", () => {
    jogadores = [
      atleta({ id: "player", nome: "Jogador comum", apelido: "" }),
      atleta({
        id: "legacy-admin",
        nome: "Role técnica ADMIN",
        apelido: "",
        membershipRole: "ADMIN",
      }),
      atleta({
        id: "finance",
        nome: "Diretor financeiro",
        apelido: "",
        membershipRole: "DIRETOR_FINANCEIRO",
        isAdministrativeMember: true,
      }),
      atleta({
        id: "football",
        nome: "Diretor de futebol",
        apelido: "",
        membershipRole: "DIRETOR_FUTEBOL",
        isAdministrativeMember: true,
      }),
      atleta({
        id: "vice",
        nome: "Vice",
        apelido: "",
        membershipRole: "VICE_PRESIDENTE",
        isAdministrativeMember: true,
      }),
      atleta({
        id: "president",
        nome: "Presidente",
        apelido: "",
        membershipRole: "PRESIDENTE",
        isAdministrativeMember: true,
      }),
      atleta({
        id: "platform-admin",
        nome: "Role técnica SUPERADMIN",
        apelido: "",
        membershipRole: "SUPERADMIN",
      }),
    ];

    render(<Page />);

    expect(
      screen.getAllByTestId(/^jogador-card-/).map((card) => card.getAttribute("data-testid"))
    ).toEqual([
      "jogador-card-president",
      "jogador-card-vice",
      "jogador-card-football",
      "jogador-card-finance",
      "jogador-card-player",
      "jogador-card-legacy-admin",
      "jogador-card-platform-admin",
    ]);
  });

  it.each([
    ["PRESIDENTE", "Presidente"],
    ["VICE_PRESIDENTE", "Vice-presidente"],
    ["DIRETOR_FUTEBOL", "Diretor de Futebol"],
    ["DIRETOR_FINANCEIRO", "Diretor Financeiro"],
  ])("simplifica o card administrativo de %s", (membershipRole, cargo) => {
    jogadores = [
      atleta({
        id: "admin",
        nome: "Felipe",
        membershipRole,
        isAdministrativeMember: true,
        managedByGlobalProfile: true,
        userId: "user-1",
        mensalista: true,
      }),
    ];

    render(<Page />);

    const card = screen.getByTestId("jogador-card-admin");
    expect(within(card).getByText(cargo)).toBeInTheDocument();
    expect(within(card).queryByText("Ativo")).not.toBeInTheDocument();
    expect(within(card).queryByText("Mensalista")).not.toBeInTheDocument();
    expect(within(card).queryByText(/^(Com|Sem) login$/)).not.toBeInTheDocument();
    expect(
      within(card).queryByRole("button", { name: /Excluir|Arquivar|Restaurar/ })
    ).not.toBeInTheDocument();
  });

  it("mantém os indicadores operacionais no card de jogador comum", () => {
    jogadores = [
      atleta({
        id: "player",
        mensalista: true,
        managedByGlobalProfile: true,
        userId: "user-1",
      }),
    ];

    render(<Page />);

    const card = screen.getByTestId("jogador-card-player");
    expect(within(card).queryByText("Ativo")).not.toBeInTheDocument();
    expect(within(card).getByText("Mensalista")).toBeInTheDocument();
    expect(within(card).getByText("Com login")).toBeInTheDocument();
  });

  it.each([
    ["ADMIN", "Administrador"],
    ["SUPERADMIN", "Superadmin"],
  ])(
    "%s não vira cargo visível e continua protegido de ações de gestão do atleta",
    (membershipRole, cargoInexistente) => {
      jogadores = [
        atleta({
          id: "technical-role",
          nome: "Pessoa protegida",
          apelido: "",
          membershipRole,
          mensalista: true,
          canDelete: true,
          hasHistoricalUsage: false,
        }),
      ];

      render(<Page />);

      const card = screen.getByTestId("jogador-card-technical-role");
      expect(within(card).queryByText(cargoInexistente)).not.toBeInTheDocument();
      expect(within(card).queryByText("Ativo")).not.toBeInTheDocument();
      expect(within(card).getByText("Mensalista")).toBeInTheDocument();
      expect(within(card).getByText("Sem login")).toBeInTheDocument();
      expect(
        within(card).queryByRole("button", { name: /Vincular|Editar/ })
      ).not.toBeInTheDocument();
      expect(
        within(card).queryByRole("button", { name: /Excluir|Arquivar|Restaurar/ })
      ).not.toBeInTheDocument();
    }
  );

  it.each(["ADMIN", "SUPERADMIN"])(
    "%s técnico não recebe ação de restauração quando está arquivado",
    (membershipRole) => {
      jogadores = [
        atleta({
          id: "technical-role",
          nome: "Pessoa protegida",
          membershipRole,
          archivedAt: "2026-10-08T10:00:00.000Z",
          canDelete: false,
          hasHistoricalUsage: true,
        }),
      ];

      render(<Page />);
      fireEvent.click(screen.getByRole("tab", { name: /Arquivados/ }));

      const card = screen.getByTestId("jogador-card-technical-role");
      expect(
        within(card).queryByRole("button", { name: /Editar|Restaurar/ })
      ).not.toBeInTheDocument();
    }
  );

  it("remove os textos técnicos de gerenciamento da interface", () => {
    jogadores = [
      atleta({
        membershipRole: "PRESIDENTE",
        isAdministrativeMember: true,
        managedByGlobalProfile: true,
        userId: "user-1",
      }),
    ];

    render(<Page />);

    expect(screen.queryByText("Gerenciado pelo Perfil Global")).not.toBeInTheDocument();
    expect(screen.queryByText("Gerenciado pelo módulo de administração")).not.toBeInTheDocument();
  });

  it("mantém jogador com login sem edição de identidade", () => {
    jogadores = [
      atleta({
        id: "player-with-login",
        managedByGlobalProfile: true,
        userId: "user-1",
        hasHistoricalUsage: true,
        canDelete: false,
      }),
    ];

    render(<Page />);

    const card = screen.getByTestId("jogador-card-player-with-login");
    expect(within(card).getByText("Com login")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /Editar/ })).not.toBeInTheDocument();
    expect(within(card).getByRole("button", { name: "Arquivar João" })).toBeInTheDocument();
  });
});

describe("Gerenciar jogadores - ajuda e aprovação automática", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    jogadores = [];
    autoApproveAthletes = false;
    autoApproveAthletesUntil = null;
    toggleAutoApprove.mockResolvedValue(undefined);
    process.env.NEXT_PUBLIC_APP_URL = "https://preview.fut7pro.test/";
  });

  afterAll(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
  });

  it("mantém a ajuda fechada por padrão e explica as ações em linguagem de grupo", () => {
    render(<Page />);

    expect(
      screen.queryByRole("heading", { name: "Cadastro pelo próprio jogador" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Como funciona o cadastro de jogadores/ }));

    const help = document.getElementById("cadastro-jogadores-help")!;
    expect(within(help).getByRole("heading", { name: "Cadastrar Jogador" })).toBeInTheDocument();
    expect(within(help).getByRole("heading", { name: "Vincular" })).toBeInTheDocument();
    expect(within(help).getByRole("heading", { name: "Arquivar" })).toBeInTheDocument();
    expect(within(help).getByRole("heading", { name: "Excluir" })).toBeInTheDocument();
    expect(within(help).getByText("Site do seu grupo")).toBeInTheDocument();
    expect(within(help).queryByText(/seu racha/i)).not.toBeInTheDocument();
  });

  it("monta e expõe o site clicável do grupo usando tenantSlug", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /Como funciona o cadastro de jogadores/ }));

    expect(screen.getByText("preview.fut7pro.test/racha-1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir site do grupo" })).toHaveAttribute(
      "href",
      "https://preview.fut7pro.test/racha-1"
    );
    expect(screen.getByRole("button", { name: "Copiar link" })).toBeInTheDocument();
  });

  it("confirma a ativação por 24 horas", async () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "Ativar por 24 horas" }));

    const modalTitle = screen.getByRole("heading", { name: "Ativar por 24 horas?" });
    expect(modalTitle).toBeInTheDocument();
    expect(screen.getByText(/Durante as próximas 24 horas/)).toBeInTheDocument();
    fireEvent.click(
      within(modalTitle.parentElement!).getByRole("button", { name: "Ativar por 24 horas" })
    );

    await waitFor(() => expect(toggleAutoApprove).toHaveBeenCalledWith(true));
  });

  it("mostra a expiração e permite desativar imediatamente", async () => {
    autoApproveAthletes = true;
    autoApproveAthletesUntil = "2026-10-09T13:30:00.000Z";
    render(<Page />);

    expect(screen.getByText("Aprovação automática ativa")).toBeInTheDocument();
    expect(screen.getByText(/Depois disso, a aprovação manual volta a valer/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Desativar agora" }));

    await waitFor(() => expect(toggleAutoApprove).toHaveBeenCalledWith(false));
  });
});
