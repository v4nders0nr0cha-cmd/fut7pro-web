import { resolveLatestDayHighlights } from "../Sidebar";
import type { PublicMatch } from "@/types/partida";

const match = (
  date: string,
  scores: [number | null, number | null],
  entries: Array<[string, number, number, ("TITULAR" | "AUSENTE")?]>
): PublicMatch =>
  ({
    id: date,
    date,
    scoreA: scores[0],
    scoreB: scores[1],
    score: { teamA: scores[0] ?? 0, teamB: scores[1] ?? 0 },
    presences: entries.map(([id, goals, assists, status]) => ({
      athleteId: id,
      status: status ?? "TITULAR",
      goals,
      assists,
      athlete: { id, name: id, photoUrl: null },
    })),
  }) as PublicMatch;

describe("destaques do ultimo dia publicado", () => {
  it("soma partidas do mesmo dia e desempata gols por assistencias", () => {
    const result = resolveLatestDayHighlights([
      match(
        "2026-08-24T10:00:00Z",
        [2, 1],
        [
          ["Ana", 1, 1],
          ["Bia", 2, 0],
        ]
      ),
      match("2026-08-24T12:00:00Z", [1, 0], [["Ana", 1, 1]]),
      match("2026-08-23T10:00:00Z", [5, 0], [["Cris", 5, 4]]),
    ]);
    expect(result.artilheiro?.name).toBe("Ana");
    expect(result.artilheiro?.goals).toBe(2);
    expect(result.maestro?.name).toBe("Ana");
  });

  it("nao cria maestro sem assistencias nem usa placar nao publicado", () => {
    const result = resolveLatestDayHighlights([
      match("2026-08-25T10:00:00Z", [null, null], [["Cris", 8, 8]]),
      match(
        "2026-08-24T10:00:00Z",
        [1, 0],
        [
          ["Ana", 1, 0],
          ["Bia", 2, 2, "AUSENTE"],
        ]
      ),
    ]);
    expect(result.artilheiro?.name).toBe("Ana");
    expect(result.maestro).toBeNull();
  });

  it("usa o dia de Fortaleza na virada UTC e nao inclui jogo do dia anterior", () => {
    const result = resolveLatestDayHighlights([
      match("2026-08-25T02:30:00Z", [1, 0], [["Ana", 1, 0]]),
      match("2026-08-25T03:30:00Z", [1, 0], [["Bia", 1, 0]]),
    ]);
    expect(result.artilheiro?.name).toBe("Bia");
  });
});
