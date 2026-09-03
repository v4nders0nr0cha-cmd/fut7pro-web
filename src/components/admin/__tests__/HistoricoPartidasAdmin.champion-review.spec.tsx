import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HistoricoPartidasAdmin from "../HistoricoPartidasAdmin";

let mockSearchParams = new URLSearchParams("dia=2026-08-24");
const useAdminMatchesMock = jest.fn();
const useAdminDestaquesRodadasMock = jest.fn();
const mutateMatches = jest.fn();
const mutateQueue = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/hooks/useAdminMatches", () => ({
  useAdminMatches: (...args: unknown[]) => useAdminMatchesMock(...args),
}));

jest.mock("@/hooks/useAdminDestaquesRodadas", () => ({
  useAdminDestaquesRodadas: (...args: unknown[]) => useAdminDestaquesRodadasMock(...args),
}));

jest.mock("@/hooks/useSorteioHistorico", () => ({
  useSorteioHistorico: () => ({ historico: [] }),
}));

function makeMatch() {
  return {
    id: "match-1",
    date: "2026-08-24T22:00:00.000Z",
    location: "Arena Fut7",
    status: "finished",
    scoreA: 0,
    scoreB: 0,
    score: { teamA: 0, teamB: 0 },
    teamA: { id: "team-a", name: "Casa do Gamer", logoUrl: null, color: null },
    teamB: { id: "team-b", name: "Gaviões", logoUrl: null, color: null },
    presences: [
      {
        id: "presence-1",
        matchId: "match-1",
        tenantId: "tenant-1",
        athleteId: "athlete-1",
        teamId: "team-a",
        status: "TITULAR",
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2026-08-24T22:00:00.000Z",
        updatedAt: "2026-08-24T22:00:00.000Z",
        athlete: {
          id: "athlete-1",
          name: "Cleivan",
          nickname: null,
          position: "MEIA",
          photoUrl: null,
        },
        team: { id: "team-a", name: "Casa do Gamer", logoUrl: null, color: null },
      },
    ],
  };
}

function mockQueue(overrides: Record<string, unknown> = {}) {
  return {
    rodadasIncompletas: [],
    rodadasAguardandoCampeao: [],
    rodadasRegistradas: [
      {
        date: "2026-08-24",
        totalMatches: 1,
        completedMatches: 1,
        status: "COMPLETA",
        ...overrides,
      },
    ],
    rodadasPrecisandoRevisao: [],
    currentPublicSpotlightDate: null,
  };
}

describe("HistoricoPartidasAdmin - revisao do Time Campeao", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams("dia=2026-08-24");
    global.fetch = jest.fn() as any;
    useAdminMatchesMock.mockReturnValue({
      matches: [makeMatch()],
      isLoading: false,
      isError: false,
      error: null,
      mutate: mutateMatches,
    });
    useAdminDestaquesRodadasMock.mockReturnValue({
      queue: mockQueue(),
      mutate: mutateQueue,
    });
  });

  it("mostra Revisar e republicar quando a edicao retorna championDayReviewRequired", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "match-1",
        championDayReviewRequired: true,
        championDayDate: "2026-08-24",
        reviewUrl: "/admin/partidas/time-campeao-do-dia?data=2026-08-24",
      }),
    });

    render(<HistoricoPartidasAdmin />);

    fireEvent.click(screen.getByRole("button", { name: /Editar resultado/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Salvar resultado/i }));

    expect(await screen.findByText("Resultado atualizado")).toBeInTheDocument();
    expect(screen.getByText(/precisam ser revisados/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Revisar e republicar/i })).toHaveAttribute(
      "href",
      "/admin/partidas/time-campeao-do-dia?data=2026-08-24"
    );
    await waitFor(() => expect(mutateMatches).toHaveBeenCalled());
    expect(mutateQueue).toHaveBeenCalled();
  });

  it("mostra alerta persistente quando a fila aponta needsReview", () => {
    useAdminDestaquesRodadasMock.mockReturnValue({
      queue: {
        ...mockQueue({
          needsReview: true,
          reviewUrl: "/admin/partidas/time-campeao-do-dia?data=2026-08-24",
        }),
        rodadasPrecisandoRevisao: [
          {
            date: "2026-08-24",
            totalMatches: 1,
            completedMatches: 1,
            status: "COMPLETA",
            needsReview: true,
            reviewUrl: "/admin/partidas/time-campeao-do-dia?data=2026-08-24",
          },
        ],
      },
      mutate: mutateQueue,
    });

    render(<HistoricoPartidasAdmin />);

    expect(screen.getByText("Publicação desatualizada")).toBeInTheDocument();
    expect(screen.getByText(/foram alterados depois da publicação/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Revisar publicação/i })).toHaveAttribute(
      "href",
      "/admin/partidas/time-campeao-do-dia?data=2026-08-24"
    );
  });
});
