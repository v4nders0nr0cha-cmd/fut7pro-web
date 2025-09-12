import { renderHook, waitFor } from "@testing-library/react";
import { useTimes } from "@/hooks/useTimes";

// Mock do fetch
global.fetch = jest.fn();

afterEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe("useTimes", () => {
  it("retorna dados básicos do hook", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [{ id: "t1", nome: "Time 1" }],
    } as any);

    const { result } = renderHook(() => useTimes("r1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(Array.isArray(result.current.times)).toBe(true);
  });
});
