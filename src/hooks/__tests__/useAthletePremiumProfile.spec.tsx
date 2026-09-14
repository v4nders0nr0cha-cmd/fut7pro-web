import { renderHook } from "@testing-library/react";
import useSWR from "swr";
import {
  useOwnerAthletePremiumProfile,
  usePublicAthletePremiumProfile,
} from "../useAthletePremiumProfile";

jest.mock("swr", () => jest.fn());

const mockedUseSWR = useSWR as jest.Mock;

describe("useAthletePremiumProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
  });

  it("nao faz retry automatico para 401/403/429 no perfil premium do dono", () => {
    renderHook(() => useOwnerAthletePremiumProfile({ tenantSlug: "seu-racha", enabled: true }));

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

  it("preserva status no erro do fetcher do perfil premium", async () => {
    renderHook(() =>
      usePublicAthletePremiumProfile({
        tenantSlug: "seu-racha",
        athleteSlug: "neymar",
        enabled: true,
      })
    );
    const fetcher = mockedUseSWR.mock.calls[0][1];
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: { get: jest.fn(() => null) },
      text: jest.fn().mockResolvedValue(JSON.stringify({ message: "Forbidden" })),
    });

    await expect(
      fetcher("/api/public/seu-racha/athletes/neymar/premium-profile")
    ).rejects.toMatchObject({
      message: "Forbidden",
      status: 403,
    });
  });
});
