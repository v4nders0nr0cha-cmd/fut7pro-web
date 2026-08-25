import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import ParticipantesRacha from "../ParticipantesRacha";
import type { Participante, ConfiguracaoRacha } from "@/types/sorteio";

const mockJogadores = Array.from({ length: 28 }, (_, index) => {
  const numero = index + 1;
  return {
    id: `jogador-${numero}`,
    nome: `Jogador ${numero}`,
    apelido: `J${numero}`,
    avatar: `/jogador-${numero}.png`,
    foto: `/jogador-${numero}.png`,
    posicao:
      numero <= 4
        ? "Goleiro"
        : numero % 3 === 0
          ? "Zagueiro"
          : numero % 3 === 1
            ? "Meia"
            : "Atacante",
    mensalista: true,
    isBot: false,
    partidas: 10,
  };
});

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ rachaId: "racha-1", tenantSlug: "racha-1" }),
}));

jest.mock("@/hooks/useJogadores", () => ({
  useJogadores: () => ({
    jogadores: mockJogadores,
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useNiveisAtletas", () => ({
  useNiveisAtletas: () => ({
    niveis: mockJogadores.map((jogador, index) => ({
      id: `nivel-${jogador.id}`,
      rachaId: "racha-1",
      jogadorId: jogador.id,
      habilidade: 3,
      fisico: 2,
      nivelFinal: 4,
      estrelas: (index % 5) + 1,
      atualizadoEm: "",
      atualizadoPor: "admin",
    })),
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useRachaAgenda", () => ({
  useRachaAgenda: () => ({
    items: [{ id: "agenda-1", weekday: 2, time: "19:30", active: true }],
  }),
}));

jest.mock("@/hooks/useMensalistaCompetencias", () => ({
  useMensalistaCompetencias: () => ({
    items: mockJogadores.map((jogador) => ({
      athleteId: jogador.id,
      isPaid: true,
      agendaIds: ["agenda-1"],
    })),
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ rankings: [] }),
  } as any)
) as any;

const mockParticipantesRestaurados: Participante[] = mockJogadores.map((jogador, index) => ({
  id: jogador.id,
  nome: jogador.nome,
  slug: jogador.apelido,
  foto: jogador.foto,
  posicao: index < 4 ? "GOL" : index % 3 === 0 ? "ZAG" : index % 3 === 1 ? "MEI" : "ATA",
  rankingPontos: 0,
  vitorias: 0,
  assistencias: 0,
  gols: 0,
  estrelas: {
    id: `nivel-${jogador.id}`,
    rachaId: "racha-1",
    jogadorId: jogador.id,
    habilidade: 3,
    fisico: 2,
    nivelFinal: 4,
    estrelas: (index % 5) + 1,
    atualizadoEm: "",
    atualizadoPor: "admin",
  },
  mensalista: true,
  isBot: false,
  partidas: 10,
}));

function ParticipantesHarness({
  config,
  initialParticipantes = [],
}: {
  config: ConfiguracaoRacha;
  initialParticipantes?: Participante[];
}) {
  const [participantes, setParticipantes] = useState<Participante[]>(initialParticipantes);
  return (
    <>
      <span data-testid="total-selecionados">{participantes.length}</span>
      <span data-testid="goleiros-selecionados">
        {participantes.filter((participante) => participante.posicao === "GOL").length}
      </span>
      <span data-testid="linha-selecionados">
        {participantes.filter((participante) => participante.posicao !== "GOL").length}
      </span>
      <ParticipantesRacha
        rachaId="racha-1"
        config={config}
        participantes={participantes}
        setParticipantes={setParticipantes}
      />
    </>
  );
}

describe("ParticipantesRacha", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("limita mensalistas automaticos a capacidade configurada", async () => {
    render(
      <ParticipantesHarness
        config={{
          duracaoRachaMin: 90,
          duracaoPartidaMin: 6,
          numTimes: 2,
          jogadoresPorTime: 7,
          dataPartida: "2025-12-30",
          horaPartida: "19:30",
        }}
      />
    );

    await waitFor(() => expect(screen.getByTestId("total-selecionados")).toHaveTextContent("14"));

    expect(screen.getByTestId("goleiros-selecionados")).toHaveTextContent("2");
    expect(screen.getByTestId("linha-selecionados")).toHaveTextContent("12");
    expect(document.body).toHaveTextContent("14 / 14");
    expect(document.body).not.toHaveTextContent("28 / 14");
  });

  it("separa candidatos de slots de goleiro e slots de linha", async () => {
    render(
      <ParticipantesHarness
        config={{
          duracaoRachaMin: 90,
          duracaoPartidaMin: 6,
          numTimes: 2,
          jogadoresPorTime: 7,
          dataPartida: "2025-12-31",
          horaPartida: "18:00",
        }}
      />
    );

    await waitFor(() => expect(screen.getByTestId("total-selecionados")).toHaveTextContent("0"));

    expect(screen.getAllByText("Escolha o Goleiro")).toHaveLength(2);
    expect(screen.getAllByText("Vaga disponivel")).toHaveLength(12);

    fireEvent.click(screen.getAllByText("Escolha o Goleiro")[0]);
    expect(screen.getByText("Jogador 1")).toBeInTheDocument();
    expect(screen.queryByText("Jogador 5")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancelar"));
    fireEvent.click(screen.getAllByText("Vaga disponivel")[0]);
    expect(screen.queryByText("Jogador 1")).not.toBeInTheDocument();
    expect(screen.getByText("Jogador 5")).toBeInTheDocument();
  });

  it("preserva participantes restaurados do rascunho e nao reexecuta a selecao automatica por cima", async () => {
    render(
      <ParticipantesHarness
        initialParticipantes={mockParticipantesRestaurados}
        config={{
          duracaoRachaMin: 90,
          duracaoPartidaMin: 6,
          numTimes: 4,
          jogadoresPorTime: 7,
          dataPartida: "2025-12-31",
          horaPartida: "18:00",
        }}
      />
    );

    await waitFor(() => expect(screen.getByTestId("total-selecionados")).toHaveTextContent("28"));

    expect(screen.getByTestId("goleiros-selecionados")).toHaveTextContent("4");
    expect(screen.getByTestId("linha-selecionados")).toHaveTextContent("24");
    expect(document.body).toHaveTextContent("28 / 28");
    expect(document.body).toHaveTextContent("Limite perfeito! Pronto para sortear.");
  });
});
