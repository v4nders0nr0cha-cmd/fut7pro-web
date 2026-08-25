import { buildRankingCampeoesDoDia, resolveCampeoesPeriodoRange } from "../campeoes-do-dia-ranking";
import type { PublicMatch } from "@/types/partida";

function match(date: string, teamId: string, athleteId: string, name: string, isBot = false) {
  return {
    id: `${date}-${teamId}-${athleteId}`,
    date,
    location: null,
    scoreA: 1,
    scoreB: 0,
    score: { teamA: 1, teamB: 0 },
    teamA: { id: teamId, name: teamId, logoUrl: null, color: null },
    teamB: { id: "outro", name: "Outro", logoUrl: null, color: null },
    presences: [
      {
        id: `${athleteId}-presence`,
        matchId: `${date}-${teamId}`,
        tenantId: "tenant",
        athleteId,
        teamId,
        status: "TITULAR",
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        createdAt: date,
        updatedAt: date,
        athlete: {
          id: athleteId,
          name,
          nickname: null,
          position: "ATA",
          photoUrl: null,
          avatarUrl: null,
          isBot,
        } as any,
        team: { id: teamId, name: teamId, logoUrl: null, color: null },
      },
    ],
  } satisfies PublicMatch;
}

describe("Ranking Campeoes do Dia", () => {
  it("conta apenas Time Campeao do Dia oficialmente publicado e exclui BOT", () => {
    const rankings = buildRankingCampeoesDoDia(
      [
        match("2026-01-10T18:00:00.000Z", "campeao", "a1", "Atleta 1"),
        match("2026-01-11T18:00:00.000Z", "campeao", "a1", "Atleta 1"),
        match("2026-01-11T18:00:00.000Z", "campeao", "bot1", "BOT", true),
        match("2026-01-12T18:00:00.000Z", "campeao", "a2", "Atleta 2"),
      ],
      {
        "2026-01-10": {
          date: "2026-01-10",
          bannerUrl: null,
          zagueiroId: null,
          timeCampeaoDoDia: {
            id: "d1",
            teamId: "campeao",
            source: "calculated",
            status: "published",
            updatedAt: "2026-01-10",
            team: null,
          },
        },
        "2026-01-11": {
          date: "2026-01-11",
          bannerUrl: null,
          zagueiroId: null,
          timeCampeaoDoDia: {
            id: "d2",
            teamId: "campeao",
            source: "calculated",
            status: "published",
            updatedAt: "2026-01-11",
            team: null,
          },
        },
        "2026-01-12": {
          date: "2026-01-12",
          bannerUrl: null,
          zagueiroId: null,
          timeCampeaoDoDia: {
            id: "d3",
            teamId: "campeao",
            source: "calculated",
            status: "draft",
            updatedAt: "2026-01-12",
            team: null,
          },
        },
      }
    );

    expect(rankings).toEqual([expect.objectContaining({ athleteId: "a1", campeoesDoDia: 2 })]);
  });

  it("resolve os filtros administrativos de periodo", () => {
    const now = new Date("2026-08-25T12:00:00.000Z");

    expect(resolveCampeoesPeriodoRange("mes", now)).toMatchObject({
      from: "2026-08-01",
      to: "2026-08-31",
    });
    expect(resolveCampeoesPeriodoRange("quadrimestre", now)).toMatchObject({
      from: "2026-05-01",
      to: "2026-08-31",
    });
    expect(resolveCampeoesPeriodoRange("ano", now)).toMatchObject({
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });
});
