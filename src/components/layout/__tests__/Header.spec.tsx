import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/Header";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
  signOut: jest.fn(),
}));

jest.mock("@/hooks/useTema", () => ({
  useTema: jest.fn(() => ({
    logo: "/logo.png",
    nome: "Racha Teste",
  })),
}));

jest.mock("@/hooks/useComunicacao", () => ({
  useComunicacao: jest.fn(() => ({ badge: 0, badgeMensagem: 0, badgeSugestoes: 0 })),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: jest.fn(() => ({
    publicHref: (path: string) => `/ruimdebola${path}`,
  })),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(() => ({ me: null })),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: jest.fn(() => ({ profile: null })),
}));

describe("Header", () => {
  const usePathname = require("next/navigation").usePathname as jest.Mock;
  const useSession = require("next-auth/react").useSession as jest.Mock;

  beforeEach(() => {
    usePathname.mockReturnValue("/ruimdebola");
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
  });

  it("exibe quick actions", () => {
    render(<Header />);
    expect(screen.getByLabelText("Comunicação")).toBeInTheDocument();
    expect(screen.getByLabelText("Sugestões")).toBeInTheDocument();
    expect(screen.getByText(/Entrar/i)).toBeInTheDocument();
    expect(screen.getByText(/Atletas do/i)).toBeInTheDocument();
  });

  it("no vitrine exibe apenas CTA de Entrar", () => {
    usePathname.mockReturnValue("/vitrine");
    render(<Header />);
    expect(screen.getByText(/^Entrar$/i)).toBeInTheDocument();
    expect(screen.queryByText(/Criar meu racha/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demonstração do Fut7Pro/i)).not.toBeInTheDocument();
  });

  it("mantem fallback de nome completo no title do nome do racha", () => {
    render(<Header />);
    const homeLink = screen.getByRole("link", { name: /Página inicial/i });
    const tenantNameEl = homeLink.querySelector("span[title]");
    expect(tenantNameEl).not.toBeNull();
    expect(tenantNameEl).toHaveAttribute("title");
  });

  it("troca o CTA por perfil imediatamente quando a sessao ja chega autenticada", () => {
    useSession.mockReturnValue({
      data: {
        user: {
          id: "u1",
          name: "Pele",
          email: "pele@teste.com",
          image: "https://cdn.fut7/avatar-pele.png",
        },
      },
      status: "authenticated",
    });

    render(<Header />);

    expect(screen.queryByText(/^Entrar$/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pele/i })).toBeInTheDocument();
    expect(screen.getByAltText("Pele")).toHaveAttribute("src", "https://cdn.fut7/avatar-pele.png");
  });
});
