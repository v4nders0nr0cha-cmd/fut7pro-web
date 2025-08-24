import { NextResponse } from "next/server";

// Dados mockados para times
const mockTeams = [
  {
    id: "team-1",
    name: "Flamengo",
    logo: "/images/logos/flamengo.png",
    color: "#e63946",
    players: [
      "player-1",
      "player-2",
      "player-3",
      "player-4",
      "player-5",
      "player-6",
      "player-7",
    ],
  },
  {
    id: "team-2",
    name: "Palmeiras",
    logo: "/images/logos/palmeiras.png",
    color: "#006400",
    players: [
      "player-8",
      "player-9",
      "player-10",
      "player-11",
      "player-12",
      "player-13",
      "player-14",
    ],
  },
  {
    id: "team-3",
    name: "São Paulo",
    logo: "/images/logos/sao-paulo.png",
    color: "#ff0000",
    players: [
      "player-15",
      "player-16",
      "player-17",
      "player-18",
      "player-19",
      "player-20",
      "player-21",
    ],
  },
  {
    id: "team-4",
    name: "Santos",
    logo: "/images/logos/santos.png",
    color: "#000000",
    players: [
      "player-22",
      "player-23",
      "player-24",
      "player-25",
      "player-26",
      "player-27",
      "player-28",
    ],
  },
];

export async function GET() {
  // Simular delay de rede
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json(mockTeams);
}
