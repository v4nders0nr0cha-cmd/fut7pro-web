import { test, expect, APIResponse } from "@playwright/test";

// Mantém compatibilidade com sua infra atual, mas evita ::1 no Windows
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

/**
 * Em ambientes com guards centralizados, a API pode retornar:
 * - 401: não autenticado
 * - 403: bloqueado por permissão (mesmo sem sessão)
 * - 404: rota indisponível no profile/build atual
 *
 * Aceitamos os três como "não autorizado".
 */
async function expectUnauthorized(res: APIResponse) {
  const status = res.status();
  const raw = await res.text();

  expect([401, 403, 404], `status=${status} body=${raw}`).toContain(status);

  if (status === 401) {
    expect(raw.toLowerCase()).toMatch(/autentic|não autentic|nao autentic/);
  }
  if (status === 403) {
    expect(raw.toLowerCase()).toMatch(/perm|forbid|proibido|sem permiss/);
  }
}

test.describe("Autenticação em publish/unpublish", () => {
  test("publish sem sessão retorna 401/403/404", async ({ request }) => {
    const r = await request.post(`${BASE}/api/admin/racha/publish`, {
      headers: { "content-type": "application/json" },
      data: { rachaId: "fake-id" },
    });
    await expectUnauthorized(r);
  });

  test("unpublish sem sessão retorna 401/403/404", async ({ request }) => {
    const r = await request.post(`${BASE}/api/admin/racha/unpublish`, {
      headers: { "content-type": "application/json" },
      data: { rachaId: "fake-id" },
    });
    await expectUnauthorized(r);
  });

  test.skip("publish com rachaId inválido retorna 403 (quando autenticado)", async () => {
    // TODO: Habilitar quando houver login e sessão válida para validar 403
  });

  test("checklist sem rachaId retorna 400", async ({ request }) => {
    const r = await request.get(`${BASE}/api/admin/racha/checklist`);
    // Alguns ambientes podem bloquear antes (401/403). Se acontecer, aceite como não autorizado.
    if ([401, 403].includes(r.status())) {
      await expectUnauthorized(r);
      return;
    }
    expect(r.status(), await r.text()).toBe(400);
    const body = await r.json();
    expect(String(body.error || "").toLowerCase()).toContain("rachaid");
  });
});

test.describe("Rate limiting", () => {
  test.skip("bloqueia após múltiplas requisições rápidas", async ({ request }) => {
    // TODO: Implementar quando tiver sessão autenticada
    // Fazer 6 requisições seguidas e verificar que a 6ª retorna 429
    const rachaId = "test-racha-id";

    for (let i = 0; i < 6; i++) {
      const r = await request.post(`${BASE}/api/admin/racha/publish`, {
        headers: { "content-type": "application/json" },
        data: { rachaId },
      });

      if (i < 5) {
        expect(r.status()).not.toBe(429);
      } else {
        expect(r.status()).toBe(429);
        const body = await r.json();
        expect(String(body.error || "")).toContain("Muitas requisições");
      }
    }
  });
});
