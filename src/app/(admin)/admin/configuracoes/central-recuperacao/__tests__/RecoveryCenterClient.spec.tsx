import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import RecoveryCenterClient from "../RecoveryCenterClient";
import type { RecoveryItem, RecoveryListResponse } from "@/types/recovery";

const mutate = jest.fn();
const useRecoveryItems = jest.fn();
let tenantContext = { tenantSlug: "racha-a", rachaId: "tenant-a" };
let membership = { role: "PRESIDENTE", status: "APROVADO" };

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/hooks/useRecoveryItems", () => ({
  useRecoveryItems: (options: unknown) => useRecoveryItems(options),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({
    me: { membership },
    isLoading: false,
  }),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => tenantContext,
}));

const item: RecoveryItem = {
  id: "rec-1",
  entityType: "ATHLETE",
  operationType: "DELETE",
  originalEntityId: "athlete-1",
  displayLabel: "João Silva",
  performedBy: { id: "user-1", name: "Presidente" },
  performedAt: "2026-10-15T12:00:00.000Z",
  expiresAt: "2026-10-30T12:00:00.000Z",
  status: "AVAILABLE",
  restoredAt: null,
  restoredEntityId: null,
};

const secondItem: RecoveryItem = {
  ...item,
  id: "rec-2",
  entityType: "TEAM",
  originalEntityId: "team-1",
  displayLabel: "Time Azul",
};

const response: RecoveryListResponse = {
  items: [item],
  page: 1,
  limit: 20,
  total: 21,
};

function mockList(overrides: Partial<ReturnType<typeof baseHookResult>> = {}) {
  useRecoveryItems.mockImplementation(() => ({ ...baseHookResult(), ...overrides }));
}

function baseHookResult() {
  return {
    data: response,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate,
  };
}

