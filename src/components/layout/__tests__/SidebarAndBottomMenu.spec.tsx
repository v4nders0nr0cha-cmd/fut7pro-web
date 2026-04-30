import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";
import BottomMenu from "../BottomMenu";

const mockRouterPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({ push: mockRouterPush })),
  useSearchParams: jest.fn(() => ({ get: () => null })),
  redirect: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(() => ({ me: null, isLoading: false, isError: false })),
}));

jest.mock("@/hooks/useComunicacao", () => ({
  useComunicacao: jest.fn(() => ({
    badge: 0,
    badgeMensagem: 0,
    badgeSugestoes: 0,
  })),
}));

describe("Sidebar", () => {
  it("renderiza nome do racha", () => {
    render(<Sidebar />);
    expect(screen.getByText(/Fut7/i)).toBeInTheDocument();
  });
});

describe("BottomMenu", () => {
  const useSession = require("next-auth/react").useSession as jest.Mock;
  const useMe = require("@/hooks/useMe").useMe as jest.Mock;
  const useComunicacao = require("@/hooks/useComunicacao").useComunicacao as jest.Mock;
  const usePathname = require("next/navigation").usePathname as jest.Mock;

  beforeEach(() => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    useMe.mockReturnValue({ me: null, isLoading: false, isError: false });
    useComunicacao.mockReturnValue({
      badge: 0,
      badgeMensagem: 0,
      badgeSugestoes: 0,
    });
    usePathname.mockReturnValue("/ruimdebola");
    mockRouterPush.mockClear();
  });

  it("mostra CTA de login quando não autenticado", () => {
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

  it("mostra itens do menu e badges quando autenticado", () => {
    useSession.mockReturnValue({
      data: { user: { id: "u1", name: "User", tenantSlug: "ruimdebola" } },
      status: "authenticated",
    });
    useMe.mockReturnValue({
      me: {
        athlete: { firstName: "User" },
        membership: { status: "APROVADO" },
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

  it("mantem CTA quando existe apenas sessao global sem vinculo de atleta", () => {
    useSession.mockReturnValue({
      data: { user: { id: "u1", name: "User", tenantSlug: "ruimdebola" } },
      status: "authenticated",
    });
    useMe.mockReturnValue({ me: null, isLoading: false, isError: true });

    render(<BottomMenu />);

    expect(screen.getByText(/^Entrar$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Perfil")).not.toBeInTheDocument();
  });

  it("troca o CTA por menu completo quando ha atleta aprovado no racha atual", () => {
    useSession.mockReturnValue({
      data: { user: { id: "u1", name: "User", tenantSlug: "ruimdebola" } },
      status: "authenticated",
    });
    useMe.mockReturnValue({
      me: {
        athlete: { firstName: "User" },
        membership: { status: "APROVADO" },
      },
      isLoading: false,
      isError: false,
    });

    render(<BottomMenu />);

    expect(screen.queryByText(/^Entrar$/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Perfil")).toBeInTheDocument();
  });

  it("direciona atleta pendente para aguardando aprovacao ao usar o menu", () => {
    useSession.mockReturnValue({
      data: { user: { id: "u1", name: "User", tenantSlug: "ruimdebola" } },
      status: "authenticated",
    });
    useMe.mockReturnValue({
      me: {
        membership: { status: "PENDENTE" },
      },
      isLoading: false,
      isError: false,
    });

    render(<BottomMenu />);

    fireEvent.click(screen.getByLabelText("Início"));

    expect(mockRouterPush).toHaveBeenCalledWith("/ruimdebola/aguardando-aprovacao");
  });
});
