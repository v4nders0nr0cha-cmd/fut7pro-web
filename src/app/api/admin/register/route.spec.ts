import type { NextRequest } from "next/server";
import { POST } from "./route";
import { requireSuperAdminUser } from "../../_proxy/helpers";

jest.mock("@/lib/get-api-base", () => ({
  getApiBase: () => "https://api.fut7pro.test",
}));

jest.mock("../../_proxy/helpers", () => ({
  requireSuperAdminUser: jest.fn(),
}));

describe("POST /api/admin/register", () => {
  const originalFetch = global.fetch;
  const originalResponse = global.Response;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "info").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    class MockResponse {
      readonly status: number;
      readonly ok: boolean;
      private readonly body: string;

      constructor(body?: BodyInit | null, init?: ResponseInit) {
        this.status = init?.status ?? 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.body = typeof body === "string" ? body : "";
      }

      async text() {
        return this.body;
      }

      async json() {
        return this.body ? JSON.parse(this.body) : null;
      }
    }

    global.Response = MockResponse as unknown as typeof Response;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.Response = originalResponse;
    jest.restoreAllMocks();
  });

  it("usa proof temporário ao limpar somente um tenant cujo cadastro falhou", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "tenant-1",
            slug: "racha-teste",
            name: "Racha Teste",
            turnstileProof: "proof-assinado",
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "E-mail já cadastrado" }), { status: 409 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ deleted: true, tenantId: "tenant-1" }), { status: 200 })
      );

    const request = {
      json: async () => ({
        rachaNome: "Racha Teste",
        rachaSlug: "racha-teste",
        cidadeNome: "Fortaleza",
        estadoUf: "CE",
        adminNome: "Maria",
        adminPosicao: "meia",
        adminEmail: "maria@example.com",
        adminSenha: "SenhaForte123!",
        planKey: "mensal",
        turnstileToken: "turnstile-token",
      }),
    } as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(409);
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "https://api.fut7pro.test/rachas/onboarding/tenant-1",
      {
        method: "DELETE",
        headers: { "x-onboarding-proof": "proof-assinado" },
      }
    );
    expect(console.warn).toHaveBeenCalledWith("[admin/register] admin_creation_failed", {
      status: 409,
      tenantCreated: true,
      tenantId: "tenant-1",
    });
    expect(console.info).toHaveBeenCalledWith("[admin/register] onboarding_cleanup_completed", {
      tenantId: "tenant-1",
    });
  });

  it("não tenta exclusão insegura quando o backend não emite proof", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "tenant-1", slug: "racha-teste", name: "Racha Teste" }), {
          status: 201,
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Falha no cadastro" }), { status: 400 })
      );

    const request = {
      json: async () => ({
        rachaNome: "Racha Teste",
        rachaSlug: "racha-teste",
        cidadeNome: "Fortaleza",
        estadoUf: "CE",
        adminNome: "Maria",
        adminPosicao: "meia",
        adminEmail: "maria@example.com",
        adminSenha: "SenhaForte123!",
        planKey: "mensal",
      }),
    } as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledWith("[admin/register] onboarding_cleanup_skipped", {
      tenantId: "tenant-1",
      reason: "proof_missing",
    });
  });

  it("nao expoe o proof na resposta de um cadastro normal", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "tenant-1",
            slug: "racha-teste",
            name: "Racha Teste",
            turnstileProof: "proof-assinado",
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: "access-token" }), { status: 201 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "subscription-1" }), { status: 201 })
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.tenant).toEqual({ id: "tenant-1", slug: "racha-teste", name: "Racha Teste" });
    expect(JSON.stringify(body)).not.toContain("proof-assinado");
  });

  it("registra recusa da compensacao sem expor o proof", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "tenant-1",
            slug: "racha-teste",
            name: "Racha Teste",
            turnstileProof: "proof-super-secreto",
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Falha" }), { status: 400 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: "TENANT_ONBOARDING_CLEANUP_FORBIDDEN" }), {
          status: 403,
        })
      );

    await POST(buildRequest());

    expect(console.warn).toHaveBeenCalledWith("[admin/register] onboarding_cleanup_refused", {
      tenantId: "tenant-1",
      status: 403,
      code: "TENANT_ONBOARDING_CLEANUP_FORBIDDEN",
    });
    expect(JSON.stringify((console.warn as jest.Mock).mock.calls)).not.toContain(
      "proof-super-secreto"
    );
  });

  it("registra falha de comunicacao na compensacao sem alterar a resposta publica", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "tenant-1",
            slug: "racha-teste",
            name: "Racha Teste",
            turnstileProof: "proof-assinado",
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "E-mail já cadastrado" }), { status: 409 })
      )
      .mockRejectedValueOnce(new TypeError("backend indisponivel"));

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ message: "E-mail já cadastrado" });
    expect(console.error).toHaveBeenCalledWith(
      "[admin/register] onboarding_cleanup_transport_failed",
      { tenantId: "tenant-1", errorType: "TypeError" }
    );
  });

  it("cadastra Presidente em tenant existente sem tentar compensacao", async () => {
    (requireSuperAdminUser as jest.Mock).mockResolvedValue({ accessToken: "super-token" });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ id: "tenant-1", slug: "racha-existente", name: "Existente" }),
          {
            status: 200,
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: "admin-token" }), { status: 201 })
      );

    const response = await POST(
      buildRequest({
        existingTenantId: "tenant-1",
        rachaSlug: undefined,
        rachaNome: undefined,
        planKey: undefined,
      })
    );

    expect(response.status).toBe(201);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, "https://api.fut7pro.test/rachas/tenant-1", {
      headers: { Authorization: "Bearer super-token" },
    });
    expect(console.info).not.toHaveBeenCalledWith(
      "[admin/register] onboarding_cleanup_attempt",
      expect.anything()
    );
  });

  function buildRequest(overrides: Record<string, unknown> = {}) {
    return {
      json: async () => ({
        rachaNome: "Racha Teste",
        rachaSlug: "racha-teste",
        cidadeNome: "Fortaleza",
        estadoUf: "CE",
        adminNome: "Maria",
        adminPosicao: "meia",
        adminEmail: "maria@example.com",
        adminSenha: "SenhaForte123!",
        planKey: "mensal",
        turnstileToken: "turnstile-token",
        ...overrides,
      }),
    } as NextRequest;
  }
});
