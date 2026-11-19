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

  it("preserva a imagem no backend quando a edição não informa os campos de logo", async () => {
    const { result } = renderHook(() => useTimes("grupo-teste"));
    await act(async () => {
      await result.current.updateTime({ id: "team-1", nome: "Nome atualizado", cor: "#ff0000" });
    });
    const [url, request] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/times/team-1?slug=grupo-teste&status=active");
    expect(JSON.parse(request.body)).not.toHaveProperty("logoUrl");
  });

  it.each(["/uploads/real.png", "/images/times/time_padrao_01.png"])(
    "mantém a imagem existente na normalização e na edição: %s",
    async (logoUrl) => {
      const time = normalizeTime({ id: "team-1", name: "Meu time", logoUrl });
      const { result } = renderHook(() => useTimes("grupo-teste"));
      await act(async () => {
        await result.current.updateTime({ ...time, nome: "Novo nome" });
      });
      expect(time.logo).toBe(logoUrl);
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body).logoUrl).toBe(logoUrl);
    }
  );
});
