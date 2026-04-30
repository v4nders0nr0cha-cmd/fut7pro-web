export {};

type ResetPasswordRouteModule = typeof import("../reset-password/route");

async function loadResetPasswordRouteModule(): Promise<ResetPasswordRouteModule> {
  jest.resetModules();
  return import("../reset-password/route");
}

function makeResetPasswordRequest(payload: unknown) {
  return {
    json: async () => payload,
  } as any;
}

function mockResetPasswordFetchResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}

describe("POST /api/auth/reset-password", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  const originalResponse = global.Response;

  beforeEach(() => {
    process.env = { ...originalEnv, BACKEND_URL: "https://api.fut7pro.com.br" };
    global.fetch = originalFetch;
    (global as any).Response = {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        json: async () => body,
      }),
    };
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    global.Response = originalResponse;
  });

  it("nao vaza Bad Request quando o backend recusa o reset", async () => {
    const { POST } = await loadResetPasswordRouteModule();
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockResetPasswordFetchResponse(400, { message: "Bad Request" }));

    const response = await POST(
      makeResetPasswordRequest({ token: "reset-token", password: "Senha@12345" })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.message).toBe(
      "A senha precisa ter entre 10 e 72 caracteres, com letra maiúscula, letra minúscula, número e caractere especial."
    );
    expect(JSON.stringify(body)).not.toContain("Bad Request");
  });

  it("mapeia token expirado para mensagem humana", async () => {
    const { POST } = await loadResetPasswordRouteModule();
    global.fetch = jest
      .fn()
      .mockResolvedValue(mockResetPasswordFetchResponse(400, { message: "token expirado" }));

    const response = await POST(
      makeResetPasswordRequest({ token: "reset-token", password: "Senha@12345" })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe(
      "Este link de redefinição expirou. Solicite um novo link para criar uma nova senha."
    );
    expect(JSON.stringify(body).toLowerCase()).not.toContain("token expirado");
  });
});
