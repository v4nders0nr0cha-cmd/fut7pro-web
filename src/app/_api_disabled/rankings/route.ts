import { NextResponse } from "next/server";

// Dados mockados para rankings
const mockRankings = [
  {
    id: "rank-1",
    playerId: "player-1",
    teamId: "team-1",
    goals: 8,
    assists: 3,
    points: 19,
    position: 1,
  },
  {
    id: "rank-2",
    playerId: "player-8",
    teamId: "team-2",
    goals: 7,
    assists: 4,
    points: 18,
    position: 2,
  },
  {
    id: "rank-3",
    playerId: "player-15",
    teamId: "team-3",
    goals: 6,
    assists: 5,
    points: 17,
    position: 3,
  },
  {
    id: "rank-4",
    playerId: "player-22",
    teamId: "team-4",
    goals: 5,
    assists: 6,
    points: 16,
    position: 4,
  },
  {
    id: "rank-5",
    playerId: "player-2",
    teamId: "team-1",
    goals: 4,
    assists: 7,
    points: 15,
    position: 5,
  },
];

export async function GET() {
  // Simular delay de rede
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json(mockRankings);
}
