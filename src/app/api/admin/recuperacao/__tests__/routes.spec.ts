import { NextRequest } from "next/server";
import { GET as listRecovery } from "../route";
import { GET as getRecovery } from "../[id]/route";
import { POST as restoreRecovery } from "../[id]/restaurar/route";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";

class MockResponse {
  readonly status: number;
  private readonly body: unknown;

  constructor(body: unknown, status = 200) {
    this.body = body;
    this.status = status;
  }

  async json() {
    return this.body;
  }
}

jest.mock("next/server", () => ({
  NextRequest: class {
    nextUrl: URL;

    constructor(url: string) {
      this.nextUrl = new URL(url);
    }
  },
}));

jest.mock("@/lib/get-api-base", () => ({
  getApiBase: () => "https://api.fut7pro.test",
}));

jest.mock("../../../_proxy/helpers", () => ({
  requireUser: jest.fn(),
  resolveTenantSlug: jest.fn(),
  buildHeaders: jest.fn(),
  proxyBackend: jest.fn(),
  jsonResponse: jest.fn((body: unknown, init?: ResponseInit) =>
    Promise.resolve(new MockResponse(body, init?.status ?? 200))
  ),
  forwardResponse: jest.fn((status: number, body: unknown) =>
    Promise.resolve(new MockResponse(body, status))
  ),
}));

describe("proxies da Central de Recuperação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (jsonResponse as jest.Mock).mockImplementation((body: unknown, init?: ResponseInit) =>
      Promise.resolve(new MockResponse(body, init?.status ?? 200))
    );
    (forwardResponse as jest.Mock).mockImplementation((status: number, body: unknown) =>
      Promise.resolve(new MockResponse(body, status))
    );
    (requireUser as jest.Mock).mockResolvedValue({ id: "user-1", accessToken: "token" });
    (resolveTenantSlug as jest.Mock).mockReturnValue("racha-a");
    (buildHeaders as jest.Mock).mockReturnValue({
      Authorization: "Bearer token",
      "x-tenant-slug": "racha-a",
    });
    (proxyBackend as jest.Mock).mockResolvedValue({
      response: { status: 200 },
      body: { items: [], page: 1, limit: 20, total: 0 },
    });
  });

  it("encaminha somente filtros permitidos sem aceitar tenant arbitrário", async () => {
    const request = new NextRequest(
      "https://app.fut7pro.test/api/admin/recuperacao?entityType=TEAM&operationType=ARCHIVE&page=2&limit=10&tenantId=outro&snapshot=true"
    );
    const response = await listRecovery(request);

    expect(response.status).toBe(200);
    expect(requireUser).toHaveBeenCalledWith({ scope: "admin" });
    expect(proxyBackend).toHaveBeenCalledWith(
      "https://api.fut7pro.test/admin/recuperacao?entityType=TEAM&operationType=ARCHIVE&page=2&limit=10",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({ "x-tenant-slug": "racha-a" }),
      })
    );
  });

  it("recusa filtros e identificadores inválidos", async () => {
    const invalidFilter = await listRecovery(
      new NextRequest("https://app.fut7pro.test/api/admin/recuperacao?entityType=FINANCEIRO")
    );
    const invalidId = await getRecovery({} as Request, {
      params: Promise.resolve({ id: "../../tenant-alheio" }),
    });

    expect(invalidFilter.status).toBe(400);
    expect(invalidId.status).toBe(400);
    expect(proxyBackend).not.toHaveBeenCalled();
  });

  it("preserva status e resposta do backend no detalhe e restauração sem payload", async () => {
    (proxyBackend as jest.Mock)
      .mockResolvedValueOnce({ response: { status: 410 }, body: { message: "Expirado" } })
      .mockResolvedValueOnce({
        response: { status: 409 },
        body: { message: "Conflito de identidade" },
      });

    const detail = await getRecovery({} as Request, {
      params: Promise.resolve({ id: "rec-1" }),
    });
    const restore = await restoreRecovery({} as Request, {
      params: Promise.resolve({ id: "rec-1" }),
    });

    expect(detail.status).toBe(410);
    expect(await detail.json()).toEqual({ message: "Expirado" });
    expect(restore.status).toBe(409);
    expect(await restore.json()).toEqual({ message: "Conflito de identidade" });
    expect(proxyBackend).toHaveBeenLastCalledWith(
      "https://api.fut7pro.test/admin/recuperacao/rec-1/restaurar",
      expect.objectContaining({ method: "POST", cache: "no-store" })
    );
    expect((proxyBackend as jest.Mock).mock.calls[1][1]).not.toHaveProperty("body");
  });

  it("retorna 401 sem sessão e não consulta o backend", async () => {
    (requireUser as jest.Mock).mockResolvedValue(null);
    const response = await listRecovery(
      new NextRequest("https://app.fut7pro.test/api/admin/recuperacao")
    );

    expect(response.status).toBe(401);
    expect(proxyBackend).not.toHaveBeenCalled();
  });
});
