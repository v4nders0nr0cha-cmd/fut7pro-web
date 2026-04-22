import { buildAttendanceRanking, countValidAttendance } from "@/lib/attendance";

describe("attendance helpers", () => {
  const now = new Date(2026, 3, 22);

  it("conta apenas presencas validas no periodo", () => {
    const presences = [
      { status: "TITULAR", match: { date: "2026-04-02T19:00:00.000Z" } },
      { status: "SUBSTITUTO", match: { date: "2026-04-09T19:00:00.000Z" } },
      { status: "AUSENTE", match: { date: "2026-04-16T19:00:00.000Z" } },
      { status: "TITULAR", match: { date: "2025-12-20T19:00:00.000Z" } },
    ];

    expect(countValidAttendance(presences, "mes", now)).toBe(2);
    expect(countValidAttendance(presences, "todos", now)).toBe(3);
  });

  it("ordena jogadores por jogos validos", () => {
    const ranking = buildAttendanceRanking(
      [
        {
          id: "a",
          nome: "Ana",
          presences: [{ status: "TITULAR", match: { date: "2026-04-02T19:00:00.000Z" } }],
        },
        {
          id: "b",
          nome: "Beto",
          presences: [
            { status: "TITULAR", match: { date: "2026-04-02T19:00:00.000Z" } },
            { status: "SUBSTITUTO", match: { date: "2026-04-09T19:00:00.000Z" } },
          ],
        },
      ],
      "todos",
      now
    );

    expect(ranking.map((item) => [item.player.id, item.jogos])).toEqual([
      ["b", 2],
      ["a", 1],
    ]);
  });

  it("nao usa fallback quando ha presencas registradas, mas invalidas", () => {
    const ranking = buildAttendanceRanking(
      [
        {
          id: "a",
          nome: "Ana",
          presencas: 8,
          presences: [{ status: "AUSENTE", match: { date: "2026-04-02T19:00:00.000Z" } }],
        },
      ],
      "todos",
      now
    );

    expect(ranking[0].jogos).toBe(0);
  });
});
