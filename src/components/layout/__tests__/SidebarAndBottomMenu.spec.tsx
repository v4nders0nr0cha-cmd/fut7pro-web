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
  useMe: jest.fn(() => ({ me: null })),
}));

describe("Sidebar", () => {
  it("renderiza nome do racha", () => {
    render(<Sidebar />);
    expect(screen.getByText(/Fut7/i)).toBeInTheDocument();
  });
});

describe("BottomMenu", () => {
  const useSession = require("next-auth/react").useSession as jest.Mock;
  const useComunicacao = require("@/hooks/useComunicacao").useComunicacao as jest.Mock;
  const usePathname = require("next/navigation").usePathname as jest.Mock;
  const useMe = require("@/hooks/useMe").useMe as jest.Mock;

  it("mostra CTA de login quando não autenticado", () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    usePathname.mockReturnValue("/ruimdebola");
    useMe.mockReturnValue({ me: null });
    const { rerender } = render(<BottomMenu />);
    expect(screen.getByText(/^Entrar$/i)).toBeInTheDocument();
    rerender(<BottomMenu />);
  });

  it("mostra itens do menu e badges quando autenticado", () => {
    useSession.mockReturnValue({
      data: { user: { id: "u1", name: "User", tenantSlug: "ruimdebola" } },
      status: "authenticated",
    });
    usePathname.mockReturnValue("/ruimdebola");
    useComunicacao.mockReturnValue({
      badge: 2,
      badgeMensagem: 1,
      badgeSugestoes: 0,
    });
    useMe.mockReturnValue({
      me: { athlete: { id: "athlete-1" } },
    });

    render(<BottomMenu />);

    expect(screen.getByLabelText("Início")).toBeInTheDocument();
    expect(screen.getByLabelText("Comunicação")).toBeInTheDocument();
    expect(screen.getByLabelText("Mensagens")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });
});
