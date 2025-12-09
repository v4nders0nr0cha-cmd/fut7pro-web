import { render, screen } from "@testing-library/react";
import TimesDoDiaClient from "@/components/TimesDoDiaClient";

jest.mock("next/navigation", () => ({
  useRouter: () => ({}),
  usePathname: () => "/",
}));

jest.mock("@/hooks/usePublicMatches", () => ({
  usePublicMatches: jest.fn(),
}));

const mockedUsePublicMatches = require("@/hooks/usePublicMatches").usePublicMatches as jest.Mock;

describe("TimesDoDiaClient", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("exibe estado vazio quando nao ha times publicados", () => {
    mockedUsePublicMatches.mockReturnValue({
      matches: [],
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<TimesDoDiaClient />);

    expect(screen.getByText(/Nenhum Time do Dia publicado ainda/i)).toBeInTheDocument();
  });

  it("renderiza times e confrontos quando ha partidas", () => {
    mockedUsePublicMatches.mockReturnValue({
      matches: [
        {
          id: "m1",
          date: "2025-01-01T10:00:00.000Z",
          score: { teamA: 1, teamB: 0 },
          teamA: { id: "a", name: "Azul", logoUrl: null, color: "#111" },
          teamB: { id: "b", name: "Laranja", logoUrl: null, color: "#222" },
          presences: [],
        },
      ],
      isLoading: false,
      isError: false,
      error: undefined,
    });

    render(<TimesDoDiaClient />);

    expect(screen.getAllByText(/Azul/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Laranja/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Confrontos do dia/i)).toBeInTheDocument();
  });
});
