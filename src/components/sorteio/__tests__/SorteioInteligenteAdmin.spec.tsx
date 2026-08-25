import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import SorteioInteligenteAdmin, { buildSorteioInputsFingerprint } from "../SorteioInteligenteAdmin";
import type { Participante } from "@/types/sorteio";

const mockParticipantes: Participante[] = [
  {
    id: "p1",
    nome: "Goleiro",
    slug: "goleiro",
    foto: "/g1.png",
    posicao: "GOL",
    rankingPontos: 12,
    vitorias: 2,
    gols: 0,
    assistencias: 0,
    estrelas: { id: "e1", rachaId: "racha-1", jogadorId: "p1", estrelas: 4, atualizadoEm: "" },
    mensalista: true,
    partidas: 5,
  },
  {
    id: "p5",
    nome: "Goleiro 2",
    slug: "goleiro-2",
    foto: "/g2.png",
    posicao: "GOL",
    rankingPontos: 11,
    vitorias: 2,
    gols: 0,
    assistencias: 0,
    estrelas: { id: "e5", rachaId: "racha-1", jogadorId: "p5", estrelas: 3, atualizadoEm: "" },
    mensalista: true,
    partidas: 5,
  },
  {
    id: "p2",
    nome: "Zagueiro",
    slug: "zagueiro",
    foto: "/z1.png",
    posicao: "ZAG",
    rankingPontos: 10,
    vitorias: 3,
    gols: 1,
    assistencias: 0,
    estrelas: { id: "e2", rachaId: "racha-1", jogadorId: "p2", estrelas: 3, atualizadoEm: "" },
    mensalista: true,
    partidas: 5,
  },
  {
    id: "p3",
    nome: "Meia",
    slug: "meia",
    foto: "/m1.png",
    posicao: "MEI",
    rankingPontos: 14,
    vitorias: 4,
    gols: 2,
    assistencias: 3,
    estrelas: { id: "e3", rachaId: "racha-1", jogadorId: "p3", estrelas: 5, atualizadoEm: "" },
    mensalista: false,
    partidas: 5,
  },
  {
    id: "p4",
    nome: "Atacante",
    slug: "ata",
    foto: "/a1.png",
    posicao: "ATA",
    rankingPontos: 16,
    vitorias: 5,
    gols: 6,
    assistencias: 1,
    estrelas: { id: "e4", rachaId: "racha-1", jogadorId: "p4", estrelas: 4, atualizadoEm: "" },
    mensalista: false,
    partidas: 5,
  },
];

describe("buildSorteioInputsFingerprint", () => {
  const config = {
    duracaoRachaMin: 90,
    duracaoPartidaMin: 6,
    numTimes: 2,
    jogadoresPorTime: 7,
    dataPartida: "2026-08-25",
    horaPartida: "19:00",
  };
  const baseParticipantes = mockParticipantes.slice(0, 4);

  it("muda quando metricas, posicao ou historico anti-panelinha mudam", () => {
    const base = buildSorteioInputsFingerprint({
      config,
      timesSelecionados: ["t1", "t2"],
      timesDoDia: [
        { id: "t1", nome: "Time 1", logo: "/t1.png" },
        { id: "t2", nome: "Time 2", logo: "/t2.png" },
      ],
      participantes: baseParticipantes,
      totalTemporada: 9,
      historico: [
        {
          id: "h1",
          createdAt: "2026-08-20T00:00:00.000Z",
          times: [{ id: "t1", jogadoresIds: ["p1", "p2"] }],
        },
      ],
    });

    const comRankingAlterado = buildSorteioInputsFingerprint({
      config,
      timesSelecionados: ["t1", "t2"],
      timesDoDia: [
        { id: "t1", nome: "Time 1", logo: "/t1.png" },
        { id: "t2", nome: "Time 2", logo: "/t2.png" },
      ],
      participantes: baseParticipantes.map((participante) =>
        participante.id === "p2" ? { ...participante, rankingPontos: 999 } : participante
      ),
      totalTemporada: 9,
      historico: [
        {
          id: "h1",
          createdAt: "2026-08-20T00:00:00.000Z",
          times: [{ id: "t1", jogadoresIds: ["p1", "p2"] }],
        },
      ],
    });

    const comCampeoesAlterado = buildSorteioInputsFingerprint({
      config,
      timesSelecionados: ["t1", "t2"],
      timesDoDia: [
        { id: "t1", nome: "Time 1", logo: "/t1.png" },
        { id: "t2", nome: "Time 2", logo: "/t2.png" },
      ],
      participantes: baseParticipantes.map((participante) =>
        participante.id === "p2" ? { ...participante, campeoesDoDia: 4 } : participante
      ),
      totalTemporada: 9,
      historico: [
        {
          id: "h1",
          createdAt: "2026-08-20T00:00:00.000Z",
          times: [{ id: "t1", jogadoresIds: ["p1", "p2"] }],
        },
      ],
    });

    const comHistoricoAlterado = buildSorteioInputsFingerprint({
      config,
      timesSelecionados: ["t1", "t2"],
      timesDoDia: [
        { id: "t1", nome: "Time 1", logo: "/t1.png" },
        { id: "t2", nome: "Time 2", logo: "/t2.png" },
      ],
      participantes: baseParticipantes,
      totalTemporada: 9,
      historico: [
        {
          id: "h2",
          createdAt: "2026-08-21T00:00:00.000Z",
          times: [{ id: "t2", jogadoresIds: ["p1", "p3"] }],
        },
      ],
    });

    expect(comRankingAlterado).not.toBe(base);
    expect(comCampeoesAlterado).not.toBe(base);
    expect(comHistoricoAlterado).not.toBe(base);
  });
});

