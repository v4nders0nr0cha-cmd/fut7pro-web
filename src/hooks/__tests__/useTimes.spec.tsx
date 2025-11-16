import { renderHook } from "@testing-library/react";
import { useTimes } from "@/hooks/useTimes";
import useSWR from "swr";

jest.mock("swr");

describe("useTimes", () => {
  beforeEach(() => {
    (useSWR as jest.Mock).mockReset();
  });

  it("retorna dados básicos do hook com tenant informado", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [
        {
          id: "t1",
          nome: "Time 1",
          slug: "time-1",
          logo: "/logos/time1.png",
          cor: "#FFD700",
          rachaId: "r1",
        },
      ],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useTimes("r1"));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.times).toHaveLength(1);
  });

  it("propaga estado de carregamento do SWR", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useTimes("r1"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.times).toEqual([]);
  });

  it("informa erro quando SWR retorna falha", () => {
    const mockError = new Error("Falha ao carregar");
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useTimes("r1"));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError.message);
  });
});
