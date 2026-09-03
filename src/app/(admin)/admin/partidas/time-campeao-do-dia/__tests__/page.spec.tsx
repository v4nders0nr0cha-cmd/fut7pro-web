import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TimeCampeaoDoDiaPage from "../page";

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams("data=2026-08-18");

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/partidas/time-campeao-do-dia",
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/hooks/usePartidas", () => ({
  usePartidas: jest.fn(),
}));

jest.mock("@/hooks/useAdminDestaquesRodadas", () => ({
  useAdminDestaquesRodadas: jest.fn(),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "racha-teste", rachaId: "racha-1" }),
}));

jest.mock("@/hooks/usePublicMatches", () => ({
  usePublicMatches: () => ({
    matches: [],
    isLoading: false,
    isError: false,
  }),
}));

const usePartidasMock = require("@/hooks/usePartidas").usePartidas as jest.Mock;
const useAdminDestaquesRodadasMock = require("@/hooks/useAdminDestaquesRodadas")
  .useAdminDestaquesRodadas as jest.Mock;

const roundQueue = {
  rodadasIncompletas: [],
  rodadasAguardandoCampeao: [
    {
      date: "2026-08-18",
      totalMatches: 1,
      completedMatches: 1,
      status: "COMPLETA",
    },
  ],
  rodadasRegistradas: [],
  rodadasPrecisandoRevisao: [],
  currentPublicSpotlightDate: null,
};

function makePresence({
  id,
  athleteId,
  name,
  position,
  goals = 0,
  assists = 0,
  status = "TITULAR",
}: {
  id: string;
  athleteId: string;
  name: string;
  position: string;
  goals?: number;
  assists?: number;
  status?: "TITULAR" | "SUBSTITUTO" | "AUSENTE";
}) {
  return {
    id,
    matchId: "match-1",
    tenantId: "tenant-1",
    athleteId,
    teamId: "team-1",
    status,
    goals,
    assists,
    yellowCards: 0,
    redCards: 0,
    createdAt: "2026-08-18T21:00:00.000Z",
    updatedAt: "2026-08-18T21:00:00.000Z",
    athlete: {
      id: athleteId,
      name,
      nickname: null,
      position,
      photoUrl: null,
      isBot: false,
    },
    team: { id: "team-1", name: "Gavioes", logoUrl: null, color: null },
  };
}

function makeMatch(presences: any[], date = "2026-08-18T21:00:00.000Z") {
  return {
    id: "match-1",
    date,
    scoreA: 2,
    scoreB: 0,
    score: { teamA: 2, teamB: 0 },
    teamAId: "team-1",
    teamBId: "team-2",
    teamA: { id: "team-1", name: "Gavioes", logoUrl: null, color: null },
    teamB: { id: "team-2", name: "Falcao", logoUrl: null, color: null },
    presences,
  };
}

