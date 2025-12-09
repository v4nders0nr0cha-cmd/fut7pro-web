import { act, renderHook } from "@testing-library/react";
import useSWR from "swr";
import { useTimes } from "@/hooks/useTimes";

global.fetch = jest.fn();

describe("useTimes", () => {
  const mockedUseSWR = useSWR as unknown as jest.Mock;

  beforeEach(() => {
    mockedUseSWR.mockReturnValue({
      data: [{ id: "t1", nome: "Time 1" }],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("retorna dados basicos do hook", async () => {
    const mutate = jest.fn();
    mockedUseSWR.mockReturnValue({
      data: [{ id: "t1", nome: "Time 1" }],
      isLoading: false,
      error: undefined,
      mutate,
    });

    const { result } = renderHook(() => useTimes("r1"));

    expect(Array.isArray(result.current.times)).toBe(true);
    expect(result.current.times[0]?.nome).toBe("Time 1");
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.addTime({ nome: "Novo Time" });
      await result.current.updateTime({ id: "t1", nome: "Time 1" } as any);
      await result.current.deleteTime("t1");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/times?slug=r1",
      expect.objectContaining({ method: "POST" })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/times/t1?slug=r1",
      expect.objectContaining({ method: "PUT" })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/times/t1?slug=r1",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(mutate).toHaveBeenCalledTimes(3);
  });
});
