import { render, screen, fireEvent } from "@testing-library/react";
import AdminSidebar from "../admin/AdminSidebar";
import { Role } from "@/common/enums";

// Mock do Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/admin",
      pathname: "/admin",
      query: {},
      asPath: "/admin",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock do NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

describe("AdminSidebar", () => {
  const mockSession = {
    data: {
      user: {
        id: "user-1",
        email: "admin@test.com",
        name: "Admin User",
        role: Role.GERENTE,
        tenantId: "tenant-1",
      },
      expires: "2024-12-31",
    },
    status: "authenticated",
  };

  const mockRacha = {
    id: "racha-1",
    name: "Test Racha",
    tenantId: "tenant-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render sidebar with user information", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    render(<AdminSidebar racha={mockRacha} />);

    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    expect(screen.getByText("Test Racha")).toBeInTheDocument();
  });

  it("should show navigation menu items for Gerente role", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    render(<AdminSidebar racha={mockRacha} />);

    // Verificar itens do menu para Gerente
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Jogadores")).toBeInTheDocument();
    expect(screen.getByText("Partidas")).toBeInTheDocument();
    expect(screen.getByText("Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
  });

  it("should show limited menu items for Suporte role", () => {
    const { useSession } = require("next-auth/react");
    const suporteSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.SUPORTE,
        },
      },
    };
    useSession.mockReturnValue(suporteSession);

    render(<AdminSidebar racha={mockRacha} />);

    // Suporte deve ver apenas alguns itens
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Jogadores")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();

    // Suporte não deve ver financeiro
    expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
  });

  it("should show financial menu items for Financeiro role", () => {
    const { useSession } = require("next-auth/react");
    const financeiroSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.FINANCEIRO,
        },
      },
    };
    useSession.mockReturnValue(financeiroSession);

    render(<AdminSidebar racha={mockRacha} />);

    // Financeiro deve ver financeiro
    expect(screen.getByText("Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("should show marketing menu items for Marketing role", () => {
    const { useSession } = require("next-auth/react");
    const marketingSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.MARKETING,
        },
      },
    };
    useSession.mockReturnValue(marketingSession);

    render(<AdminSidebar racha={mockRacha} />);

    // Marketing deve ver analytics e relatórios
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Relatórios")).toBeInTheDocument();
  });

  it("should show audit menu items for Auditoria role", () => {
    const { useSession } = require("next-auth/react");
    const auditoriaSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.AUDITORIA,
        },
      },
    };
    useSession.mockReturnValue(auditoriaSession);

    render(<AdminSidebar racha={mockRacha} />);

    // Auditoria deve ver analytics e relatórios
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Relatórios")).toBeInTheDocument();
  });

  it("should handle logout correctly", () => {
    const { useSession, signOut } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);
    signOut.mockResolvedValue(undefined);

    render(<AdminSidebar racha={mockRacha} />);

    const logoutButton = screen.getByText("Sair");
    fireEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("should show active menu item based on current route", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    // Mock do router para simular rota ativa
    const { useRouter } = require("next/router");
    useRouter.mockReturnValue({
      ...useRouter(),
      pathname: "/admin/jogadores",
    });

    render(<AdminSidebar racha={mockRacha} />);

    const jogadoresLink = screen.getByText("Jogadores").closest("a");
    expect(jogadoresLink).toHaveClass("bg-blue-600");
  });

  it("should handle mobile menu toggle", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    render(<AdminSidebar racha={mockRacha} />);

    const mobileMenuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(mobileMenuButton);

    // Verificar se o menu mobile está visível
    const sidebar = screen.getByRole("navigation");
    expect(sidebar).toHaveClass("translate-x-0");
  });

  it("should display user avatar correctly", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    render(<AdminSidebar racha={mockRacha} />);

    const userAvatar = screen.getByAltText("Admin User");
    expect(userAvatar).toBeInTheDocument();
  });

  it("should handle missing user data gracefully", () => {
    const { useSession } = require("next-auth/react");
    const sessionWithoutUser = {
      data: null,
      status: "unauthenticated",
    };
    useSession.mockReturnValue(sessionWithoutUser);

    render(<AdminSidebar racha={mockRacha} />);

    // Deve mostrar estado de carregamento ou redirecionar
    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
  });

  it("should be accessible with proper ARIA labels", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    render(<AdminSidebar racha={mockRacha} />);

    const sidebar = screen.getByRole("navigation");
    expect(sidebar).toBeInTheDocument();

    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("should show correct permissions based on user role", () => {
    const { useSession } = require("next-auth/react");
    const gerenteSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.GERENTE,
        },
      },
    };
    useSession.mockReturnValue(gerenteSession);

    render(<AdminSidebar racha={mockRacha} />);

    // Gerente deve ver todos os itens de gestão
    expect(screen.getByText("Jogadores")).toBeInTheDocument();
    expect(screen.getByText("Partidas")).toBeInTheDocument();
    expect(screen.getByText("Financeiro")).toBeInTheDocument();
    expect(screen.getByText("Administradores")).toBeInTheDocument();
  });
});
