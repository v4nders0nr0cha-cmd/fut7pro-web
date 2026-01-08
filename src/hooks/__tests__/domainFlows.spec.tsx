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
    "/api/admin/financeiro?tenantId=tenant-1": {
      data: [
        {
          id: "l1",
          type: "ENTRADA",
          date: "2025-01-01T00:00:00.000Z",
          description: "Mensalidade",
          category: "Mensalidade",
          value: 100,
          tenantId: "tenant-1",
        },
      ],
      isLoading: false,
      error: undefined,
      mutate: mutateMock,
    },
    "/api/public/r-fin/financeiro": {
      data: {
        tenant: { id: "t1", slug: "r-fin", name: "Racha Fin" },
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

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(() => ({
    me: { tenant: { tenantId: "tenant-1", tenantSlug: "r-fin" } },
  })),
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

describe("Fluxos de financeiro, sorteio e rankings", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("useFinanceiro retorna lancamentos e filtra por tipo", () => {
    const { result } = renderHook(() => useFinanceiro());
    expect(result.current.lancamentos).toHaveLength(1);
    expect(result.current.getLancamentosPorTipo("entrada")).toHaveLength(1);
    expect(result.current.getLancamentoById("l1")?.descricao).toBe("Mensalidade");
    expect(
      result.current.getLancamentosPorPeriodo("2025-01-01", "2025-01-02").map((l) => l.id)
    ).toContain("l1");
    expect(result.current.isLoading).toBe(false);
  });

  it("useFinanceiro chama addLancamento e dispara mutate", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-lanc" }),
      text: async () => "",
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useFinanceiro());
    await result.current.addLancamento({
      data: "2025-01-01",
      descricao: "Nova",
      valor: 50,
      tipo: "entrada",
    });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/financeiro",
      expect.objectContaining({ method: "POST" })
    );
    expect(body).toEqual(
      expect.objectContaining({
        tenantId: "tenant-1",
        type: "ENTRADA",
        value: 50,
        description: "Nova",
      })
    );
    expect(mutateMock).toHaveBeenCalled();
    expect(handleAsyncMock).toHaveBeenCalled();
  });

  it("useFinanceiro chama getRelatorios", async () => {
    const { result } = renderHook(() => useFinanceiro());
    const data = await result.current.getRelatorios();
    expect(data).toEqual({
      totalReceitas: 100,
      totalDespesas: 0,
      saldoAtual: 100,
    });
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
        nome: "Goleiro 2",
        slug: "g2",
        foto: "/f4",
        posicao: "GOL",
        estrelas: estrela("p4"),
        ...base,
      },
    ];

    const times = [
      { id: "t1", nome: "Time A", logo: "/l1" },
      { id: "t2", nome: "Time B", logo: "/l2" },
    ];

    const resultado = sortearTimesInteligente(participantes, times, {
      partidasTotais: 2,
      sorteiosPublicadosNaTemporada: 9,
      historico: [],
      jogadoresPorTime: 2,
    });

    const totalDistribuido = resultado.times.reduce((acc, t) => acc + t.jogadores.length, 0);
    expect(resultado.times).toHaveLength(2);
    expect(totalDistribuido).toBe(participantes.length);
    expect(resultado.times[0].jogadores.length).toBeGreaterThan(0);
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
    const coefRankingBaixo = getCoeficiente({ ...base, rankingPontos: 1 }, { partidasTotais: 12 });
    const coefRankingAlto = getCoeficiente({ ...base, rankingPontos: 8 }, { partidasTotais: 12 });
    expect(coefRankingAlto).toBeGreaterThan(coefRankingBaixo);
  });

  it("getCoeficiente ignora ranking nos primeiros sorteios", () => {
    const base: Participante = {
      id: "p11",
      nome: "Tester 2",
      slug: "tester-2",
      foto: "/f2.png",
      posicao: "ATA",
      rankingPontos: 3,
      vitorias: 2,
      gols: 1,
      assistencias: 0,
      mensalista: false,
      estrelas: { id: "s2", rachaId: "r-fin", jogadorId: "p11", estrelas: 4, atualizadoEm: "" },
      partidas: 12,
    };
    const contexto = { partidasTotais: 12, sorteiosPublicadosNaTemporada: 3 };
    const coefRankingBaixo = getCoeficiente({ ...base, rankingPontos: 1 }, contexto);
    const coefRankingAlto = getCoeficiente({ ...base, rankingPontos: 10 }, contexto);
    expect(coefRankingAlto).toBe(coefRankingBaixo);
  });

  it("sortearTimesInteligente exige goleiro por time", () => {
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
        id: "p20",
        nome: "Zagueiro",
        slug: "z20",
        foto: "/f2",
        posicao: "ZAG",
        estrelas: estrela("p20"),
        ...base,
      },
      {
        id: "p21",
        nome: "Meia",
        slug: "m20",
        foto: "/f3",
        posicao: "MEI",
        estrelas: estrela("p21"),
        ...base,
      },
    ];
    const times = [
      { id: "t1", nome: "Time A", logo: "/l1" },
      { id: "t2", nome: "Time B", logo: "/l2" },
    ];

    expect(() =>
      sortearTimesInteligente(participantes, times, {
        partidasTotais: 2,
        sorteiosPublicadosNaTemporada: 9,
        historico: [],
        jogadoresPorTime: 2,
      })
    ).toThrow(/Goleiros insuficientes/);
  });

  it("anti-panelinha evita repetir jogador com colega recente", () => {
    const base = {
      rankingPontos: 1,
      vitorias: 1,
      assistencias: 0,
      gols: 0,
      mensalista: true,
      partidas: 1,
    };
    const estrela = (id: string, estrelas: number) => ({
      id: "",
      rachaId: "r-fin",
      jogadorId: id,
      estrelas,
      atualizadoEm: "",
      atualizadoPor: "",
    });
    const participantes: Participante[] = [
      {
        id: "g1",
        nome: "Goleiro 1",
        slug: "g1",
        foto: "/g1",
        posicao: "GOL",
        estrelas: estrela("g1", 4),
        ...base,
      },
      {
        id: "g2",
        nome: "Goleiro 2",
        slug: "g2",
        foto: "/g2",
        posicao: "GOL",
        estrelas: estrela("g2", 4),
        ...base,
      },
      {
        id: "a1",
        nome: "Zagueiro 1",
        slug: "a1",
        foto: "/a1",
        posicao: "ZAG",
        estrelas: estrela("a1", 5),
        ...base,
      },
      {
        id: "a2",
        nome: "Zagueiro 2",
        slug: "a2",
        foto: "/a2",
        posicao: "ZAG",
        estrelas: estrela("a2", 3),
        ...base,
      },
    ];

    const historico = [
      {
        id: "h1",
        createdAt: "2025-01-01T00:00:00.000Z",
        times: [
          { id: "t1", jogadoresIds: ["g1", "a1"] },
          { id: "t2", jogadoresIds: ["g2", "x1"] },
        ],
      },
    ];

    const times = [
      { id: "t1", nome: "Time A", logo: "/l1" },
      { id: "t2", nome: "Time B", logo: "/l2" },
    ];

    const resultado = sortearTimesInteligente(participantes, times, {
      partidasTotais: 2,
      sorteiosPublicadosNaTemporada: 9,
      historico,
      jogadoresPorTime: 2,
    });

    const timeG1 = resultado.times.find((t) => t.jogadores.some((j) => j.id === "g1"));
    expect(timeG1?.jogadores.some((j) => j.id === "a1")).toBe(false);
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
