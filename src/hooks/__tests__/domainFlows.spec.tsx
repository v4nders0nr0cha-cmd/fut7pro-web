import { renderHook } from "@testing-library/react";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useFinanceiroPublic } from "@/hooks/useFinanceiroPublic";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { sortearTimesInteligente, gerarTabelaJogos, getCoeficiente } from "@/utils/sorteioUtils";
import type { Participante } from "@/types/sorteio";

const mutateMock = jest.fn();
const handleAsyncMock = jest.fn((fn: any) => fn());

const swrMock = jest.fn((key: string) => {
  const map: Record<string, any> = {
    "/api/admin/financeiro?rachaId=r-fin": {
      data: [
        {
          id: "l1",
          tipo: "receita",
          data: "2025-01-01",
          descricao: "Mensalidade",
          valor: 100,
          responsavel: "Admin",
        },
      ],
      isLoading: false,
      error: undefined,
      mutate: mutateMock,
    },
    "/api/public/financeiro/r-fin": {
      data: {
        resumo: { saldoAtual: 200, totalReceitas: 300, totalDespesas: 100 },
        lancamentos: [
          {
            id: "lp1",
            tipo: "receita",
            data: "2025-01-01",
            descricao: "Patrocinio",
            valor: 300,
            responsavel: "Admin",
          },
        ],
      },
      isLoading: false,
      error: undefined,
      mutate: mutateMock,
    },
    "/api/public/demo/team-rankings": {
      data: {
        slug: "demo",
        results: [
          {
            id: "t1",
            rankingId: "r1",
            nome: "Demo FC",
            logo: null,
            cor: null,
            pontos: 10,
            jogos: 4,
            vitorias: 3,
            empates: 1,
            derrotas: 0,
            posicao: 1,
            aproveitamento: 90,
            updatedAt: "2025-01-01",
          },
        ],
        updatedAt: "2025-01-01",
        availableYears: [2024, 2025],
      },
      isLoading: false,
      error: undefined,
      mutate: mutateMock,
    },
    "/api/public/demo/player-rankings?type=geral&period=year&year=2025&limit=5&position=atacante": {
      data: {
        slug: "demo",
        type: "geral",
        results: [
          {
            id: "p10",
            rankingId: "r10",
            nome: "Artilheiro Demo",
            posicao: "ATA",
            gols: 15,
            assistencias: 4,
            pontos: 40,
            tenantSlug: "demo",
            updatedAt: "2025-01-01",
          },
        ],
        total: 1,
        availableYears: [2024, 2025],
        appliedPeriod: { period: "year", year: 2025 },
      },
      isLoading: false,
      error: undefined,
      mutate: mutateMock,
    },
  };

  return map[key] || { data: [], isLoading: false, error: undefined, mutate: mutateMock };
});

jest.mock("swr", () => ({
  __esModule: true,
  default: (...args: any[]) => swrMock(args[0]),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: jest.fn(() => ({ rachaId: "r-fin" })),
}));

jest.mock("@/hooks/useApiState", () => ({
  useApiState: jest.fn(() => ({
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
    handleAsync: handleAsyncMock,
    reset: jest.fn(),
  })),
}));

jest.mock("@/lib/api", () => {
  const financeiroApi = {
    create: jest.fn().mockResolvedValue({ data: { id: "new-lanc" } }),
    getRelatorios: jest.fn().mockResolvedValue({ data: { receitas: 100, despesas: 50 } }),
  };
  return { financeiroApi };
});

const { financeiroApi } = jest.requireMock("@/lib/api") as {
  financeiroApi: {
    create: jest.Mock;
    getRelatorios: jest.Mock;
  };
};

