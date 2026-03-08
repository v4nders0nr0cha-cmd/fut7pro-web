import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/Header";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: jest.fn(),
}));

describe("Header", () => {
  const usePathname = require("next/navigation").usePathname as jest.Mock;

  beforeEach(() => {
    usePathname.mockReturnValue("/ruimdebola");
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
});
