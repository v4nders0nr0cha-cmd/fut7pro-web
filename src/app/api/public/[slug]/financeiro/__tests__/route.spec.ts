type RouteModule = typeof import("../route");

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: HeadersInit }) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      json: async () => body,
      text: async () => JSON.stringify(body),
    }),
  },
}));

async function loadRouteModule(): Promise<RouteModule> {
  jest.resetModules();
  return import("../route");
}

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as any;
}

function mockFetchResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  } as Response;
}

describe("GET /api/public/[slug]/financeiro", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("mapeia slug invalido para SLUG_NOT_FOUND", async () => {
    process.env.BACKEND_URL = "https://api.fut7pro.com.br";
    const { GET } = await loadRouteModule();
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse(404, { code: "RACHA_NOT_FOUND", message: "Racha nao encontrado." })
      ) as any;

    const req = makeRequest("http://localhost/api/public/slug/financeiro");
    const response = await GET(req, { params: { slug: "slug-inexistente" } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({
        code: "RACHA_NOT_FOUND",
        publicState: "SLUG_NOT_FOUND",
      })
    );
  });

  it("mapeia modulo desativado para MODULE_DISABLED", async () => {
    process.env.BACKEND_URL = "https://api.fut7pro.com.br";
    const { GET } = await loadRouteModule();
    global.fetch = jest.fn().mockResolvedValue(
      mockFetchResponse(403, {
        code: "FINANCEIRO_MODULE_DISABLED",
        message: "Prestacao nao publicada.",
      })
    ) as any;

    const req = makeRequest("http://localhost/api/public/slug/financeiro");
    const response = await GET(req, { params: { slug: "nome-do-racha" } });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual(
      expect.objectContaining({
        code: "FINANCEIRO_MODULE_DISABLED",
        publicState: "MODULE_DISABLED",
      })
    );
  });

  it("mapeia throttling para UNAVAILABLE sem vazar erro tecnico", async () => {
    process.env.BACKEND_URL = "https://api.fut7pro.com.br";
    const { GET } = await loadRouteModule();
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse(429, { message: "ThrottlerException: Too Many Requests" })
      ) as any;

    const req = makeRequest("http://localhost/api/public/slug/financeiro");
    const response = await GET(req, { params: { slug: "nome-do-racha" } });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual(
      expect.objectContaining({
        code: "FINANCEIRO_UNAVAILABLE",
        publicState: "UNAVAILABLE",
      })
    );
    expect(JSON.stringify(body)).not.toContain("ThrottlerException");
  });

  it("preserva payload de sucesso do backend", async () => {
    process.env.BACKEND_URL = "https://api.fut7pro.com.br";
    const { GET } = await loadRouteModule();
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse(200, { publicState: "NO_DATA", resumo: {}, lancamentos: [] })
      ) as any;

    const req = makeRequest("http://localhost/api/public/slug/financeiro");
    const response = await GET(req, { params: { slug: "nome-do-racha" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        publicState: "NO_DATA",
      })
    );
  });
});
