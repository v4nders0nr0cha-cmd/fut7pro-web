import { act, renderHook } from "@testing-library/react";
import { useSessionRefreshScheduler } from "../useSessionRefreshScheduler";

describe("useSessionRefreshScheduler", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renews on Safari foreground even when background timers never ran", async () => {
    jest.useFakeTimers();
    const startedAt = Date.now();
    const clock = jest.spyOn(Date, "now").mockReturnValue(startedAt);
    const refreshSession = jest.fn().mockResolvedValue({
      user: { accessToken: "new-access", accessTokenExp: Math.floor(startedAt / 1000) + 900 },
    });
    const onRefreshSuccess = jest.fn();
    renderHook(() => useSessionRefreshScheduler({
      status: "authenticated",
      session: { user: { accessToken: "old-access", accessTokenExp: Math.floor(startedAt / 1000) + 240 } },
      refreshSession,
      onRefreshSuccess,
    }));

    clock.mockReturnValue(startedAt + 3 * 60_000);
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(onRefreshSuccess).toHaveBeenCalledTimes(1);
  });
});
