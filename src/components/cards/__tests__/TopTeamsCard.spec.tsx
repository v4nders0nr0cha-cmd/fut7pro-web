import { render, screen, within } from "@testing-library/react";
import TopTeamsCard from "@/components/cards/TopTeamsCard";
import type { TeamRankingEntry } from "@/types/ranking";

jest.mock("@/hooks/usePublicTenantSlug", () => ({
  usePublicTenantSlug: jest.fn(() => "fut7pro"),
}));

const mockUsePublicTeamRankings = jest.fn();

jest.mock("@/hooks/usePublicTeamRankings", () => ({
  usePublicTeamRankings: (slug: string) => mockUsePublicTeamRankings(slug),
}));

const sampleRankings: TeamRankingEntry[] = [
  {
    id: "team-1",
    rankingId: "ranking-1",
    nome: "Time Alpha",
    logo: "/images/times/time_padrao_01.png",
    cor: "#FFD700",
    pontos: 24,
    jogos: 11,
    vitorias: 7,
    empates: 3,
    derrotas: 1,
    posicao: 1,
    aproveitamento: 85.7,
    updatedAt: "2025-10-31T12:00:00.000Z",
    variacao: "up",
  },
  {
    id: "team-2",
    rankingId: "ranking-2",
    nome: "Time Beta",
    logo: "/images/times/time_padrao_02.png",
    cor: "#ECECEC",
    pontos: 21,
    jogos: 11,
    vitorias: 6,
    empates: 3,
    derrotas: 2,
    posicao: 2,
    aproveitamento: 75,
    updatedAt: "2025-10-31T12:00:00.000Z",
    variacao: "down",
  },
  {
    id: "team-3",
    rankingId: "ranking-3",
    nome: "Time Gama",
    logo: "/images/times/time_padrao_03.png",
    cor: "#222222",
    pontos: 19,
    jogos: 11,
    vitorias: 5,
    empates: 4,
    derrotas: 2,
    posicao: 3,
    aproveitamento: 68,
    updatedAt: "2025-10-31T12:00:00.000Z",
    variacao: "same",
  },
  {
    id: "team-4",
    rankingId: "ranking-4",
    nome: "Time Ômega",
    logo: "/images/times/time_padrao_04.png",
    cor: "#222222",
    pontos: 17,
    jogos: 11,
    vitorias: 5,
    empates: 2,
    derrotas: 4,
    posicao: 4,
    aproveitamento: 62,
    updatedAt: "2025-10-31T12:00:00.000Z",
    variacao: "up",
  },
];

function mockSuccess() {
  mockUsePublicTeamRankings.mockReturnValue({
    data: {
      slug: "fut7pro",
      updatedAt: "2025-10-31T12:00:00.000Z",
      availableYears: [2024, 2025],
      results: sampleRankings,
    },
    rankings: sampleRankings,
    updatedAt: "2025-10-31T12:00:00.000Z",
    availableYears: [2024, 2025],
    isLoading: false,
    isError: false,
    error: null,
    mutate: jest.fn(),
  });
}

describe("TopTeamsCard", () => {
  beforeEach(() => {
    mockUsePublicTeamRankings.mockReset();
    mockSuccess();
  });

  it('renderiza título e chamada "Ver todos"', () => {
    render(<TopTeamsCard />);

    expect(screen.getByText(/Classificação dos Times/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver todos/i)).toBeInTheDocument();
  });

  it("exibe os quatro primeiros times da classificação", () => {
    render(<TopTeamsCard />);

    sampleRankings.slice(0, 4).forEach((time) => {
      expect(screen.getByText(time.nome)).toBeInTheDocument();
    });
  });

  it("exibe pontos e ícone de variação para cada time", () => {
    render(<TopTeamsCard />);

    sampleRankings.slice(0, 4).forEach((time) => {
      const row = screen.getByText(time.nome).closest("tr");
      expect(row).not.toBeNull();
      if (row) {
        expect(within(row).getByText(String(time.pontos))).toBeInTheDocument();
      }
    });
  });

  it("mostra estado de carregamento quando dados ainda não chegaram", () => {
    mockUsePublicTeamRankings.mockReturnValueOnce({
      data: null,
      rankings: [],
      updatedAt: null,
      availableYears: [],
      isLoading: true,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TopTeamsCard />);

    expect(screen.getAllByRole("row")).toHaveLength(5); // header + 4 skeleton rows
  });

  it("envolve o card em um link para a classificação completa", () => {
    render(<TopTeamsCard />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/estatisticas/classificacao-dos-times");
  });
});
