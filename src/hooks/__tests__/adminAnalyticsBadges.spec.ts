import { renderHook } from "@testing-library/react";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useAdminBadges } from "@/hooks/useAdminBadges";

const mockSWR = jest.fn();

jest.mock("swr", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockSWR(...args),
  mutate: jest.fn(),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "slug-test" }),
}));

jest.mock("@/hooks/useAdminNotifications", () => ({
  useAdminNotifications: () => ({
    unreadCount: 0,
  }),
}));

describe("useAdminAnalytics", () => {
  beforeEach(() => mockSWR.mockReset());

  it("monta URL com slug e periodo customizado, retornando dados", () => {
    mockSWR.mockReturnValue({
      data: { summary: { jogadores: 10 } },
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useAdminAnalytics({ period: "month" as any }));

    expect(mockSWR).toHaveBeenCalledWith(
      "/api/admin/analytics?period=month&slug=slug-test",
      expect.any(Function)
    );
    expect(result.current.analytics).toEqual({ summary: { jogadores: 10 } });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("fica em loading quando sem data e sem erro", () => {
    mockSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
      isValidating: true,
    });

    const { result } = renderHook(() => useAdminAnalytics());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});

describe("useAdminBadges", () => {
  beforeEach(() => mockSWR.mockReset());

  it("soma entradas e pedidos de mensalista do grupo ativo", () => {
    mockSWR.mockImplementation((key: [string, string]) => ({
      data: key[0].includes("mensalistas") ? { total: 2 } : { count: 3 },
      error: undefined,
    }));

    const { result } = renderHook(() => useAdminBadges());
    expect(mockSWR).toHaveBeenCalledWith(
      ["/api/admin/solicitacoes?status=PENDENTE&count=1", "slug-test"],
      expect.any(Function),
      expect.any(Object)
    );
    expect(mockSWR).toHaveBeenCalledWith(
      ["/api/admin/mensalistas/requests?count=1", "slug-test"],
      expect.any(Function),
      expect.any(Object)
    );
    expect(result.current.badges).toEqual({
      dashboard: 0,
      notificacoes: 0,
      mensagens: 0,
      solicitacoes: 5,
      perfil: 0,
    });
  });

  it("não confirma zero quando uma das consultas falha", () => {
    mockSWR.mockImplementation((key: [string, string]) => ({
      data: key[0].includes("mensalistas") ? undefined : { count: 0 },
      error: key[0].includes("mensalistas") ? new Error("API indisponível") : undefined,
    }));
    const { result } = renderHook(() => useAdminBadges());
    expect(result.current.badges.solicitacoes).toBeNull();
  });
});
