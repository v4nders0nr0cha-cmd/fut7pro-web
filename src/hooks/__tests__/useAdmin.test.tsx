import { renderHook } from "@testing-library/react";
import useSWR from "swr";
import { useAdmin } from "../useAdmin";

jest.mock("swr");

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({
    rachaId: "racha-1",
    setRachaId: jest.fn(),
    clearRachaId: jest.fn(),
    isRachaSelected: true,
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin User",
      },
    },
    status: "authenticated",
  })),
}));

jest.mock("@/hooks/useApiState", () => ({
  useApiState: () => ({
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    setLoading: jest.fn(),
    setError: jest.fn(),
    setSuccess: jest.fn(),
    reset: jest.fn(),
    handleAsync: async (fn: () => Promise<unknown>) => fn(),
  }),
}));

describe("useAdmin", () => {
  beforeEach(() => {
    (useSWR as jest.Mock).mockReset();
  });

  it("retorna lista de administradores quando SWR possui dados", () => {
    const admins = [
      { id: "1", usuarioId: "u1", nome: "Admin 1", role: "ADMIN" },
      { id: "2", usuarioId: "u2", nome: "Admin 2", role: "SUPORTE" },
    ];

    (useSWR as jest.Mock).mockReturnValue({
      data: admins,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.admins).toEqual(admins);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("propaga estado de carregamento do SWR", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.admins).toEqual([]);
  });

  it("indica erro quando SWR retorna falha", () => {
    const mockError = new Error("Erro ao buscar admins");
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
  });

  it("filtra administradores por role corretamente", () => {
    const admins = [
      { id: "1", usuarioId: "u1", nome: "Admin 1", role: "ADMIN" },
      { id: "2", usuarioId: "u2", nome: "Admin 2", role: "SUPORTE" },
      { id: "3", usuarioId: "u3", nome: "Admin 3", role: "ADMIN" },
    ];

    (useSWR as jest.Mock).mockReturnValue({
      data: admins,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.getAdminsPorRole("ADMIN")).toHaveLength(2);
    expect(result.current.getAdminsPorRole("SUPORTE")).toHaveLength(1);
  });

  it("localiza admin pelo id", () => {
    const admins = [{ id: "42", usuarioId: "u42", nome: "Admin 42", role: "ADMIN" }];
    (useSWR as jest.Mock).mockReturnValue({
      data: admins,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.getAdminById("42")).toEqual(admins[0]);
    expect(result.current.getAdminById("x")).toBeUndefined();
  });
});
