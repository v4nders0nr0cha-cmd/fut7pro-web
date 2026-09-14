import { act, renderHook } from "@testing-library/react";
import useSWR from "swr";
import { resolveRateLimitPauseMs, usePublicUnreadCount } from "../usePublicUnreadCount";

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: () => ({ publicSlug: "seu-racha" }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

const mockedUseSWR = useSWR as jest.Mock;

describe("usePublicUnreadCount", () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    mockedUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("nao faz retry automatico para 401/403/429 e limita os demais erros", () => {
    renderHook(() => usePublicUnreadCount(true, 30000));

    const options = mockedUseSWR.mock.calls[0][2];

    expect(
      options.shouldRetryOnError(Object.assign(new Error("unauthorized"), { status: 401 }))
    ).toBe(false);
    expect(options.shouldRetryOnError(Object.assign(new Error("forbidden"), { status: 403 }))).toBe(
      false
    );
    expect(
      options.shouldRetryOnError(Object.assign(new Error("rate limit"), { status: 429 }))
    ).toBe(false);
    expect(options.shouldRetryOnError(Object.assign(new Error("server"), { status: 500 }))).toBe(
      true
    );
    expect(options.errorRetryCount).toBe(1);
  });

  it("pausa refreshInterval depois de erro de autenticacao", () => {
    const { rerender } = renderHook(() => usePublicUnreadCount(true, 30000));
    const firstOptions = mockedUseSWR.mock.calls[0][2];

    act(() => {
      firstOptions.onError(Object.assign(new Error("unauthorized"), { status: 401 }));
    });
    rerender();

    const secondOptions = mockedUseSWR.mock.calls[1][2];
    expect(secondOptions.refreshInterval).toBe(0);
  });

  it("pausa 429 temporariamente e revalida depois do Retry-After", () => {
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    const mutate = jest.fn();
    const scheduled: Array<{ callback: () => void; delay: number }> = [];
    jest.spyOn(global, "setTimeout").mockImplementation(((callback: () => void, delay?: number) => {
      scheduled.push({ callback, delay: Number(delay) });
      return scheduled.length as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout);
    jest.spyOn(global, "clearTimeout").mockImplementation((() => undefined) as typeof clearTimeout);
    mockedUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate,
    });

    const { rerender, unmount } = renderHook(() => usePublicUnreadCount(true, 30000));
    const firstOptions = mockedUseSWR.mock.calls[0][2];

    act(() => {
      firstOptions.onError(
        Object.assign(new Error("rate limit"), { status: 429, retryAfter: "2" })
      );
    });
    rerender();
    expect(mockedUseSWR.mock.calls[1][2].refreshInterval).toBe(0);
    expect(scheduled[0]?.delay).toBe(2000);

    act(() => {
      scheduled[0]?.callback();
    });
    rerender();

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mockedUseSWR.mock.calls.at(-1)?.[2].refreshInterval).toBe(30000);
    unmount();
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });

  it("usa fallback seguro de 60 segundos para 429 sem Retry-After valido", () => {
    expect(resolveRateLimitPauseMs(null)).toBe(60000);
    expect(resolveRateLimitPauseMs("abc")).toBe(60000);
    expect(resolveRateLimitPauseMs("0")).toBe(60000);
  });

  it("inclui status no erro retornado pelo fetcher", async () => {
    renderHook(() => usePublicUnreadCount(true, 30000));
    const fetcher = mockedUseSWR.mock.calls[0][1];
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: jest.fn(() => null) },
      text: jest.fn().mockResolvedValue(JSON.stringify({ message: "Nao autenticado" })),
    });

    await expect(fetcher("/api/public/seu-racha/notifications/unread-count")).rejects.toMatchObject(
      {
        message: "Nao autenticado",
        status: 401,
      }
    );
  });
});
