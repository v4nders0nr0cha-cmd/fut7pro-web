import { render, screen } from "@testing-library/react";
import TopTeamsCard from "@/components/cards/TopTeamsCard";

jest.mock("@/hooks/usePublicTeamRankings", () => ({
  usePublicTeamRankings: () => ({
    teams: [
      {
        id: "time-1",
        rankingId: "r1",
        nome: "Time Alpha",
        logo: "/images/logos/logo_fut7pro.png",
        cor: "#ffffff",
        pontos: 24,
        jogos: 10,
        vitorias: 8,
        empates: 0,
        derrotas: 2,
        posicao: 1,
        aproveitamento: 80,
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "time-2",
        rankingId: "r2",
        nome: "Time Beta",
        logo: "/images/logos/logo_fut7pro.png",
        cor: "#ffffff",
        pontos: 22,
        jogos: 10,
        vitorias: 7,
        empates: 1,
        derrotas: 2,
        posicao: 2,
        aproveitamento: 73.33,
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "time-3",
        rankingId: "r3",
        nome: "Time Gama",
        logo: "/images/logos/logo_fut7pro.png",
        cor: "#ffffff",
        pontos: 23,
        jogos: 10,
        vitorias: 7,
        empates: 2,
        derrotas: 1,
        posicao: 3,
        aproveitamento: 76.67,
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    updatedAt: "2025-01-01T00:00:00.000Z",
    availableYears: [2025],
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

describe("TopTeamsCard", () => {
  it('renderiza titulo e botao "Ver todos"', () => {
    render(<TopTeamsCard />);

    expect(screen.getByText(/Classificação dos Times/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver todos/i })).toBeInTheDocument();
  });

  it("renderiza lista de times corretamente", () => {
    render(<TopTeamsCard />);

    expect(screen.getByText("Time Alpha")).toBeInTheDocument();
    expect(screen.getByText("Time Beta")).toBeInTheDocument();
    expect(screen.getByText("Time Gama")).toBeInTheDocument();
  });

  it("renderiza pontuacao dos times", () => {
    render(<TopTeamsCard />);

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
  });

  it("renderiza estrutura da tabela", () => {
    render(<TopTeamsCard />);

    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("↑↓")).toBeInTheDocument();
    expect(screen.getByText("Pts")).toBeInTheDocument();
  });
});
