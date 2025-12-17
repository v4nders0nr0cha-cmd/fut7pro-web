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

  it("normaliza visibilidade e comprovantes", () => {
    mockSWR.mockReturnValue({
      data: [
        {
          id: "1",
          nome: "Patro A",
          comprovantes: undefined,
          visivel: undefined,
        },
      ],
      error: undefined,
      mutate,
    });

    const { result } = renderHook(() => usePatrocinadores("racha-1"));
    expect(result.current.patrocinadores[0]).toMatchObject({
      id: "1",
      visivel: true,
      comprovantes: [],
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("envia payload e chama mutate ao adicionar", async () => {
    mockSWR.mockReturnValue({ data: [], error: undefined, mutate });
    const { result } = renderHook(() => usePatrocinadores("racha-1"));

    await act(async () => {
      await result.current.addPatrocinador({
        id: "p1",
        nome: "Teste",
        visivel: false,
        comprovantes: ["c1"],
      } as any);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/patrocinadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "p1",
        nome: "Teste",
        visivel: false,
        comprovantes: ["c1"],
      }),
    });
    expect(mutate).toHaveBeenCalled();
  });
});
