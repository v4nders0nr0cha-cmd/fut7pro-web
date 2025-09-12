import { renderHook, act } from "@testing-library/react";
import { useAdmin } from "../useAdmin";
import { Role } from "@/common/enums";

// Mock do SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock do NextAuth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("useAdmin", () => {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return admin data when user is authenticated", () => {
    const { useSession } = require("next-auth/react");
    const { default: useSWR } = require("swr");

    useSession.mockReturnValue(mockSession);
    useSWR.mockReturnValue({
      data: mockRachaData,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user).toEqual(mockSession.data.user);
    expect(result.current.racha).toEqual(mockRachaData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("should return false for isAdmin when user is not authenticated", () => {
    const { useSession } = require("next-auth/react");
    const { default: useSWR } = require("swr");

    useSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });
    useSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.racha).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("should return loading state when session is loading", () => {
    const { useSession } = require("next-auth/react");
    const { default: useSWR } = require("swr");

    useSession.mockReturnValue({
      data: null,
      status: "loading",
    });
    useSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it("should handle error state", () => {
    const { useSession } = require("next-auth/react");
    const { default: useSWR } = require("swr");

    const mockError = new Error("Failed to fetch racha data");

    useSession.mockReturnValue(mockSession);
    useSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it("should return correct permissions based on user role", () => {
    const { useSession } = require("next-auth/react");
    const { default: useSWR } = require("swr");

    const gerenteSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.GERENTE,
        },
      },
    };

    useSession.mockReturnValue(gerenteSession);
    useSWR.mockReturnValue({
      data: mockRachaData,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user?.role).toBe(Role.GERENTE);
  });

  it("should handle different user roles correctly", () => {
    const { useSession } = require("next-auth/react");
    const { default: useSWR } = require("swr");

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
    useSWR.mockReturnValue({
      data: mockRachaData,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user?.role).toBe(Role.SUPORTE);
  });

  it("should return false for isAdmin when user role is ATLETA", () => {
    const { useSession } = require("next-auth/react");
    const { default: useSWR } = require("swr");

    const atletaSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: Role.ATLETA,
        },
      },
    };

    useSession.mockReturnValue(atletaSession);
    useSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user?.role).toBe(Role.ATLETA);
  });
});
