import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { useRachaData } from "../useRachaData";
import { Role } from "@prisma/client";

// Mock do fetch
global.fetch = jest.fn();

// Mock do NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("useRachaData Integration", () => {
  const mockSession = {
    data: {
      user: {
        id: "user-1",
        email: "admin@test.com",
        name: "Admin User",
        role: Role.GERENTE,
        tenantId: "tenant-1",
      },
      expires: "2024-12-31",
    },
    status: "authenticated",
  };

  const mockRachaData = {
    id: "racha-1",
    name: "Test Racha",
    tenantId: "tenant-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    configuracoes: {
      duracaoRachaMin: 90,
      duracaoPartidaMin: 15,
      numTimes: 4,
      jogadoresPorTime: 7,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it("should fetch racha data successfully", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRachaData,
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockRachaData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/racha"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("should handle API errors gracefully", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  it("should handle 401 unauthorized error", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle 403 forbidden error", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle 500 server error", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should retry failed requests", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    // Primeira chamada falha
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    // Segunda chamada sucede
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRachaData,
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig
          value={{
            provider: () => new Map(),
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
              if (retryCount < 3) {
                setTimeout(() => revalidate({ retryCount }), 1000);
              }
            },
          }}
        >
          {children}
        </SWRConfig>
      ),
    });

    await waitFor(
      () => {
        expect(result.current.data).toEqual(mockRachaData);
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 }
    );
  });

  it("should handle different user roles correctly", async () => {
    const { useSession } = require("next-auth/react");
    const suporteSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.SUPORTE,
        },
      },
    };
    useSession.mockReturnValue(suporteSession);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRachaData,
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockRachaData);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle unauthenticated users", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should handle loading state correctly", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    // Simular delay na resposta
    (fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => mockRachaData,
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    // Verificar estado de loading inicial
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockRachaData);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle malformed JSON response", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle timeout scenarios", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue(mockSession);

    // Simular timeout
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 5000))
    );

    const { result } = renderHook(() => useRachaData(), {
      wrapper: ({ children }) => (
        <SWRConfig
          value={{
            provider: () => new Map(),
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
              if (retryCount < 2) {
                setTimeout(() => revalidate({ retryCount }), 1000);
              }
            },
          }}
        >
          {children}
        </SWRConfig>
      ),
    });

    await waitFor(
      () => {
        expect(result.current.error).toBeDefined();
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 10000 }
    );
  });
});
