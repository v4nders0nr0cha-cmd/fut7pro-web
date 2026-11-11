import {
  matchBaseline,
  matchDraftKey,
  matchesPersistedResult,
  readMatchDraft,
} from "../ResultadosDoDiaAdmin";
import type { PublicMatch } from "@/types/partida";

const match = {
  id: "match-1",
  status: "in_progress",
  scoreA: 0,
  scoreB: 0,
  presences: [{ id: "presence-1", goals: 0, assists: 0, updatedAt: "initial" }],
} as PublicMatch;

describe("resultados do dia draft recovery", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("restores unsaved goal and assist edits only for the same admin and tenant", () => {
    const events = [
      {
        id: "goal-1",
        teamId: "team-1",
        scorerId: "athlete-1",
        assistId: "athlete-2",
        isOwnGoal: false,
        minute: "12",
        description: "",
        source: "new",
      },
    ];
    window.sessionStorage.setItem(
      matchDraftKey("admin-1:tenant-1", match.id),
      JSON.stringify({
        baseline: matchBaseline(match),
        savedAt: Date.now(),
        events,
        status: "in_progress",
      })
    );

    expect(readMatchDraft(match, "admin-1:tenant-1")).toEqual(
      expect.objectContaining({
        events,
        status: "in_progress",
        conflict: false,
      })
    );
    expect(readMatchDraft(match, "admin-2:tenant-1")).toBeNull();
    expect(readMatchDraft(match, "admin-1:tenant-2")).toBeNull();
  });

  it("preserves an unsaved goal and assist when another admin changes the server result", () => {
    const events = [
      {
        id: "goal-2",
        teamId: "team-1",
        scorerId: "athlete-1",
        assistId: "athlete-2",
        source: "new",
      },
    ];
    window.sessionStorage.setItem(
      matchDraftKey("admin-1:tenant-1", match.id),
      JSON.stringify({
        baseline: matchBaseline(match),
        savedAt: Date.now(),
        events,
        status: "in_progress",
      })
    );
    const newer = { ...match, scoreA: 1 };

    expect(readMatchDraft(newer, "admin-1:tenant-1")).toEqual(
      expect.objectContaining({
        events,
        conflict: true,
      })
    );
    expect(
      window.sessionStorage.getItem(matchDraftKey("admin-1:tenant-1", match.id))
    ).not.toBeNull();
  });

  it("recognizes a lost success response without resending a goal or assist", () => {
    const saved = {
      ...match,
      scoreA: 1,
      presences: [
        {
          id: "presence-1",
          athleteId: "athlete-1",
          teamId: "team-1",
          status: "TITULAR",
          goals: 1,
          assists: 1,
        },
      ],
    } as PublicMatch;
    const payload = {
      scoreA: 1,
      scoreB: 0,
      status: "in_progress" as const,
      presences: [
        {
          athleteId: "athlete-1",
          teamId: "team-1",
          status: "TITULAR" as const,
          goals: 1,
          assists: 1,
        },
      ],
    };
    expect(matchesPersistedResult(saved, payload)).toBe(true);
    expect(
      matchesPersistedResult(
        { ...saved, presences: [{ ...saved.presences[0], assists: 2 }] },
        payload
      )
    ).toBe(false);
    expect(
      matchesPersistedResult(
        {
          ...saved,
          presences: [
            ...saved.presences,
            {
              ...saved.presences[0],
              id: "presence-2",
              athleteId: "athlete-2",
            },
          ],
        },
        payload
      )
    ).toBe(false);
  });
});
