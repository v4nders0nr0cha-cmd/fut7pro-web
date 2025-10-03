import { test, expect, APIResponse } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function expectUnauthorized(res: APIResponse) {
  const status = res.status();
  const raw = await res.text();
  expect([401, 404], `status=${status} body=${raw}`).toContain(status);
  if (status === 401) {
    expect(raw.toLowerCase()).toContain("autentic");
  }
}

test.describe("Autenticação em publish/unpublish", () => {
  test("publish sem sessão retorna 401/404", async ({ request }) => {
    const r = await request.post(`${BASE}/api/admin/racha/publish`, {
      data: { rachaId: "fake-id" },
    });
    await expectUnauthorized(r);
  });

  test("unpublish sem sessão retorna 401/404", async ({ request }) => {
    const r = await request.post(`${BASE}/api/admin/racha/unpublish`, {
      data: { rachaId: "fake-id" },
    });
    await expectUnauthorized(r);
  });

  test.skip("publish com rachaId inválido retorna 403 (quando autenticado)", async () => {
    // TODO: Habilitar quando houver login e sessão válida para validar 403
  });

  test("checklist sem rachaId retorna 400", async ({ request }) => {
    const r = await request.get(`${BASE}/api/admin/racha/checklist`);
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.error).toContain("rachaId");
  });
});

test.describe("Rate limiting", () => {
  test.skip("bloqueia após múltiplas requisições rápidas", async ({ request }) => {
    // TODO: Implementar quando tiver sessão autenticada
    // Fazer 6 requisições seguidas e verificar que a 6ª retorna 429
    const rachaId = "test-racha-id";

    for (let i = 0; i < 6; i++) {
      const r = await request.post(`${BASE}/api/admin/racha/publish`, {
        data: { rachaId },
      });

      if (i < 5) {
        // Primeiras 5 podem falhar por outros motivos, mas não por rate limit
        expect(r.status()).not.toBe(429);
      } else {
        // 6ª deve ser bloqueada por rate limit
        expect(r.status()).toBe(429);
        const body = await r.json();
        expect(body.error).toContain("Muitas requisições");
      }
    }
  });
});