function apiError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function mockResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("RecoveryCenterClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    tenantContext = { tenantSlug: "racha-a", rachaId: "tenant-a" };
    membership = { role: "PRESIDENTE", status: "APROVADO" };
    mutate.mockResolvedValue(undefined);
    mockList();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("bloqueia visualmente quem não é Presidente aprovado", () => {
    membership = { role: "VICE_PRESIDENTE", status: "APROVADO" };
    render(<RecoveryCenterClient />);

    expect(screen.getByText("Acesso exclusivo do Presidente")).toBeInTheDocument();
    expect(useRecoveryItems).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("lista registros, pagina e não expõe snapshots", () => {
    useRecoveryItems.mockImplementation(() => ({
      ...baseHookResult(),
      data: {
        ...response,
        items: [{ ...item, snapshot: "segredo-interno" }],
      },
    }));

    render(<RecoveryCenterClient />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === "P" &&
          element.textContent?.replace(/\s+/g, " ") === "Atleta • Excluído"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("segredo-interno")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }));
    expect(useRecoveryItems).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });

  it("combina filtros suportados e reinicia a paginação", () => {
    render(<RecoveryCenterClient />);

    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "TEAM" } });
    fireEvent.change(screen.getByLabelText("Operação"), { target: { value: "ARCHIVE" } });

    expect(useRecoveryItems).toHaveBeenLastCalledWith(
      expect.objectContaining({ entityType: "TEAM", operationType: "ARCHIVE", page: 1 })
    );
  });

  it("consulta detalhes e restaura somente após confirmação explícita", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(item))
      .mockResolvedValueOnce(
        mockResponse({ ...item, status: "RESTORED", restoredAt: "2026-10-15T13:00:00Z" })
      );

    render(<RecoveryCenterClient />);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("heading", { name: "Confirmar restauração" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar restauração" }));

    expect(await screen.findByText("Registro recuperado com sucesso!")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/admin/recuperacao/rec-1/restaurar",
      expect.objectContaining({ method: "POST", cache: "no-store" })
    );
    expect(mutate).toHaveBeenCalled();
  });

  it("bloqueia cliques duplicados durante a restauração", async () => {
    let resolveRestore: ((response: Response) => void) | undefined;
    const pendingRestore = new Promise<Response>((resolve) => {
      resolveRestore = resolve;
    });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(item))
      .mockReturnValueOnce(pendingRestore);

    render(<RecoveryCenterClient />);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));
    const confirm = await screen.findByRole("button", { name: "Confirmar restauração" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    resolveRestore?.(mockResponse({ ...item, status: "RESTORED" }));
    await screen.findByText("Registro recuperado com sucesso!");
  });

  it.each([
    [409, "Já existe um atleta com a mesma identidade"],
    [410, "O período de recuperação deste registro terminou."],
  ])("não apresenta falso sucesso após erro %s", async (status, message) => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(item))
      .mockResolvedValueOnce(mockResponse({ message }, status));

    render(<RecoveryCenterClient />);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar restauração" }));

    expect((await screen.findAllByText(message)).length).toBeGreaterThan(0);
    expect(screen.queryByText("Registro recuperado com sucesso!")).not.toBeInTheDocument();
  });

  it.each([
    [401, "Sua sessão expirou. Entre novamente para continuar."],
    [403, "A Central de Recuperação é exclusiva do Presidente da pelada."],
  ])("explica erro de listagem %s e permite tentar novamente", (status, message) => {
    mockList({ data: undefined, error: apiError(status, "erro") });
    render(<RecoveryCenterClient />);

    expect(screen.getByText(message)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(mutate).toHaveBeenCalled();
  });

  it("invalida o modal e o cache lógico ao trocar de tenant", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(item));
    const view = render(<RecoveryCenterClient />);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));
    expect(
      await screen.findByRole("heading", { name: "Confirmar restauração" })
    ).toBeInTheDocument();

    tenantContext = { tenantSlug: "racha-b", rachaId: "tenant-b" };
    view.rerender(<RecoveryCenterClient />);

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Confirmar restauração" })
      ).not.toBeInTheDocument()
    );
    expect(useRecoveryItems).toHaveBeenLastCalledWith(
      expect.objectContaining({ tenantScope: "racha-b:tenant-b" })
    );
  });

  it("mantém somente a última resposta de detalhes quando as respostas chegam fora de ordem", async () => {
    let resolveFirst: ((response: Response) => void) | undefined;
    let resolveSecond: ((response: Response) => void) | undefined;
    const firstRequest = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const secondRequest = new Promise<Response>((resolve) => {
      resolveSecond = resolve;
    });
    useRecoveryItems.mockImplementation(() => ({
      ...baseHookResult(),
      data: { ...response, items: [item, secondItem], total: 2 },
    }));
    (global.fetch as jest.Mock)
      .mockReturnValueOnce(firstRequest)
      .mockReturnValueOnce(secondRequest);

    render(<RecoveryCenterClient />);
    const restoreButtons = screen.getAllByRole("button", { name: "Restaurar" });
    fireEvent.click(restoreButtons[0]);
    fireEvent.click(restoreButtons[1]);

    resolveSecond?.(mockResponse(secondItem));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Time Azul")).toBeInTheDocument();

    resolveFirst?.(mockResponse(item));
    await waitFor(() => {
      expect(within(dialog).getByText("Time Azul")).toBeInTheDocument();
      expect(within(dialog).queryByText("João Silva")).not.toBeInTheDocument();
    });
  });

  it("ignora resposta de detalhes pendente depois da troca de tenant", async () => {
    let resolveDetail: ((response: Response) => void) | undefined;
    const pendingDetail = new Promise<Response>((resolve) => {
      resolveDetail = resolve;
    });
    (global.fetch as jest.Mock).mockReturnValueOnce(pendingDetail);

    const view = render(<RecoveryCenterClient />);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));

    tenantContext = { tenantSlug: "racha-b", rachaId: "tenant-b" };
    view.rerender(<RecoveryCenterClient />);
    resolveDetail?.(mockResponse(item));

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Confirmar restauração" })
      ).not.toBeInTheDocument()
    );
    expect(screen.queryByText("Não foi possível restaurar")).not.toBeInTheDocument();
  });

  it("não aplica resposta de restauração ao tenant selecionado posteriormente", async () => {
    let resolveRestore: ((response: Response) => void) | undefined;
    const pendingRestore = new Promise<Response>((resolve) => {
      resolveRestore = resolve;
    });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(item))
      .mockReturnValueOnce(pendingRestore);

    const view = render(<RecoveryCenterClient />);
    fireEvent.click(screen.getByRole("button", { name: "Restaurar" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar restauração" }));

    tenantContext = { tenantSlug: "racha-b", rachaId: "tenant-b" };
    view.rerender(<RecoveryCenterClient />);
    resolveRestore?.(mockResponse({ ...item, status: "RESTORED" }));

    await waitFor(() => {
      expect(screen.queryByText("Registro recuperado com sucesso!")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Confirmar restauração" })
      ).not.toBeInTheDocument();
    });
  });
});
