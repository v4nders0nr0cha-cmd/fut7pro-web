import { renderHook } from "@testing-library/react";
import { useJogadores } from "@/hooks/useJogadores";
import { usePartidas } from "@/hooks/usePartidas";
import { useCampeoes } from "@/hooks/useCampeoes";
import { useNotifications } from "@/hooks/useNotifications";
import { Role, Permission } from "@/common/enums";

const swrMock = jest.fn((key: string) => {
  const map: Record<string, any> = {
    "/api/jogadores?rachaId=r1": {
      data: [{ id: "j1", nome: "Jogador 1", timeId: "t1" }],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    },
    "/api/partidas?rachaId=r1": {
      data: [{ id: "p1", titulo: "Partida 1" }],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    },
    "/api/campeoes?rachaId=r1": {
      data: [{ id: "c1", nome: "Time Campeao" }],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    },
    "/api/notificacoes?rachaId=r1": {
      data: [
        { id: "n1", lida: false, tipo: "comunicado" },
        { id: "n2", lida: true, tipo: "alerta" },
      ],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
    },
  };
  return map[key] || { data: [], isLoading: false, error: undefined, mutate: jest.fn() };
});

jest.mock("swr", () => ({
  __esModule: true,
  default: (...args: any[]) => swrMock(args[0]),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: jest.fn(() => ({ rachaId: "r1" })),
}));

jest.mock("@/lib/api", () => ({
  jogadoresApi: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  partidasApi: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  campeoesApi: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  notificacoesApi: {
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Data hooks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("useJogadores retorna jogadores e nao esta carregando", () => {
    const { result } = renderHook(() => useJogadores("r1"));
    expect(result.current.jogadores).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("usePartidas retorna partidas do racha", () => {
    const { result } = renderHook(() => usePartidas());
    expect(result.current.partidas[0]?.id).toBe("p1");
    expect(result.current.isError).toBe(false);
  });

  it("useCampeoes retorna campeoes", () => {
    const { result } = renderHook(() => useCampeoes());
    expect(result.current.campeoes[0]?.id).toBe("c1");
    expect(result.current.isLoading).toBe(false);
  });

  it("useNotifications calcula unreadCount e filtro por tipo", () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.getNotificacoesPorTipo("comunicado")).toHaveLength(1);
  });
});