const mockParticipantesValidos = mockParticipantes.slice(0, 4);
const mockParticipantes28: Participante[] = Array.from({ length: 28 }, (_, index) => {
  const numero = index + 1;
  const posicao = numero <= 4 ? "GOL" : numero % 3 === 0 ? "ZAG" : numero % 3 === 1 ? "MEI" : "ATA";
  return {
    id: `p28-${numero}`,
    nome: `Participante ${numero}`,
    slug: `participante-${numero}`,
    foto: `/p28-${numero}.png`,
    posicao,
    rankingPontos: numero,
    vitorias: 0,
    gols: 0,
    assistencias: 0,
    estrelas: {
      id: `e28-${numero}`,
      rachaId: "racha-1",
      jogadorId: `p28-${numero}`,
      estrelas: (numero % 5) + 1,
      atualizadoEm: "",
    },
    mensalista: true,
    partidas: 5,
  };
});
const draftStorageKey = "fut7pro_admin_sorteio_draft_v1:racha-1";
const mockConfig = {
  duracaoRachaMin: 90,
  duracaoPartidaMin: 10,
  numTimes: 2,
  jogadoresPorTime: 2,
  dataPartida: "2025-12-30",
  horaPartida: "19:30",
};
const mockConfig4x7 = {
  ...mockConfig,
  duracaoPartidaMin: 6,
  numTimes: 4,
  jogadoresPorTime: 7,
};
const mockTimesBase = [
  { id: "t1", nome: "Time A", logo: "/logo1.png", cor: "#111" },
  { id: "t2", nome: "Time B", logo: "/logo2.png", cor: "#222" },
  { id: "t3", nome: "Time C", logo: "/logo3.png", cor: "#333" },
  { id: "t4", nome: "Time D", logo: "/logo4.png", cor: "#444" },
  { id: "t5", nome: "Time E", logo: "/logo5.png", cor: "#555" },
  { id: "t6", nome: "Time F", logo: "/logo6.png", cor: "#666" },
];
const buildTestFingerprint = (
  config = mockConfig,
  timesSelecionados = ["t1", "t2"],
  participantes = mockParticipantesValidos
) =>
  buildSorteioInputsFingerprint({
    config,
    timesSelecionados,
    timesDoDia: mockTimesDisponiveis.filter((time) => timesSelecionados.includes(time.id)),
    participantes,
    totalTemporada: 9,
    historico: [],
  });
const buildDraft = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  updatedAt: "2026-08-24T12:00:00.000Z",
  step: "SORTEADO",
  resultadoFingerprint: buildTestFingerprint(),
  config: mockConfig,
  participantes: mockParticipantesValidos,
  timesSelecionados: ["t1", "t2"],
  times: [
    {
      id: "t1",
      nome: "Time A",
      jogadores: mockParticipantesValidos.slice(0, 2),
      coeficienteTotal: 10,
    },
    {
      id: "t2",
      nome: "Time B",
      jogadores: mockParticipantesValidos.slice(2, 4),
      coeficienteTotal: 10,
    },
  ],
  tabelaJogos: [{ rodada: 1, timeA: "Time A", timeB: "Time B", duracao: 10 }],
  configConfirmada: true,
  publicado: false,
  partidasTotaisSorteio: 20,
  sorteioAvisos: ["Aviso antigo"],
  sorteioReservas: [],
  ...overrides,
});
let mockConfigNumTimes = 2;
let mockTimesDisponiveis = [...mockTimesBase];

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ rachaId: "racha-1", tenantSlug: "racha-1" }),
}));

