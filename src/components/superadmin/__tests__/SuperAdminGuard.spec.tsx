import { render, screen } from "@testing-library/react";
import { SuperAdminGuard } from "../SuperAdminGuard";

const mockUseSession = jest.fn();
const mockSignOut = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: any[]) => mockSignOut(...args),
}));

jest.mock("@/hooks/useSessionRefreshScheduler", () => ({
  useSessionRefreshScheduler: jest.fn(),
}));

describe("SuperAdminGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          role: "SUPERADMIN",
          accessToken: "access-token",
        },
      },
      update: jest.fn(),
    });
  });

  it("mantem a tela montada durante loading transitorio depois de uma sessao valida", () => {
    const { rerender } = render(
      <SuperAdminGuard>
        <div>Conteudo SuperAdmin em edicao</div>
      </SuperAdminGuard>
    );

    expect(screen.getByText("Conteudo SuperAdmin em edicao")).toBeInTheDocument();

    mockUseSession.mockReturnValue({
      status: "loading",
      data: null,
      update: jest.fn(),
    });

    rerender(
      <SuperAdminGuard>
        <div>Conteudo SuperAdmin em edicao</div>
      </SuperAdminGuard>
    );

    expect(screen.getByText("Conteudo SuperAdmin em edicao")).toBeInTheDocument();
    expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
  });

  it("mantem a tela montada durante reconexao depois de uma sessao valida", () => {
    const { rerender } = render(
      <SuperAdminGuard>
        <div>Formulario SuperAdmin preservado</div>
      </SuperAdminGuard>
    );

    mockUseSession.mockReturnValue({
      status: "unauthenticated",
      data: null,
      update: jest.fn().mockResolvedValue({
        user: {
          role: "SUPERADMIN",
          accessToken: "access-token",
        },
      }),
    });

    rerender(
      <SuperAdminGuard>
        <div>Formulario SuperAdmin preservado</div>
      </SuperAdminGuard>
    );

    expect(screen.getByText("Formulario SuperAdmin preservado")).toBeInTheDocument();
    expect(
      screen.getByText("Reconectando sua sessão SuperAdmin em segundo plano")
    ).toBeInTheDocument();
    expect(screen.queryByText("Validando sessao do SuperAdmin...")).not.toBeInTheDocument();
  });

  it("bloqueia render inicial antes da primeira sessao SuperAdmin valida", () => {
    mockUseSession.mockReturnValue({
      status: "loading",
      data: null,
      update: jest.fn(),
    });

    render(
      <SuperAdminGuard>
        <div>Conteudo protegido</div>
      </SuperAdminGuard>
    );

    expect(screen.queryByText("Conteudo protegido")).not.toBeInTheDocument();
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("bloqueia conteudo apos falha fatal de token mesmo depois de sessao valida", () => {
    const { rerender } = render(
      <SuperAdminGuard>
        <div>Operacao SuperAdmin sensivel</div>
      </SuperAdminGuard>
    );

    expect(screen.getByText("Operacao SuperAdmin sensivel")).toBeInTheDocument();

    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: {
        user: {
          role: "SUPERADMIN",
          accessToken: "access-token",
          tokenError: "RefreshAccessTokenError",
        },
      },
      update: jest.fn(),
    });

    rerender(
      <SuperAdminGuard>
        <div>Operacao SuperAdmin sensivel</div>
      </SuperAdminGuard>
    );

    expect(screen.queryByText("Operacao SuperAdmin sensivel")).not.toBeInTheDocument();
    expect(
      screen.getByText("Acesso restrito ao SuperAdmin. Redirecionando...")
    ).toBeInTheDocument();
  });
});
