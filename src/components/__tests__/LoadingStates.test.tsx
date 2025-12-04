import { render, screen } from "@testing-library/react";
import { useAdmin } from "@/hooks/useAdmin";

jest.mock("@/hooks/useAdmin");

const mockedUseAdmin = useAdmin as jest.MockedFunction<typeof useAdmin>;

const TestComponent = () => {
  const { admins, isLoading, isError, error } = useAdmin();

  if (isLoading) {
    return (
      <div data-testid="loading-state">
        <span>Carregando...</span>
      </div>
    );
  }

  if (isError) {
    const message = error ? String(error) : "Erro desconhecido";
    return (
      <div data-testid="error-state">
        <span>{message}</span>
      </div>
    );
  }

  if (admins.length > 0) {
    return (
      <div data-testid="success-state">
        <span>{admins[0].nome ?? "Admin"}</span>
      </div>
    );
  }

  return (
    <div data-testid="empty-state">
      <span>Sem dados</span>
    </div>
  );
};

describe("LoadingStates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exibe estado de loading", () => {
    mockedUseAdmin.mockReturnValue({
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
      getAdminsPorRole: jest.fn(),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("exibe erro quando a busca falha", () => {
    mockedUseAdmin.mockReturnValue({
      admins: [],
      isLoading: false,
      isError: true,
      error: "Falha ao carregar",
      isSuccess: false,
      mutate: jest.fn(),
      addAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      deleteAdmin: jest.fn(),
      getAdminById: jest.fn(),
      getAdminsPorRole: jest.fn(),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("error-state")).toHaveTextContent("Falha ao carregar");
  });

  it("exibe sucesso quando existem admins", () => {
    mockedUseAdmin.mockReturnValue({
      admins: [{ id: "1", usuarioId: "u1", nome: "Admin 1", email: "a@b.com", role: "ADMIN" }],
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      mutate: jest.fn(),
      addAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      deleteAdmin: jest.fn(),
      getAdminById: jest.fn(),
      getAdminsPorRole: jest.fn(),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("success-state")).toHaveTextContent("Admin 1");
  });

  it("exibe estado vazio quando não há dados", () => {
    mockedUseAdmin.mockReturnValue({
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
      getAdminsPorRole: jest.fn(),
      reset: jest.fn(),
    });

    render(<TestComponent />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });
});
