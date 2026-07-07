import { render, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";
import BottomMenu from "../BottomMenu";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: () => null })),
  redirect: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
}));

jest.mock("@/hooks/useComunicacao", () => ({
  useComunicacao: jest.fn(() => ({
    badge: 0,
    badgeMensagem: 0,
    badgeSugestoes: 0,
  })),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(() => ({ me: null, isLoading: false, isError: false })),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: jest.fn(() => ({ profile: null, isLoading: false, isError: false })),
}));

describe("Sidebar", () => {
  it("renderiza destaques do dia e melhores do ano", () => {
    render(<Sidebar />);
    expect(screen.getByText(/Artilheiro do Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Melhores do Ano até agora/i)).toBeInTheDocument();
    expect(screen.getByText(/Atacante do Ano/i)).toBeInTheDocument();
  });
});

describe("BottomMenu", () => {
  const useSession = require("next-auth/react").useSession as jest.Mock;
  const useComunicacao = require("@/hooks/useComunicacao").useComunicacao as jest.Mock;
  const usePathname = require("next/navigation").usePathname as jest.Mock;
  const useMe = require("@/hooks/useMe").useMe as jest.Mock;
  const useGlobalProfile = require("@/hooks/useGlobalProfile").useGlobalProfile as jest.Mock;

  beforeEach(() => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    usePathname.mockReturnValue("/ruimdebola");
    useComunicacao.mockReturnValue({ badge: 0, badgeMensagem: 0, badgeSugestoes: 0 });
    useMe.mockReturnValue({ me: null, isLoading: false, isError: false });
    useGlobalProfile.mockReturnValue({ profile: null, isLoading: false, isError: false });
  });

  it("mostra CTA de login quando não autenticado", () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    usePathname.mockReturnValue("/ruimdebola");
    const { rerender } = render(<BottomMenu />);
    expect(screen.getByText(/^Entrar$/i)).toBeInTheDocument();
    rerender(<BottomMenu />);
  });

  it("no vitrine mantém apenas CTA de Entrar", () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    usePathname.mockReturnValue("/vitrine");

    render(<BottomMenu />);

    expect(screen.getByText(/^Entrar$/i)).toBeInTheDocument();
    expect(screen.queryByText(/Criar meu racha/i)).not.toBeInTheDocument();
  });

  it("mostra itens do menu e badges quando autenticado e aprovado no grupo", () => {
    useSession.mockReturnValue({
      data: { user: { id: "u1", name: "User", tenantSlug: "ruimdebola" } },
      status: "authenticated",
    });
    usePathname.mockReturnValue("/ruimdebola");
    useMe.mockReturnValue({
      me: {
        athlete: {
          firstName: "User",
          position: "meia",
          birthDay: 10,
          birthMonth: 5,
        },
        membership: { status: "APROVADO" },
      },
      isLoading: false,
      isError: false,
    });
    useGlobalProfile.mockReturnValue({
      profile: {
        user: { name: "User", position: "meia", birthDay: 10, birthMonth: 5 },
      },
      isLoading: false,
      isError: false,
    });
    useComunicacao.mockReturnValue({
      badge: 2,
      badgeMensagem: 1,
      badgeSugestoes: 0,
    });

    render(<BottomMenu />);

    expect(screen.getByLabelText("Início")).toBeInTheDocument();
    expect(screen.getByLabelText("Comunicação")).toBeInTheDocument();
    expect(screen.getByLabelText("Mensagens")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });

  it("mantem CTA de completar conta quando ha sessao sem perfil completo aprovado", () => {
    useSession.mockReturnValue({
      data: { user: { id: "u1", name: "User", tenantSlug: "ruimdebola" } },
      status: "authenticated",
    });
    usePathname.mockReturnValue("/ruimdebola");

    render(<BottomMenu />);

    expect(screen.queryByText(/^Entrar$/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Completar conta")).toBeInTheDocument();
    expect(screen.queryByLabelText("Perfil")).not.toBeInTheDocument();
  });
});
