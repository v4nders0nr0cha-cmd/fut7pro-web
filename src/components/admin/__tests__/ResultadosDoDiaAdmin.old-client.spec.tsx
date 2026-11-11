import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MatchModal, matchBaseline, matchDraftKey } from "../ResultadosDoDiaAdmin";
import type { PublicMatch } from "@/types/partida";

const match = {
  id: "match-1",
  resultVersion: 0,
  date: "2026-11-11T12:00:00.000Z",
  location: "Campo",
  status: "in_progress",
  scoreA: 0,
  scoreB: 0,
  teamA: { id: "team-a", name: "Time A", logoUrl: null },
  teamB: { id: "team-b", name: "Time B", logoUrl: null },
  presences: [],
} as PublicMatch;

describe("old match-result client", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete (global as { fetch?: typeof fetch }).fetch;
    window.sessionStorage.clear();
  });

  it("shows HTTP 428 after a manual save and retains the unsaved draft", async () => {
    const scope = "admin-1:tenant-1";
    const key = matchDraftKey(scope, match.id);
    const events = [
      {
        id: "goal-1",
        teamId: "team-a",
        scorerId: "athlete-1",
        assistId: "athlete-2",
        isOwnGoal: false,
        minute: "12",
        description: "",
        source: "new",
      },
    ];
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        baseline: matchBaseline(match),
        savedAt: Date.now(),
        events,
        status: "in_progress",
      })
    );
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => match } as Response)
      .mockResolvedValueOnce({ ok: false, status: 428 } as Response);
    global.fetch = fetchMock as typeof fetch;

    render(
      <MatchModal
        match={match}
        draftScope={scope}
        status="in_progress"
        onStatusChange={jest.fn()}
        onClose={jest.fn()}
        onSaved={jest.fn()}
        onDiscard={jest.fn()}
      />
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Fechar" })[1]);

    await waitFor(() =>
      expect(screen.getByText(/Anote suas alterações antes de atualizar/)).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Salvar após revisão" })).toBeDisabled();
    expect(JSON.parse(window.sessionStorage.getItem(key) || "null")?.events).toEqual(events);
  });

  it("shows HTTP 428 from autosave without retrying or deleting the draft", async () => {
    jest.useFakeTimers();
    const scope = "admin-1:tenant-1";
    const key = matchDraftKey(scope, match.id);
    const events = [
      {
        id: "goal-1",
        teamId: "team-a",
        scorerId: "athlete-1",
        assistId: "athlete-2",
        isOwnGoal: false,
        minute: "12",
        description: "",
        source: "new",
      },
    ];
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        baseline: matchBaseline(match),
        savedAt: Date.now(),
        events,
        status: "in_progress",
      })
    );
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => match } as Response)
      .mockResolvedValueOnce({ ok: false, status: 428 } as Response);
    global.fetch = fetchMock as typeof fetch;

    render(
      <MatchModal
        match={match}
        draftScope={scope}
        status="in_progress"
        onStatusChange={jest.fn()}
        onClose={jest.fn()}
        onSaved={jest.fn()}
        onDiscard={jest.fn()}
      />
    );
    await act(async () => {
      await jest.advanceTimersByTimeAsync(700);
    });

    expect(screen.getByText(/Anote suas alterações antes de atualizar/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(window.sessionStorage.getItem(key) || "null")?.events).toEqual(events);
  });
});
