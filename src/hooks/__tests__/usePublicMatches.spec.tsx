import { renderHook } from "@testing-library/react";
import useSWR from "swr";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { useJogosDoDia } from "@/hooks/useJogosDoDia";

jest.mock("swr");
jest.mock("@/config/racha.config", () => ({
  rachaConfig: { slug: "default-slug" },
}));

describe("usePublicMatches", () => {
  const mockedUseSWR = useSWR as unknown as jest.Mock;

  beforeEach(() => {
    mockedUseSWR.mockReturnValue({
      data: {
        slug: "racha-x",
        total: 1,
        results: [
          {
            id: "m1",
            date: "2025-01-01T10:00:00.000Z",
            score: { teamA: 2, teamB: 1 },
            teamA: { id: "a", name: "Time A", logoUrl: null, color: null },
            teamB: { id: "b", name: "Time B", logoUrl: null, color: null },
            presences: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
      mutate: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("monta a chave com slug e filtros e retorna dados mapeados", () => {
    renderHook(() => usePublicMatches({ slug: "racha-x", scope: "today", limit: 2 }));

    expect(mockedUseSWR).toHaveBeenCalledWith(
      "/api/public/racha-x/matches?scope=today&limit=2",
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false })
    );
  });
});

describe("useJogosDoDia", () => {
  const mockedUseSWR = useSWR as unknown as jest.Mock;

  beforeEach(() => {
    mockedUseSWR.mockReturnValue({
      data: {
        slug: "fut7pro",
        total: 1,
        results: [
          {
            id: "m1",
            date: "2025-01-01T10:00:00.000Z",
            score: { teamA: 3, teamB: 0 },
            teamA: { id: "a", name: "Azul", logoUrl: null, color: null },
            teamB: { id: "b", name: "Laranja", logoUrl: null, color: null },
            presences: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
      mutate: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("mapeia partidas publicas para Jogos do Dia com placar", () => {
    const { result } = renderHook(() => useJogosDoDia("fut7pro"));
    const jogo = result.current.jogos[0];

    expect(jogo.timeA).toBe("Azul");
    expect(jogo.timeB).toBe("Laranja");
    expect(jogo.golsTimeA).toBe(3);
    expect(jogo.golsTimeB).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });
});
