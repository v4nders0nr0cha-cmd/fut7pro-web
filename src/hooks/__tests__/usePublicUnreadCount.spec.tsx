import { act, renderHook } from "@testing-library/react";
import useSWR from "swr";
import { usePublicUnreadCount } from "../usePublicUnreadCount";

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: () => ({ publicSlug: "seu-racha" }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

const mockedUseSWR = useSWR as jest.Mock;

describe("usePublicUnreadCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });
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
