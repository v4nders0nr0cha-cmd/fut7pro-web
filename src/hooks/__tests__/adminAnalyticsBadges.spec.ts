import { renderHook } from "@testing-library/react";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useAdminBadges } from "@/hooks/useAdminBadges";

const mockSWR = jest.fn();

jest.mock("swr", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockSWR(...args),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "slug-test" }),
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

  it("retorna badges com solicitacoes pendentes", () => {
    mockSWR.mockReturnValue({
      data: { count: 3 },
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useAdminBadges());
    expect(mockSWR).toHaveBeenCalledWith(
      "/api/admin/solicitacoes?status=PENDENTE&count=1",
      expect.any(Function),
      expect.any(Object)
    );
    expect(result.current.badges).toEqual({
      dashboard: 0,
      notificacoes: 0,
      mensagens: 0,
      solicitacoes: 3,
      perfil: 0,
    });
  });
});
