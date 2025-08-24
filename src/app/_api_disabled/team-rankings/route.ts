import { NextResponse } from "next/server";

// Dados mockados para rankings de times
const mockTeamRankings = [
  {
    id: "tr-1",
    teamId: "team-1",
    points: 25,
    games: 8,
    wins: 7,
    draws: 1,
    losses: 0,
    position: 1,
    goalsFor: 20,
    goalsAgainst: 8,
    goalDifference: 12,
  },
  {
    id: "tr-2",
    teamId: "team-3",
    points: 18,
    games: 8,
    wins: 5,
    draws: 3,
    losses: 0,
    position: 2,
    goalsFor: 15,
    goalsAgainst: 10,
    goalDifference: 5,
  },
  {
    id: "tr-3",
    teamId: "team-2",
    points: 15,
    games: 8,
    wins: 4,
    draws: 3,
    losses: 1,
    position: 3,
    goalsFor: 12,
    goalsAgainst: 11,
    goalDifference: 1,
  },
  {
    id: "tr-4",
    teamId: "team-4",
    points: 8,
    games: 8,
    wins: 2,
    draws: 2,
    losses: 4,
    position: 4,
    goalsFor: 8,
    goalsAgainst: 16,
    goalDifference: -8,
  },
];

export async function GET() {
  // Simular delay de rede
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json(mockTeamRankings);
}