jest.mock("@/hooks/useTimes", () => ({
  useTimes: () => ({
    times: mockTimesDisponiveis,
    isLoading: false,
    isError: false,
    addTime: jest.fn(),
    updateTime: jest.fn(),
    deleteTime: jest.fn(),
    mutate: jest.fn(),
  }),
}));

jest.mock("@/hooks/useSorteioHistorico", () => ({
  useSorteioHistorico: () => ({
    historico: [],
    totalTemporada: 9,
    anoTemporada: 2025,
    isLoading: false,
    isError: false,
  }),
}));

jest.mock("@/hooks/useCriticalSessionRefresh", () => ({
  useCriticalSessionRefresh: () => ({
    ensureFreshSession: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("@/components/sorteio/ConfiguracoesRacha", () => ({
  __esModule: true,
  default: ({ onSubmit, disabled, initialConfig }: any) => (
    <button
      type="button"
      onClick={() =>
        onSubmit({
          ...mockConfig,
          numTimes: mockConfigNumTimes,
        })
      }
      disabled={disabled}
    >
      {initialConfig?.horaPartida
        ? `Definir config ${initialConfig.horaPartida}`
        : "Definir config"}
    </button>
  ),
}));

jest.mock("@/components/sorteio/SelecionarTimesDia", () => ({
  __esModule: true,
  default: ({ timesDisponiveis, timesSelecionados, onChange, maxTimes }: any) => (
    <div data-testid="selecionar-times-dia">
      <span>{timesSelecionados.length} times selecionados</span>
      <button
        type="button"
        onClick={() => onChange(timesDisponiveis.slice(0, maxTimes).map((time: any) => time.id))}
      >
        Selecionar times manualmente
      </button>
    </div>
  ),
}));

jest.mock("@/components/sorteio/ParticipantesRacha", () => ({
  __esModule: true,
  default: ({ setParticipantes }: any) => (
    <button type="button" onClick={() => setParticipantes(mockParticipantesValidos)}>
      Carregar participantes
    </button>
  ),
}));

jest.mock("@/components/sorteio/TimesGerados", () => ({
  __esModule: true,
  default: ({ times }: any) => (
    <div data-testid="times-gerados">
      {times.length} times gerados
      <span data-testid="times-gerados-composicao">
        {times
          .map((time: any) => time.jogadores.map((jogador: any) => jogador.id).join(","))
          .join("|")}
      </span>
    </div>
  ),
}));

jest.mock("@/components/sorteio/TabelaJogosRacha", () => ({
  __esModule: true,
  default: ({ jogos }: any) => <div data-testid="tabela-jogos">{jogos.length} jogos criados</div>,
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
  } as any)
) as any;

describe("SorteioInteligenteAdmin - fluxo de publicacao", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as any)
    );
    mockConfigNumTimes = 2;
    mockTimesDisponiveis = [
      { id: "t1", nome: "Time A", logo: "/logo1.png", cor: "#111" },
      { id: "t2", nome: "Time B", logo: "/logo2.png", cor: "#222" },
      { id: "t3", nome: "Time C", logo: "/logo3.png", cor: "#333" },
      { id: "t4", nome: "Time D", logo: "/logo4.png", cor: "#444" },
      { id: "t5", nome: "Time E", logo: "/logo5.png", cor: "#555" },
      { id: "t6", nome: "Time F", logo: "/logo6.png", cor: "#666" },
    ];
  });

  afterEach(() => {
    jest.useRealTimers();
    (global.fetch as jest.Mock).mockClear();
  });

  async function avancarAteParticipantes() {
    fireEvent.click(await screen.findByText(/Definir config/i));

    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Times do Dia/i }));

    const continuarParticipantes = await screen.findByRole("button", {
      name: /Continuar para Participantes/i,
    });
    expect(continuarParticipantes).toBeDisabled();
    fireEvent.click(await screen.findByRole("button", { name: /Selecionar times manualmente/i }));
    await waitFor(() => expect(continuarParticipantes).not.toBeDisabled());
    fireEvent.click(continuarParticipantes);
  }

  it("gera times, tabela e permite publicar apos o sorteio", async () => {
    jest.useFakeTimers();
    render(<SorteioInteligenteAdmin />);

    await avancarAteParticipantes();
    fireEvent.click(screen.getByText(/Carregar participantes/i));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Sortear Times/i }));
      jest.runAllTimers();
    });

    expect(await screen.findByTestId("times-gerados")).toHaveTextContent(/times gerados/);
    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Publicação/i }));
    expect(screen.getByTestId("tabela-jogos")).toHaveTextContent(/jogos criados/);

    const publicar = await screen.findByRole("button", { name: /Publicar Times do Dia/i });
    fireEvent.click(publicar);
    expect(await screen.findByText(/Times Publicados!/i)).toBeInTheDocument();
  });

  it("mostra erro de publicacao na Etapa 5 sem perder o resultado", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/sorteio/publicar") {
        return Promise.resolve({
          ok: false,
          text: async () => JSON.stringify({ error: "Backend indisponivel" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    jest.useFakeTimers();
    render(<SorteioInteligenteAdmin />);

    await avancarAteParticipantes();
    fireEvent.click(screen.getByText(/Carregar participantes/i));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Sortear Times/i }));
      jest.runAllTimers();
    });

    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Publicação/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Publicar Times do Dia/i }));

    expect(
      await screen.findByText(/Não foi possível publicar os Times do Dia/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Backend indisponivel/i)).toBeInTheDocument();
    expect(screen.getByTestId("tabela-jogos")).toHaveTextContent(/jogos criados/);
  });

  it("bloqueia o avancar quando a configuracao exige mais times do que existem cadastrados", async () => {
    mockConfigNumTimes = 4;
    mockTimesDisponiveis = mockTimesDisponiveis.slice(0, 3);
    render(<SorteioInteligenteAdmin />);

    fireEvent.click(await screen.findByText(/Definir config/i));
    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Times do Dia/i }));

    expect(
      await screen.findByText(/Você configurou 4 times, mas existem apenas 3 disponíveis/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar para Participantes/i })).toBeDisabled();
  });

  it("nao seleciona times automaticamente em um fluxo novo", async () => {
    mockConfigNumTimes = 4;
    render(<SorteioInteligenteAdmin />);

    fireEvent.click(await screen.findByText(/Definir config/i));
    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Times do Dia/i }));

    expect(await screen.findByText(/0 times selecionados/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar para Participantes/i })).toBeDisabled();

    fireEvent.click(await screen.findByRole("button", { name: /Selecionar times manualmente/i }));

    await waitFor(() =>
      expect(screen.getAllByText(/4 times selecionados/i).length).toBeGreaterThan(0)
    );
    expect(
      screen.getByRole("button", { name: /Continuar para Participantes/i })
    ).not.toBeDisabled();
  });

  it("bloqueia o sorteio enquanto participantes e goleiros nao estiverem completos", async () => {
    render(<SorteioInteligenteAdmin />);

    await avancarAteParticipantes();

    expect(screen.getByText(/Pendências antes do sorteio/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sortear Times/i })).toBeDisabled();
  });

  it("restaura o rascunho gerado apos remontagem da tela", async () => {
    jest.useFakeTimers();
    const { unmount } = render(<SorteioInteligenteAdmin />);

    await avancarAteParticipantes();
    fireEvent.click(screen.getByText(/Carregar participantes/i));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Sortear Times/i }));
      jest.runAllTimers();
    });

    expect(await screen.findByTestId("times-gerados")).toHaveTextContent(/times gerados/);
    expect(screen.getByTestId("tabela-jogos")).toHaveTextContent(/jogos criados/);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    unmount();
    render(<SorteioInteligenteAdmin />);

    expect(await screen.findByTestId("times-gerados")).toHaveTextContent(/times gerados/);
    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Publicação/i }));
    expect(screen.getByTestId("tabela-jogos")).toHaveTextContent(/jogos criados/);
    fireEvent.click(screen.getByRole("button", { name: /Voltar para Times Sorteados/i }));
    fireEvent.click(screen.getByRole("button", { name: /Voltar para Participantes/i }));
    fireEvent.click(screen.getByRole("button", { name: /Voltar para Times do Dia/i }));
    fireEvent.click(screen.getByRole("button", { name: /Voltar para Configuração/i }));
    expect(await screen.findByText(/Definir config 19:30/i)).toBeInTheDocument();
  });

  it("restaura Times Sorteados quando o rascunho tem fingerprint compativel", async () => {
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(buildDraft()));

    render(<SorteioInteligenteAdmin />);

    expect(await screen.findByText(/Etapa 4 de 5/i)).toBeInTheDocument();
    expect(screen.getByTestId("times-gerados")).toHaveTextContent("2 times gerados");
    fireEvent.click(screen.getByRole("button", { name: /Continuar para Publicação/i }));
    expect(screen.getByTestId("tabela-jogos")).toHaveTextContent("1 jogos criados");
  });

  it("preserva 28 participantes e 4 goleiros ao voltar para Participantes apos restaurar a Etapa 4", async () => {
    const timesSelecionados = ["t1", "t2", "t3", "t4"];
    const timesSorteados = timesSelecionados.map((timeId, index) => ({
      id: timeId,
      nome: `Time ${index + 1}`,
      jogadores: mockParticipantes28.slice(index * 7, index * 7 + 7),
      coeficienteTotal: 10,
    }));
    window.sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify(
        buildDraft({
          config: mockConfig4x7,
          participantes: mockParticipantes28,
          timesSelecionados,
          times: timesSorteados,
          resultadoFingerprint: buildTestFingerprint(
            mockConfig4x7,
            timesSelecionados,
            mockParticipantes28
          ),
        })
      )
    );

    render(<SorteioInteligenteAdmin />);

    expect(await screen.findByText(/Etapa 4 de 5/i)).toBeInTheDocument();
    const composicaoRestaurada = screen.getByTestId("times-gerados-composicao").textContent;

    fireEvent.click(screen.getByRole("button", { name: /Voltar para Participantes/i }));

    expect(await screen.findByText(/Etapa 3 de 5/i)).toBeInTheDocument();
    expect(screen.getByText("28 / 28")).toBeInTheDocument();
    expect(screen.getByText("4 / 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sortear Times/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Continuar para Times Sorteados/i }));

    expect(await screen.findByText(/Etapa 4 de 5/i)).toBeInTheDocument();
    expect(screen.getByTestId("times-gerados-composicao").textContent).toBe(composicaoRestaurada);
  });

  it("nao restaura resultado derivado de draft antigo sem fingerprint", async () => {
    const draftAntigo = buildDraft();
    delete (draftAntigo as any).resultadoFingerprint;
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draftAntigo));

    render(<SorteioInteligenteAdmin />);

    expect(await screen.findByText(/Etapa 3 de 5/i)).toBeInTheDocument();
    expect(screen.queryByTestId("times-gerados")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sortear Times/i })).toBeInTheDocument();
  });

  it("invalida resultado derivado quando o fingerprint nao corresponde as entradas", async () => {
    window.sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify(
        buildDraft({
          config: mockConfig4x7,
          participantes: mockParticipantes28,
          timesSelecionados: ["t1", "t2", "t3", "t4"],
          resultadoFingerprint: buildTestFingerprint(
            mockConfig,
            ["t1", "t2"],
            [...mockParticipantesValidos, mockParticipantes[4]]
          ),
        })
      )
    );

    render(<SorteioInteligenteAdmin />);

    expect(await screen.findByText(/Etapa 3 de 5/i)).toBeInTheDocument();
    expect(screen.queryByTestId("times-gerados")).not.toBeInTheDocument();
    expect(screen.getByText("28 / 28")).toBeInTheDocument();
    expect(screen.getByText("4 / 4")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "✓" })[0]);
    expect(await screen.findByText(/Definir config 19:30/i)).toBeInTheDocument();
  });

  it("limpa resultado derivado quando uma entrada relevante muda apos o sorteio", async () => {
    jest.useFakeTimers();
    render(<SorteioInteligenteAdmin />);

    await avancarAteParticipantes();
    fireEvent.click(screen.getByText(/Carregar participantes/i));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Sortear Times/i }));
      jest.runAllTimers();
    });

    expect(await screen.findByTestId("times-gerados")).toHaveTextContent(/times gerados/);

    mockConfigNumTimes = 4;
    fireEvent.click(screen.getAllByRole("button", { name: "✓" })[0]);
    fireEvent.click(await screen.findByText(/Definir config 19:30/i));

    await waitFor(() => expect(screen.queryByTestId("times-gerados")).not.toBeInTheDocument());
    expect(screen.getByText(/Etapa 1 de 5/i)).toBeInTheDocument();
  });
});
