import { render, screen } from "@testing-library/react";
import CardTimeCampeaoDoDia from "@/components/admin/CardTimeCampeaoDoDia";
import type { PublicMatch } from "@/types/partida";

const sampleMatches: PublicMatch[] = [
  {
    id: "m1",
    date: "2025-12-14T12:00:00.000Z",
    location: null,
    scoreA: 2,
    scoreB: 1,
    score: { teamA: 2, teamB: 1 },
    teamA: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
    teamB: { id: "B", name: "Time Branco", logoUrl: "/logoB.png", color: "#fff" },
    presences: [
      {
        id: "p1",
        matchId: "m1",
        tenantId: "t1",
        athleteId: "j1",
        teamId: "A",
        status: "TITULAR",
        goals: 1,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        createdAt: "2025-12-14T12:00:00.000Z",
        updatedAt: "2025-12-14T12:00:00.000Z",
        athlete: { id: "j1", name: "Joao", nickname: "Jo", position: "GOL", photoUrl: null },
        team: { id: "A", name: "Time Azul", logoUrl: "/logoA.png", color: "#00f" },
      },
    ],
  },
];

describe("CardTimeCampeaoDoDia", () => {
  it("mostra o campeao calculado a partir das partidas", () => {
    render(<CardTimeCampeaoDoDia matches={sampleMatches} editLink="/admin/partidas" />);

    expect(screen.getByText(/Time Azul/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Editar Time Azul/i })).toHaveAttribute(
      "href",
      "/admin/partidas"
    );
  });

  it("exibe chamada para cadastrar quando nao ha dados", () => {
    render(<CardTimeCampeaoDoDia />);

    expect(screen.getByText(/Selecione um racha no Hub/i)).toBeInTheDocument();
  });
});
