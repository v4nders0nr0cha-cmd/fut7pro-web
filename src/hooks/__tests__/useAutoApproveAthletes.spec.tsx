import { act, renderHook } from "@testing-library/react";
import useSWR from "swr";
import { useAutoApproveAthletes } from "../useAutoApproveAthletes";

jest.mock("swr");

const mockedUseSWR = useSWR as jest.Mock;
const mutate = jest.fn();

describe("useAutoApproveAthletes", () => {
  const now = new Date("2026-10-08T13:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    mutate.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("considera desligado quando a expiração já chegou", () => {
    mockedUseSWR.mockReturnValue({
      data: {
        autoApproveAthletes: true,
        autoApproveAthletesUntil: now.toISOString(),
      },
      error: null,
      isLoading: false,
      mutate,
    });

    const { result } = renderHook(() => useAutoApproveAthletes());

    expect(result.current.autoApproveAthletes).toBe(false);
    expect(result.current.autoApproveAthletesUntil).toBe(now.toISOString());
  });

  it("revalida automaticamente quando a janela termina", () => {
    mockedUseSWR.mockReturnValue({
      data: {
        autoApproveAthletes: true,
        autoApproveAthletesUntil: new Date(now.getTime() + 1_000).toISOString(),
      },
      error: null,
      isLoading: false,
      mutate,
    });

    const { result } = renderHook(() => useAutoApproveAthletes());
    expect(result.current.autoApproveAthletes).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1_050);
    });

    expect(mutate).toHaveBeenCalled();
  });
});
