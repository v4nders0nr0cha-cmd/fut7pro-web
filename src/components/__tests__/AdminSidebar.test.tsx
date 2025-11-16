import { render, screen } from "@testing-library/react";
import AdminSidebar from "../admin/AdminSidebar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("AdminSidebar", () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    mockUsePathname.mockReturnValue("/admin/dashboard");
  });

  it("renderiza logotipo e nome do racha", () => {
    render(<AdminSidebar />);

    expect(screen.getByAltText("Logo do Fut7Pro – Plataforma SaaS de Rachas")).toBeInTheDocument();
    expect(screen.getByText(/Seu Racha/i)).toBeInTheDocument();
  });

  it("exibe todos os itens de menu configurados", () => {
    render(<AdminSidebar />);

    const expectedLabels = [
      "Dashboard",
      "Jogadores",
      "Partidas",
      "Ranking & Estatísticas",
      "Conquistas",
      "Financeiro",
      "Prestação de Contas",
      "Patrocinadores",
      "Notificações",
      "Configurações",
    ];

    expectedLabels.forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });
  });

  it("marca como ativo o item correspondente ao pathname atual", () => {
    mockUsePathname.mockReturnValue("/admin/jogadores");

    render(<AdminSidebar />);

    const jogadoresLink = screen.getByRole("link", { name: "Jogadores" });
    expect(jogadoresLink.className).toMatch(/bg-gradient-to-r/);
  });
});
