import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import SorteioInteligenteAdmin from "../SorteioInteligenteAdmin";
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

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ rachaId: "racha-1" }),
}));

jest.mock("@/hooks/useTimes", () => ({
  useTimes: () => ({
    times: [
      { id: "t1", nome: "Time A", logo: "/logo1.png", cor: "#111" },
      { id: "t2", nome: "Time B", logo: "/logo2.png", cor: "#222" },
    ],
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

jest.mock("@/components/sorteio/ConfiguracoesRacha", () => ({
  __esModule: true,
  default: ({ onSubmit, disabled }: any) => (
    <button
      type="button"
      onClick={() =>
        onSubmit({
          duracaoRachaMin: 90,
          duracaoPartidaMin: 10,
          numTimes: 2,
          jogadoresPorTime: 2,
          dataPartida: "2025-12-30",
          horaPartida: "19:30",
        })
      }
      disabled={disabled}
    >
      Definir config
    </button>
  ),
}));

jest.mock("@/components/sorteio/SelecionarTimesDia", () => ({
  __esModule: true,
  default: () => <div data-testid="selecionar-times-dia">Selecionar times</div>,
}));

jest.mock("@/components/sorteio/ParticipantesRacha", () => ({
  __esModule: true,
  default: ({ setParticipantes }: any) => (
    <button type="button" onClick={() => setParticipantes(mockParticipantes)}>
      Carregar participantes
    </button>
  ),
}));

jest.mock("@/components/sorteio/TimesGerados", () => ({
  __esModule: true,
  default: ({ times }: any) => <div data-testid="times-gerados">{times.length} times gerados</div>,
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
  afterEach(() => {
    jest.useRealTimers();
    (global.fetch as jest.Mock).mockClear();
  });

  it("gera times, tabela e permite publicar apos o sorteio", async () => {
    jest.useFakeTimers();
    render(<SorteioInteligenteAdmin />);

    fireEvent.click(screen.getByText(/Definir config/i));
    fireEvent.click(screen.getByText(/Carregar participantes/i));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Sortear Times/i }));
      jest.runAllTimers();
    });

    expect(await screen.findByTestId("times-gerados")).toHaveTextContent(/times gerados/);
    expect(screen.getByTestId("tabela-jogos")).toHaveTextContent(/jogos criados/);

    const publicar = await screen.findByRole("button", { name: /Publicar Times do Dia/i });
    fireEvent.click(publicar);
    expect(await screen.findByText(/Times Publicados!/i)).toBeInTheDocument();
  });
});
