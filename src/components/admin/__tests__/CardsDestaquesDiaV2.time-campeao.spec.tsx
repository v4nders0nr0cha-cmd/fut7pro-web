import { render, screen } from "@testing-library/react";
import CardsDestaquesDiaV2 from "@/components/admin/CardsDestaquesDiaV2";
import { buildDestaquesDoDia, getTimeCampeao } from "@/utils/destaquesDoDia";

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "racha-teste" }),
}));

jest.mock("@/hooks/usePublicMatches", () => ({
  usePublicMatches: () => ({
    matches: [],
    isLoading: false,
    isError: false,
  }),
}));

function makeMatch() {
  return {
    id: "match-1",
    date: "2026-08-28T12:00:00.000Z",
    scoreA: 2,
    scoreB: 1,
    teamAId: "team-1",
    teamBId: "team-2",
    teamA: { id: "team-1", name: "Gavioes", logoUrl: null, color: null },
    teamB: { id: "team-2", name: "Falcao", logoUrl: null, color: null },
    presences: [
      {
        id: "presence-1",
        status: "TITULAR",
        teamId: "team-1",
        goals: 0,
        assists: 2,
        effectivePosition: "MEIA",
        athlete: {
          id: "athlete-zag-mei",
          name: "Zagueiro Meia",
          nickname: null,
          position: "ZAGUEIRO",
          photoUrl: null,
          isBot: false,
        },
      },
      {
        id: "presence-2",
        status: "TITULAR",
        teamId: "team-1",
        goals: 0,
        assists: 0,
        effectivePosition: "ZAGUEIRO",
        athlete: {
          id: "athlete-mei-zag",
          name: "Meia Zagueiro",
          nickname: null,
          position: "MEIA",
          photoUrl: null,
          isBot: false,
        },
      },
      {
        id: "presence-3",
        status: "TITULAR",
        teamId: "team-1",
        goals: 1,
        assists: 0,
        effectivePosition: "ATACANTE",
        athlete: {
          id: "athlete-ata",
          name: "Atacante",
          nickname: null,
          position: "ATACANTE",
          photoUrl: null,
          isBot: false,
        },
      },
      {
        id: "presence-4",
        status: "TITULAR",
        teamId: "team-1",
        goals: 0,
        assists: 0,
        effectivePosition: "GOLEIRO",
        athlete: {
          id: "athlete-gol",
          name: "Goleiro",
          nickname: null,
          position: "GOLEIRO",
          photoUrl: null,
          isBot: false,
        },
      },
      {
        id: "presence-bot-legado",
        status: "TITULAR",
        teamId: "team-1",
        goals: 4,
        assists: 4,
        effectivePosition: "ZAGUEIRO",
        athlete: {
          id: "bot-legado",
          name: "BOT Legado",
          nickname: null,
          position: "ZAGUEIRO",
          photoUrl: null,
          isBot: false,
          bot: true,
          tipo: "BOT",
        },
      },
    ],
  };
}

describe("CardsDestaquesDiaV2 - posicao efetiva", () => {
  it("usa posicao efetiva do sorteio para destaques e seletor de zagueiro", () => {
    const { confrontos, times } = buildDestaquesDoDia([makeMatch() as any]);
    const champion = getTimeCampeao(confrontos, times);

    expect(champion?.time.jogadores.find((jogador) => jogador.id === "athlete-zag-mei")?.pos).toBe(
      "MEIA"
    );
    expect(champion?.time.jogadores.find((jogador) => jogador.id === "athlete-mei-zag")?.pos).toBe(
      "ZAG"
    );

    render(<CardsDestaquesDiaV2 confrontos={confrontos} times={times} />);

    expect(screen.getAllByText("Zagueiro Meia").length).toBeGreaterThan(0);
    expect(screen.getByRole("option", { name: /Meia Zagueiro/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Zagueiro Meia/i })).not.toBeInTheDocument();
    expect(screen.queryByText("BOT Legado")).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /BOT Legado/i })).not.toBeInTheDocument();
  });
});
