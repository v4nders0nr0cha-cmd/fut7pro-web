import { act, renderHook } from "@testing-library/react";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";

const mutate = jest.fn();
const mockSWR = jest.fn();

jest.mock("swr", () => ({
  __esModule: true,
  default: (...args: any[]) => mockSWR(...args),
}));

describe("usePatrocinadores", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    mockSWR.mockReset();
    mutate.mockReset();
    fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    (global as any).fetch = fetchMock;
  });

  it("normaliza dados do backend para o formato do painel", () => {
    mockSWR.mockReturnValue({
      data: [
        {
          id: "1",
          name: "Patro A",
          logoUrl: "",
          periodStart: "2000-01-01",
          periodEnd: "2999-01-01",
          showOnFooter: undefined,
        },
      ],
      error: undefined,
      mutate,
      isLoading: false,
    });

    const { result } = renderHook(() => usePatrocinadores());
    expect(result.current.patrocinadores[0]).toMatchObject({
      id: "1",
      nome: "Patro A",
      visivel: true,
      comprovantes: [],
      status: "ativo",
      billingPlan: "MENSAL",
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("envia payload e chama mutate ao adicionar", async () => {
    mockSWR.mockReturnValue({ data: [], error: undefined, mutate, isLoading: false });
    const { result } = renderHook(() => usePatrocinadores());

    await act(async () => {
      await result.current.addPatrocinador({
        id: "p1",
        nome: "Teste",
        logo: "/logo.png",
        valor: 100,
        periodoInicio: "2025-01-01",
        periodoFim: "2025-12-31",
        visivel: false,
        comprovantes: ["c1"],
      } as any);
    });

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse(init.body);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/patrocinadores",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(payload).toMatchObject({
      name: "Teste",
      logoUrl: "/logo.png",
      showOnFooter: false,
      value: 100,
      billingPlan: "MENSAL",
    });
    expect(payload.periodStart).toContain("2025-01-01");
    expect(payload.periodEnd).toContain("2025-12-31");
    expect(mutate).toHaveBeenCalled();
  });
});
