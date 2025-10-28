import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@/hooks/useTema", () => ({
  useTema: () => ({
    logo: "/logo.png",
    nome: "Fut7Pro",
  }),
}));

jest.mock("@/hooks/useComunicacao", () => ({
  useComunicacao: () => ({
    badge: 2,
    badgeMensagem: 1,
    badgeSugestoes: 0,
  }),
}));

jest.mock("@/hooks/useNotificationBadge", () => ({
  useNotificationBadge: () => ({
    total: 0,
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseSession = require("next-auth/react").useSession as jest.Mock;
const mockSignOut = require("next-auth/react").signOut as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe("Header", () => {
  beforeEach(() => {
    mockUseSession.mockReset();
    mockSignOut.mockReset();
    mockUseRouter.mockReset();
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  it("exibe quick actions e botão de login para visitante", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<Header />);

    expect(screen.getByLabelText("Comunicação")).toBeInTheDocument();
    expect(screen.getByLabelText("Sugestões")).toBeInTheDocument();
    expect(screen.getByText(/ENTRAR OU CADASTRE-SE/i)).toBeInTheDocument();
  });

  it("redireciona visitante para login ao clicar em quick action", () => {
    const pushMock = jest.fn();
    mockUseRouter.mockReturnValue({ push: pushMock });
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<Header />);

    fireEvent.click(screen.getByLabelText("Comunicação"));
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("exibe perfil e permite sair quando autenticado", () => {
    const pushMock = jest.fn();
    mockUseRouter.mockReturnValue({ push: pushMock });
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Admin User",
          image: "/avatar.png",
        },
      },
      status: "authenticated",
    });

    render(<Header />);

    expect(screen.getByText("Admin User")).toBeInTheDocument();

    fireEvent.click(screen.getByText("SAIR"));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
