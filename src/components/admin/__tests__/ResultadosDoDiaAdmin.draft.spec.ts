import { matchBaseline, matchDraftKey, readMatchDraft } from "../ResultadosDoDiaAdmin";
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
    const events = [{
      id: "goal-1", teamId: "team-1", scorerId: "athlete-1", assistId: "athlete-2",
      isOwnGoal: false, minute: "12", description: "", source: "new",
    }];
    window.sessionStorage.setItem(matchDraftKey("admin-1:tenant-1", match.id), JSON.stringify({
      baseline: matchBaseline(match), savedAt: Date.now(), events, status: "in_progress",
    }));

    expect(readMatchDraft(match, "admin-1:tenant-1")).toEqual({ events, status: "in_progress" });
    expect(readMatchDraft(match, "admin-2:tenant-1")).toBeNull();
    expect(readMatchDraft(match, "admin-1:tenant-2")).toBeNull();
  });

  it("does not replay a draft over a newer server result", () => {
    window.sessionStorage.setItem(matchDraftKey("admin-1:tenant-1", match.id), JSON.stringify({
      baseline: matchBaseline(match), savedAt: Date.now(), events: [], status: "in_progress",
    }));
    const newer = { ...match, scoreA: 1 };

    expect(readMatchDraft(newer, "admin-1:tenant-1")).toBeNull();
    expect(window.sessionStorage.getItem(matchDraftKey("admin-1:tenant-1", match.id))).toBeNull();
  });
});
