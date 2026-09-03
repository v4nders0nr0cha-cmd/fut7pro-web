import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TimeCampeaoDoDiaPage from "../page";

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

function makeMatch(presences: any[]) {
  return {
    id: "match-1",
    date: "2026-08-18T21:00:00.000Z",
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
});
