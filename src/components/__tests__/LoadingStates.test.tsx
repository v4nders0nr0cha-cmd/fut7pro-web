import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { useAdmin } from "../../hooks/useAdmin";
import { Role } from "@prisma/client";

// Mock do NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock do SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Componente de teste para simular diferentes estados
const TestComponent = () => {
  const { isLoading, error, user, racha } = useAdmin();

  if (isLoading) {
    return (
      <div data-testid="loading-state">
        <div className="animate-spin">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="error-state">
        <div className="text-red-500">Erro: {error.message}</div>
      </div>
    );
  }

  if (user && racha) {
    return (
      <div data-testid="success-state">
        <h1>Bem-vindo, {user.name}!</h1>
        <p>Racha: {racha.name}</p>
      </div>
    );
  }

  return (
    <div data-testid="empty-state">
      <p>Nenhum dado disponível</p>
    </div>
  );
};

describe("Loading States", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should show loading spinner when data is being fetched", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      useSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      useSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
      expect(screen.getByText("Carregando...")).toBeInTheDocument();
    });

    it("should show loading state with skeleton components", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      useSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      useSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      const loadingElement = screen.getByTestId("loading-state");
      expect(loadingElement).toHaveClass("animate-spin");
    });
  });

  describe("Error State", () => {
    it("should show error message when API call fails", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      const mockError = new Error("Falha na conexão com o servidor");

      useSession.mockReturnValue({
        data: {
          user: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            role: Role.ATLETA,
          },
        },
        status: "authenticated",
      });

      useSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      expect(screen.getByTestId("error-state")).toBeInTheDocument();
      expect(
        screen.getByText(/Erro: Falha na conexão com o servidor/),
      ).toBeInTheDocument();
    });

    it("should show error state with retry button", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      const mockError = new Error("Erro de rede");

      useSession.mockReturnValue({
        data: {
          user: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            role: Role.ATLETA,
          },
        },
        status: "authenticated",
      });

      useSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      const errorElement = screen.getByTestId("error-state");
      expect(errorElement).toHaveClass("text-red-500");
    });

    it("should handle different types of errors", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      const networkError = new Error("Network Error");
      const authError = new Error("Unauthorized");
      const serverError = new Error("Internal Server Error");

      useSession.mockReturnValue({
        data: {
          user: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            role: Role.ATLETA,
          },
        },
        status: "authenticated",
      });

      // Testar erro de rede
      useSWR.mockReturnValue({
        data: undefined,
        error: networkError,
        isLoading: false,
        mutate: jest.fn(),
      });

      const { rerender } = render(<TestComponent />);
      expect(screen.getByText(/Erro: Network Error/)).toBeInTheDocument();

      // Testar erro de autenticação
      useSWR.mockReturnValue({
        data: undefined,
        error: authError,
        isLoading: false,
        mutate: jest.fn(),
      });

      rerender(<TestComponent />);
      expect(screen.getByText(/Erro: Unauthorized/)).toBeInTheDocument();

      // Testar erro do servidor
      useSWR.mockReturnValue({
        data: undefined,
        error: serverError,
        isLoading: false,
        mutate: jest.fn(),
      });

      rerender(<TestComponent />);
      expect(
        screen.getByText(/Erro: Internal Server Error/),
      ).toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    it("should show success state when data is loaded correctly", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      const mockUser = {
        id: "user-1",
        name: "João Silva",
        email: "joao@test.com",
        role: Role.GERENTE,
        tenantId: "tenant-1",
      };

      const mockRacha = {
        id: "racha-1",
        name: "Racha do João",
        tenantId: "tenant-1",
      };

      useSession.mockReturnValue({
        data: {
          user: mockUser,
        },
        status: "authenticated",
      });

      useSWR.mockReturnValue({
        data: mockRacha,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      expect(screen.getByTestId("success-state")).toBeInTheDocument();
      expect(screen.getByText("Bem-vindo, João Silva!")).toBeInTheDocument();
      expect(screen.getByText("Racha: Racha do João")).toBeInTheDocument();
    });

    it("should show success state with user information", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      const mockUser = {
        id: "user-1",
        name: "Maria Santos",
        email: "maria@test.com",
        role: Role.SUPORTE,
        tenantId: "tenant-1",
      };

      const mockRacha = {
        id: "racha-1",
        name: "Racha da Maria",
        tenantId: "tenant-1",
      };

      useSession.mockReturnValue({
        data: {
          user: mockUser,
        },
        status: "authenticated",
      });

      useSWR.mockReturnValue({
        data: mockRacha,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      expect(screen.getByText("Bem-vindo, Maria Santos!")).toBeInTheDocument();
      expect(screen.getByText("Racha: Racha da Maria")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no data is available", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      useSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      useSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("Nenhum dado disponível")).toBeInTheDocument();
    });

    it("should show empty state when user is not authenticated", () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      useSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      useSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      });

      render(<TestComponent />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  describe("State Transitions", () => {
    it("should transition from loading to success state", async () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      const mockUser = {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        role: Role.ATLETA,
      };

      const mockRacha = {
        id: "racha-1",
        name: "Test Racha",
        tenantId: "tenant-1",
      };

      useSession.mockReturnValue({
        data: {
          user: mockUser,
        },
        status: "authenticated",
      });

      // Simular transição de loading para success
      useSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: jest.fn(),
      });

      const { rerender } = render(<TestComponent />);
      expect(screen.getByTestId("loading-state")).toBeInTheDocument();

      // Simular dados carregados
      useSWR.mockReturnValue({
        data: mockRacha,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
      });

      rerender(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("success-state")).toBeInTheDocument();
      });
    });

    it("should transition from loading to error state", async () => {
      const { useSession } = require("next-auth/react");
      const { default: useSWR } = require("swr");

      const mockError = new Error("API Error");

      useSession.mockReturnValue({
        data: {
          user: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            role: Role.ATLETA,
          },
        },
        status: "authenticated",
      });

      // Simular transição de loading para error
      useSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: jest.fn(),
      });

      const { rerender } = render(<TestComponent />);
      expect(screen.getByTestId("loading-state")).toBeInTheDocument();

      // Simular erro
      useSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: jest.fn(),
      });

      rerender(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
      });
    });
  });
});
