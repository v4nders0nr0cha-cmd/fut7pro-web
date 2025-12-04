import { renderHook, act } from "@testing-library/react";
import useSWR from "swr";
import { useAdmin } from "../useAdmin";
import { useApiState } from "../useApiState";
import { useRacha } from "@/context/RachaContext";
import type { Admin } from "@/types/admin";

jest.mock("swr");
jest.mock("../useApiState");
jest.mock("@/context/RachaContext");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockedApiState = useApiState as jest.MockedFunction<typeof useApiState>;
const mockedUseRacha = useRacha as jest.MockedFunction<typeof useRacha>;

describe("useAdmin", () => {
  beforeEach(() => {
    mockedUseRacha.mockReturnValue({
      rachaId: "racha-1",
      setRachaId: jest.fn(),
      clearRachaId: jest.fn(),
      isRachaSelected: true,
    });

    mockedApiState.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      setLoading: jest.fn(),
      setError: jest.fn(),
      setSuccess: jest.fn(),
      reset: jest.fn(),
      handleAsync: (fn) => fn(),
    } as any);
  });

  it("retorna admins carregados", () => {
    const admins: Admin[] = [
      { id: "1", usuarioId: "u1", nome: "Admin Teste", email: "a@b.com", role: "ADMIN" },
    ];

    mockedSWR.mockReturnValue({
      data: admins,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAdmin());

    expect(result.current.admins).toEqual(admins);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("propaga estado de loading e erro", () => {
    mockedSWR.mockReturnValue({
      data: undefined,
      error: new Error("falha"),
      isLoading: true,
      mutate: jest.fn(),
    } as any);

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(true);
  });

  it("executa addAdmin usando handleAsync", async () => {
    const mutate = jest.fn();
    mockedSWR.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      mutate,
    } as any);

    const handleAsync = jest.fn(async (fn: () => Promise<any>) => fn());
    mockedApiState.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      setLoading: jest.fn(),
      setError: jest.fn(),
      setSuccess: jest.fn(),
      reset: jest.fn(),
      handleAsync,
    } as any);

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "2" }),
    });
    (global as any).fetch = mockFetch;

    const { result } = renderHook(() => useAdmin());
    await act(async () => {
      await result.current.addAdmin({ nome: "Novo Admin" });
    });

    expect(handleAsync).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalled();
    expect(mutate).toHaveBeenCalled();
  });
});
