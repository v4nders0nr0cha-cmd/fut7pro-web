import { render, screen } from "@testing-library/react";
import TimesDoDiaClient from "@/components/TimesDoDiaClient";

jest.mock("next/navigation", () => ({
  useRouter: () => ({}),
  usePathname: () => "/",
}));

jest.mock("@/hooks/usePublicMatches", () => ({
  usePublicMatches: jest.fn(),
}));
jest.mock("@/hooks/useAdminMatches", () => ({
  useAdminMatches: jest.fn(),
}));
jest.mock("@/hooks/useTimesDoDiaPublicado", () => ({
  useTimesDoDiaPublicado: jest.fn(),
}));

const mockedUsePublicMatches = require("@/hooks/usePublicMatches").usePublicMatches as jest.Mock;
const mockedUseAdminMatches = require("@/hooks/useAdminMatches").useAdminMatches as jest.Mock;
const mockedUseTimesDoDiaPublicado = require("@/hooks/useTimesDoDiaPublicado")
  .useTimesDoDiaPublicado as jest.Mock;

describe("TimesDoDiaClient", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("exibe estado vazio quando nao ha times publicados", () => {
    mockedUseTimesDoDiaPublicado.mockReturnValue({
      data: { publicado: false, times: [] },
      isLoading: false,
      isError: false,
      error: undefined,
    });
    mockedUseAdminMatches.mockReturnValue({
      matches: [],
      isLoading: false,
      isError: false,
      error: undefined,
    });
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
    mockedUseTimesDoDiaPublicado.mockReturnValue({
      data: {
        publicado: true,
        times: [
          {
            id: "t1",
            nome: "Azul",
            logo: "/logo.png",
            cor: "#111",
            jogadores: [],
          },
          {
            id: "t2",
            nome: "Laranja",
            logo: "/logo.png",
            cor: "#222",
            jogadores: [],
          },
        ],
        confrontos: [
          { id: "c1", ordem: 1, tempo: 6, turno: "ida", timeA: "Azul", timeB: "Laranja" },
        ],
      },
      isLoading: false,
      isError: false,
      error: undefined,
    });
    mockedUseAdminMatches.mockReturnValue({
      matches: [],
      isLoading: false,
      isError: false,
      error: undefined,
    });
    mockedUsePublicMatches.mockReturnValue({
      matches: [],
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