describe("TimeCampeaoDoDiaPage - ausencia", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams("data=2026-08-18");
    global.fetch = jest.fn() as any;
    useAdminDestaquesRodadasMock.mockReturnValue({
      queue: roundQueue,
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });
  });

  it("marca ausencia e recalcula a pagina sem erro ao atualizar partidas", async () => {
    let partidas = [
      makeMatch([
        makePresence({
          id: "p-ata",
          athleteId: "ata",
          name: "Atacante",
          position: "ATA",
          goals: 1,
        }),
        makePresence({
          id: "p-cleivan",
          athleteId: "cleivan",
          name: "Cleivan",
          position: "MEIA",
          assists: 1,
        }),
        makePresence({
          id: "p-gol",
          athleteId: "gol",
          name: "Goleiro",
          position: "GOL",
        }),
      ]),
    ];

    const mutate = jest.fn(async (updater: (current: any[]) => any[]) => {
      partidas = updater(partidas);
      return partidas;
    });

    usePartidasMock.mockImplementation(() => ({
      partidas,
      isLoading: false,
      isError: false,
      error: null,
      mutate,
    }));

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          destaque: {
            date: "2026-08-18T03:00:00.000Z",
            bannerUrl: null,
            zagueiroId: null,
            faltou: { meia: true },
            updatedAt: "2026-08-18T21:10:00.000Z",
          },
        }),
      });

    render(<TimeCampeaoDoDiaPage />);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Destaques/i }));
    expect(screen.getAllByText("Cleivan").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Marcar como ausente/i })[1]);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith("/api/admin/destaques-do-dia/ausencia", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-08-18",
          athleteId: "cleivan",
          role: "meia",
          ausente: true,
        }),
      })
    );

    await waitFor(() => expect(screen.getByText("Jogador Reserva BOT")).toBeInTheDocument());

    expect(mutate).toHaveBeenCalledWith(expect.any(Function), { revalidate: false });
    expect(screen.getByRole("button", { name: /Restaurar presença/i })).toBeInTheDocument();
    expect(screen.queryByText("Erro ao carregar partidas do dia.")).not.toBeInTheDocument();
  });

  it("restaura ausencia persistida apos reload usando atleta original do backend", async () => {
    let partidas = [
      makeMatch([
        makePresence({
          id: "p-ata",
          athleteId: "ata",
          name: "Atacante",
          position: "ATA",
          goals: 1,
        }),
        makePresence({
          id: "p-cleivan",
          athleteId: "cleivan",
          name: "Cleivan",
          position: "MEIA",
          assists: 1,
          status: "AUSENTE",
        }),
        makePresence({
          id: "p-outro-meia",
          athleteId: "outro-meia",
          name: "Outro Meia",
          position: "MEIA",
          assists: 1,
        }),
        makePresence({
          id: "p-gol",
          athleteId: "gol",
          name: "Goleiro",
          position: "GOL",
        }),
      ]),
    ];

    const mutate = jest.fn(async (updater: (current: any[]) => any[]) => {
      partidas = updater(partidas);
      return partidas;
    });

    usePartidasMock.mockImplementation(() => ({
      partidas,
      isLoading: false,
      isError: false,
      error: null,
      mutate,
    }));

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          date: "2026-08-18T03:00:00.000Z",
          bannerUrl: null,
          zagueiroId: null,
          faltou: {
            meia: true,
            targets: { meia: { athleteId: "cleivan", presenceStatus: "SUBSTITUTO" } },
          },
          updatedAt: "2026-08-18T21:10:00.000Z",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          destaque: {
            date: "2026-08-18T03:00:00.000Z",
            bannerUrl: null,
            zagueiroId: null,
            faltou: { meia: false },
            updatedAt: "2026-08-18T21:12:00.000Z",
          },
        }),
      });

    render(<TimeCampeaoDoDiaPage />);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Destaques/i }));
    expect(screen.getByText("Jogador Reserva BOT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Restaurar presença/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith("/api/admin/destaques-do-dia/ausencia", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-08-18",
          athleteId: "cleivan",
          role: "meia",
          ausente: false,
        }),
      })
    );

    expect(mutate).toHaveBeenCalledWith(expect.any(Function), { revalidate: false });
    const restoredPartidas = mutate.mock.calls[0][0](partidas);
    const cleivan = restoredPartidas[0].presences.find(
      (presence: any) => presence.athleteId === "cleivan"
    );
    expect(cleivan.status).toBe("SUBSTITUTO");
    expect(screen.queryByText("Erro ao carregar partidas do dia.")).not.toBeInTheDocument();
  });

  it("oculta upload de banner e usa CTA historico quando existe publicacao posterior", async () => {
    useAdminDestaquesRodadasMock.mockReturnValue({
      queue: {
        ...roundQueue,
        currentPublicSpotlightDate: "2026-08-30T03:00:00.000Z",
      },
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    usePartidasMock.mockReturnValue({
      partidas: [
        makeMatch([
          makePresence({
            id: "p-ata",
            athleteId: "ata",
            name: "Atacante",
            position: "ATA",
            goals: 1,
          }),
          makePresence({
            id: "p-zag",
            athleteId: "zag",
            name: "Zagueiro",
            position: "ZAG",
          }),
          makePresence({
            id: "p-gol",
            athleteId: "gol",
            name: "Goleiro",
            position: "GOL",
          }),
        ]),
      ],
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        date: "2026-08-18T03:00:00.000Z",
        bannerUrl: null,
        zagueiroId: "zag",
        faltou: null,
        updatedAt: "2026-08-18T21:10:00.000Z",
      }),
    });

    render(<TimeCampeaoDoDiaPage />);

    fireEvent.click(await screen.findByRole("button", { name: /Continuar para Destaques/i }));
    fireEvent.click(screen.getByRole("button", { name: /Continuar para Publicação/i }));

    expect(screen.getByText(/Banner não disponível para esta rodada/i)).toBeInTheDocument();
    expect(screen.getByText(/Publicação atual: 30\/08\/2026/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrar Time Campeão/i })).toBeInTheDocument();
    expect(screen.queryByText(/Salvar banner/i)).not.toBeInTheDocument();
  });

  it("mostra triagem ao entrar manualmente sem data selecionada", async () => {
    mockSearchParams = new URLSearchParams();

    usePartidasMock.mockReturnValue({
      partidas: [
        makeMatch([
          makePresence({
            id: "p-ata",
            athleteId: "ata",
            name: "Atacante",
            position: "ATA",
            goals: 1,
          }),
        ]),
      ],
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => null,
    });

    render(<TimeCampeaoDoDiaPage />);

    expect(
      screen.getByText("Você tem uma rodada concluída aguardando o Time Campeão")
    ).toBeInTheDocument();
    expect(screen.queryByText("Campeão do Dia")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Registrar agora/i }));

    expect(mockPush).toHaveBeenCalledWith("/admin/partidas/time-campeao-do-dia?data=2026-08-18");
  });

  it("lista rodadas incompletas sem permitir seleção para Time Campeão", () => {
    mockSearchParams = new URLSearchParams();
    useAdminDestaquesRodadasMock.mockReturnValue({
      queue: {
        rodadasAguardandoCampeao: [],
        rodadasRegistradas: [],
        rodadasPrecisandoRevisao: [],
        currentPublicSpotlightDate: null,
        rodadasIncompletas: [
          {
            date: "2026-08-24",
            totalMatches: 12,
            completedMatches: 11,
            status: "PARCIAL",
          },
          {
            date: "2026-08-22",
            totalMatches: 12,
            completedMatches: 0,
            status: "PENDENTE",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    usePartidasMock.mockReturnValue({
      partidas: [],
      isLoading: false,
      isError: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TimeCampeaoDoDiaPage />);

    expect(screen.getByText("Nenhuma rodada aguardando registro")).toBeInTheDocument();
    expect(screen.getByText("2 rodadas ainda possuem resultados pendentes")).toBeInTheDocument();
    expect(screen.getByText("24/08/2026")).toBeInTheDocument();
    expect(screen.getByText("22/08/2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver resultados pendentes/i })).toHaveAttribute(
      "href",
      "/admin/partidas/historico"
    );
    expect(screen.queryByRole("button", { name: /^Registrar$/i })).not.toBeInTheDocument();
  });

  it.each(["data", "date"])(
    "abre diretamente a rodada da URL com ?%s= mesmo quando existe pendencia historica anterior",
    async (paramName) => {
      mockSearchParams = new URLSearchParams(`${paramName}=2026-08-24`);
      useAdminDestaquesRodadasMock.mockReturnValue({
        queue: {
          rodadasIncompletas: [],
          rodadasAguardandoCampeao: [
            {
              date: "2026-04-13",
              totalMatches: 12,
              completedMatches: 12,
              status: "COMPLETA",
            },
            {
              date: "2026-08-24",
              totalMatches: 12,
              completedMatches: 12,
              status: "COMPLETA",
            },
          ],
          rodadasRegistradas: [],
          rodadasPrecisandoRevisao: [],
          currentPublicSpotlightDate: null,
        },
        isLoading: false,
        isError: false,
        error: null,
        mutate: jest.fn(),
      });

      usePartidasMock.mockReturnValue({
        partidas: [
          makeMatch(
            [
              makePresence({
                id: "p-ata",
                athleteId: "ata",
                name: "Atacante",
                position: "ATA",
                goals: 1,
              }),
              makePresence({
                id: "p-gol",
                athleteId: "gol",
                name: "Goleiro",
                position: "GOL",
              }),
            ],
            "2026-08-24T22:00:00.000Z"
          ),
        ],
        isLoading: false,
        isError: false,
        error: null,
        mutate: jest.fn(),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      render(<TimeCampeaoDoDiaPage />);

      expect(screen.queryByText("2 rodadas aguardando o Time Campeão")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Registrar agora/i })).not.toBeInTheDocument();
      expect(await screen.findByText("Rodada de 24/08/2026")).toBeInTheDocument();
      expect(screen.queryByText("Rodada de 13/04/2026")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Continuar para Destaques/i })).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/destaques-do-dia?date=2026-08-24", {
        cache: "no-store",
      });
    }
  );
});
