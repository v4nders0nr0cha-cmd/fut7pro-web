import { act, renderHook } from "@testing-library/react";
import useSWR from "swr";
import { normalizeTime, useTimes } from "../useTimes";

jest.mock("swr", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/lib/admin-guide-events", () => ({ notifyAdminGuideChanged: jest.fn() }));

const mockedSWR = useSWR as jest.Mock;

describe("useTimes: ausência de logo", () => {
  beforeEach(() => {
    mockedSWR.mockReturnValue({
      data: [],
      error: null,
      mutate: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as any;
  });
  afterEach(() => jest.clearAllMocks());

  it("não introduz a imagem padrão ao normalizar a resposta", () => {
    const time = normalizeTime({ id: "1", name: "Time amarelo", color: "#FFD700", logoUrl: null });
    expect(time.logo).toBeNull();
    expect(time.logoUrl).toBeNull();
    expect(normalizeTime({ id: "2", name: "Com escudo", logoUrl: "/uploads/real.png" }).logo).toBe(
      "/uploads/real.png"
    );
  });

  it("envia null ao criar sem logo", async () => {
    const { result } = renderHook(() => useTimes("quintasemlei"));
    await act(async () => {
      await result.current.addTime({ nome: "Time amarelo", cor: "#FFD700" });
    });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toEqual(expect.objectContaining({ logoUrl: null }));
  });

  it("envia null ao remover uma logo mesmo com campo legado preenchido", async () => {
    const { result } = renderHook(() => useTimes("quintasemlei"));
    await act(async () => {
      await result.current.updateTime({
        id: "team-1",
        nome: "Time amarelo",
        logo: "/uploads/antiga.png",
        logoUrl: null,
      });
    });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.logoUrl).toBeNull();
  });
});
