export {};

type LoginRouteModule = typeof import("../login/route");

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Headers }) => ({
      status: init?.status ?? 200,
      headers: init?.headers,
      json: async () => body,
    }),
  },
}));

async function loadLoginRouteModule(): Promise<LoginRouteModule> {
  jest.resetModules();
  process.env.BACKEND_URL = "https://api.fut7pro.com.br";
  process.env.AUTH_LOGIN_PATH = "/auth/login";
  return import("../login/route");
}

function makeLoginRequest(payload: unknown) {
  return {
    json: async () => payload,
    headers: {
      get: () => null,
    },
  } as any;
}

function mockBackendResponse(status: number, payload: unknown, jsonFails = false) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jsonFails ? async () => Promise.reject(new Error("html response")) : async () => payload,
  } as Response;
}

describe("POST /api/auth/login", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    (global as any).fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("nao converte 503 HTML do backend em credenciais invalidas", async () => {
    const { POST } = await loadLoginRouteModule();
    (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse(503, null, true));

    const response = await POST(
      makeLoginRequest({ email: "admin@fut7pro.com.br", password: "SenhaCorreta123!" })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("AUTH_SERVICE_UNAVAILABLE");
    expect(body.message).toBe(
      "Nao foi possivel acessar o servico de autenticacao agora. Tente novamente em alguns instantes."
    );
    expect(JSON.stringify(body).toLowerCase()).not.toContain("senha invalid");
  });

  it("preserva 401 de credenciais invalidas retornado pelo backend", async () => {
    const { POST } = await loadLoginRouteModule();
    (global.fetch as jest.Mock).mockResolvedValue(
      mockBackendResponse(401, { code: "INVALID_CREDENTIALS", message: "Credenciais invalidas." })
    );

    const response = await POST(
      makeLoginRequest({ email: "admin@fut7pro.com.br", password: "SenhaErrada123!" })
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("INVALID_CREDENTIALS");
    expect(body.message).toBe("Credenciais invalidas.");
  });
});