describe("Fluxos de financeiro, sorteio e rankings", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("useFinanceiro retorna lancamentos e filtra por tipo", () => {
    const { result } = renderHook(() => useFinanceiro());
    expect(result.current.lancamentos).toHaveLength(1);
    expect(result.current.getLancamentosPorTipo("receita")).toHaveLength(1);
    expect(result.current.getLancamentoById("l1")?.descricao).toBe("Mensalidade");
    expect(
      result.current.getLancamentosPorPeriodo("2025-01-01", "2025-01-02").map((l) => l.id)
    ).toContain("l1");
    expect(result.current.isLoading).toBe(false);
  });

  it("useFinanceiro chama addLancamento e dispara mutate", async () => {
    const { result } = renderHook(() => useFinanceiro());
    await result.current.addLancamento({ descricao: "Nova", valor: 50, tipo: "entrada" });
    expect(financeiroApi.create).toHaveBeenCalledWith({
      descricao: "Nova",
      valor: 50,
      tipo: "entrada",
      rachaId: "r-fin",
    });
    expect(mutateMock).toHaveBeenCalled();
    expect(handleAsyncMock).toHaveBeenCalled();
  });

  it("useFinanceiro chama getRelatorios", async () => {
    const { result } = renderHook(() => useFinanceiro());
    const data = await result.current.getRelatorios();
    expect(financeiroApi.getRelatorios).toHaveBeenCalledWith("r-fin");
    expect(data).toEqual({ receitas: 100, despesas: 50 });
  });

  it("useFinanceiroPublic monta resumo e lancamentos publicos", () => {
    const { result } = renderHook(() => useFinanceiroPublic("r-fin"));
    expect(result.current.resumo?.saldoAtual).toBe(200);
    expect(result.current.lancamentos[0]?.descricao).toBe("Patrocinio");
  });

  it("usePublicTeamRankings carrega rankings e anos disponiveis", () => {
    const { result } = renderHook(() => usePublicTeamRankings({ slug: "demo" }));
    expect(result.current.teams[0]?.nome).toBe("Demo FC");
    expect(result.current.availableYears).toContain(2025);
    expect(result.current.isError).toBe(false);
  });

  it("usePublicPlayerRankings monta filtros e retorna atletas", () => {
    const { result } = renderHook(() =>
      usePublicPlayerRankings({
        slug: "demo",
        type: "geral",
        period: "year",
        year: 2025,
        limit: 5,
        position: "atacante",
      })
    );
    expect(result.current.rankings[0]?.nome).toBe("Artilheiro Demo");
    expect(result.current.availableYears).toContain(2024);
    expect(result.current.appliedPeriod).toEqual({ period: "year", year: 2025 });
  });

  it("sortearTimesInteligente distribui participantes nos times", () => {
    const base = {
      rankingPontos: 1,
      vitorias: 1,
      assistencias: 0,
      gols: 0,
      mensalista: true,
      partidas: 1,
    };
    const estrela = (id: string) => ({
      id: "",
      rachaId: "r-fin",
      jogadorId: id,
      estrelas: 3,
      atualizadoEm: "",
      atualizadoPor: "",
    });
    const participantes: Participante[] = [
      {
        id: "p1",
        nome: "Goleiro",
        slug: "g1",
        foto: "/f1",
        posicao: "GOL",
        estrelas: estrela("p1"),
        ...base,
      },
      {
        id: "p2",
        nome: "Zagueiro",
        slug: "z1",
        foto: "/f2",
        posicao: "ZAG",
        estrelas: estrela("p2"),
        ...base,
      },
      {
        id: "p3",
        nome: "Meia",
        slug: "m1",
        foto: "/f3",
        posicao: "MEI",
        estrelas: estrela("p3"),
        ...base,
      },
      {
        id: "p4",
        nome: "Atacante",
        slug: "a1",
        foto: "/f4",
        posicao: "ATA",
        estrelas: estrela("p4"),
        ...base,
      },
    ];

    const times = [
      { id: "t1", nome: "Time A", logo: "/l1" },
      { id: "t2", nome: "Time B", logo: "/l2" },
    ];

    const resultado = sortearTimesInteligente(participantes, times, 2);

    const totalDistribuido = resultado.reduce((acc, t) => acc + t.jogadores.length, 0);
    expect(resultado).toHaveLength(2);
    expect(totalDistribuido).toBe(participantes.length);
    expect(resultado[0].jogadores.length).toBeGreaterThan(0);
  });

  it("getCoeficiente prioriza ranking quando ha mais partidas", () => {
    const base: Participante = {
      id: "p10",
      nome: "Tester",
      slug: "tester",
      foto: "/f.png",
      posicao: "ATA",
      rankingPontos: 3,
      vitorias: 6,
      gols: 4,
      assistencias: 2,
      mensalista: false,
      estrelas: { id: "s1", rachaId: "r-fin", jogadorId: "p10", estrelas: 3, atualizadoEm: "" },
      partidas: 12,
    };
    const coefRankingBaixo = getCoeficiente({ ...base, rankingPontos: 1 }, 12);
    const coefRankingAlto = getCoeficiente({ ...base, rankingPontos: 8 }, 12);
    expect(coefRankingAlto).toBeGreaterThan(coefRankingBaixo);
  });

  it("gerarTabelaJogos respeita tempo util e cria confrontos", () => {
    const times = [
      { id: "t1", nome: "Time 1", logo: "" },
      { id: "t2", nome: "Time 2", logo: "" },
      { id: "t3", nome: "Time 3", logo: "" },
    ];
    const tabela = gerarTabelaJogos({ times, duracaoRachaMin: 90, duracaoPartidaMin: 15 });
    expect(tabela.length).toBeGreaterThan(0);
    expect(tabela[0]?.tempo).toBe(15);
    expect(tabela.every((j) => j.timeA && j.timeB)).toBe(true);
  });
});
