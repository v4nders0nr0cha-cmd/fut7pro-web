import { render, screen } from "@testing-library/react";
import { useAdmin } from "../../hooks/useAdmin";

jest.mock("../../hooks/useAdmin");

const mockUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;

const TestComponent = () => {
  const { admins, isLoading, isError, error } = useAdmin();

  if (isLoading) {
    return (
      <div data-testid="loading-state">
        <span className="animate-spin">Carregando...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div data-testid="error-state">
        {error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido"}
      </div>
    );
  }

  if (admins.length > 0) {
    return <div data-testid="success-state">Total de admins: {admins.length}</div>;
  }

  return <div data-testid="empty-state">Nenhum administrador cadastrado</div>;
};

describe("LoadingStates (useAdmin)", () => {
  beforeEach(() => {
    mockUseAdmin.mockReset();
  });

  it("exibe estado de carregamento", () => {
    mockUseAdmin.mockReturnValue({
      admins: [],
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      mutate: jest.fn(),
      addAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      deleteAdmin: jest.fn(),
      getAdminById: jest.fn(),
      getAdminsPorRole: jest.fn().mockReturnValue([]),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("exibe estado de erro", () => {
    const mockError = new Error("Falha na API");
    mockUseAdmin.mockReturnValue({
      admins: [],
      isLoading: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      mutate: jest.fn(),
      addAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      deleteAdmin: jest.fn(),
      getAdminById: jest.fn(),
      getAdminsPorRole: jest.fn().mockReturnValue([]),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("error-state")).toHaveTextContent("Erro: Falha na API");
  });

  it("exibe estado de sucesso quando existem admins", () => {
    const admins = [
      { id: "1", usuarioId: "user-1", nome: "Admin 1", role: "ADMIN" },
      { id: "2", usuarioId: "user-2", nome: "Admin 2", role: "SUPORTE" },
    ];
    mockUseAdmin.mockReturnValue({
      admins,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      mutate: jest.fn(),
      addAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      deleteAdmin: jest.fn(),
      getAdminById: jest.fn(),
      getAdminsPorRole: jest.fn().mockReturnValue(admins),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("success-state")).toHaveTextContent("Total de admins: 2");
  });

  it("exibe estado vazio quando não há dados", () => {
    mockUseAdmin.mockReturnValue({
      admins: [],
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      mutate: jest.fn(),
      addAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      deleteAdmin: jest.fn(),
      getAdminById: jest.fn(),
      getAdminsPorRole: jest.fn().mockReturnValue([]),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });
});
