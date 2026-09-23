import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import Page from "../page";
import type { Jogador } from "@/types/jogador";

const deleteJogador = jest.fn();
const archiveJogador = jest.fn();
const restoreJogador = jest.fn();
let jogadores: Jogador[] = [];

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
    autoApproveAthletes: false,
    isLoading: false,
    isUpdating: false,
    isError: false,
    error: null,
    toggleAutoApprove: jest.fn(),
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
      expect(screen.getByText(/não pode ser excluído.*Arquive-o/i)).toBeInTheDocument();
    });
  });
});
