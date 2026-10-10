import type { NextRequest } from "next/server";
import { POST } from "./route";

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
  });
});
