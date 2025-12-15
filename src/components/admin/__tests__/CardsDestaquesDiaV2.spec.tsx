import { render, screen } from "@testing-library/react";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import type { PublicMatch } from "@/types/partida";

const matches: PublicMatch[] = [
  {
    id: "m1",
    date: "2025-12-14T12:00:00.000Z",
    location: null,
    scoreA: 3,
    scoreB: 1,
    score: { teamA: 3, teamB: 1 },
    teamA: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
    teamB: { id: "B", name: "Time Branco", logoUrl: "/logoB.png", color: "#fff" },
    presences: [
      {
        id: "p1",
        matchId: "m1",
        tenantId: "t1",
        athleteId: "a1",
        teamId: "A",
        status: "TITULAR",
        goals: 2,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2025-12-14T12:00:00.000Z",
        updatedAt: "2025-12-14T12:00:00.000Z",
        athlete: {
          id: "a1",
          name: "Artilheiro Azul",
          nickname: "AA",
          position: "ATA",
          photoUrl: null,
        },
        team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
      },
      {
        id: "p2",
        matchId: "m1",
        tenantId: "t1",
        athleteId: "a2",
        teamId: "A",
        status: "TITULAR",
        goals: 0,
        assists: 2,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2025-12-14T12:00:00.000Z",
        updatedAt: "2025-12-14T12:00:00.000Z",
        athlete: {
          id: "a2",
          name: "Maestro Azul",
          nickname: "MA",
          position: "MEIA",
          photoUrl: null,
        },
        team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
      },
      {
        id: "p3",
        matchId: "m1",
        tenantId: "t1",
        athleteId: "a3",
        teamId: "A",
        status: "TITULAR",
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2025-12-14T12:00:00.000Z",
        updatedAt: "2025-12-14T12:00:00.000Z",
        athlete: {
          id: "a3",
          name: "Goleiro Azul",
          nickname: "GA",
          position: "GOL",
          photoUrl: null,
        },
        team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
      },
    ],
  },
];

describe("CardsDestaquesDiaV2", () => {
  it("renderiza destaques a partir das partidas reais", () => {
    render(<CardsDestaquesDiaV2 matches={matches} />);

    expect(screen.getByText(/Time Campeao do Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Azul/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Artilheiro Azul/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Maestro Azul/i).length).toBeGreaterThan(0);
  });
});
