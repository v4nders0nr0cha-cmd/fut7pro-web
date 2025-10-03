// tests/e2e/publicacao-site.spec.ts
import { test, expect, APIRequestContext } from "@playwright/test";

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
});

const SLUG = process.env.SLUG ?? "racha-bairro";
const BYPASS_ACTIVE = process.env.E2E_ALLOW_NOAUTH === "1";

async function resolveRachaId(request: APIRequestContext, slug: string) {
  const res = await request.get(`/api/public/rachas/${slug}?dev=1`);
  await expect(res).toBeOK();
  const json = await res.json();
  return json.id as string;
}

test.describe("Fluxo de publicação do site", () => {
  test.skip(!BYPASS_ACTIVE, "Requer E2E_ALLOW_NOAUTH=1 para chamar endpoints admin");

  test("checklist -> publish -> public api -> unpublish", async ({ request }) => {
    const rachaId = process.env.RACHA_ID ?? (await resolveRachaId(request, SLUG));
    expect(rachaId, "rachaId resolvido (env ou pública ?dev=1)").toBeTruthy();

    // 1) checklist
    const ck = await request.get(`/api/admin/racha/checklist?rachaId=${rachaId}`);
    await expect(ck, `Checklist falhou: ${await ck.text()}`).toBeOK();
    const { items, allOk } = await ck.json();
    expect(Array.isArray(items)).toBe(true);
    if (!allOk) {
      // Documenta o que falta e pula o teste de forma explícita
      // (útil em ambientes de dev onde o seed pode variar)
      // eslint-disable-next-line no-console
      console.warn(
        "Checklist pendente:",
        items.filter((i: any) => !i.ok)
      );
      test.skip(true, "Checklist não concluído - ajuste dados de teste");
    }

    let needsCleanup = false;

    try {
      // 2) publish
      const pub = await request.post(`/api/admin/racha/publish`, { data: { rachaId } });
      await expect(pub, `Publish falhou: ${await pub.text()}`).toBeOK();
      expect((await pub.json())?.racha?.ativo).toBe(true);
      needsCleanup = true;

      // 3) API pública (sem ?dev=1 deve funcionar se ativo=true)
      await expect(
        request.get(`/api/public/rachas/${SLUG}`),
        "Pública ativa deve responder 200"
      ).resolves.toBeOK();

      // 4) unpublish
      const unpub = await request.post(`/api/admin/racha/unpublish`, { data: { rachaId } });
      await expect(unpub, `Unpublish falhou: ${await unpub.text()}`).toBeOK();
      expect((await unpub.json())?.racha?.ativo).toBe(false);
      needsCleanup = false;

      // 5) Em dev, a pública com ?dev=1 deve continuar visível
      await expect(
        request.get(`/api/public/rachas/${SLUG}?dev=1`),
        "Preview dev deve continuar liberado (200)"
      ).resolves.toBeOK();

      // 6) Em produção, a pública SEM dev deve 404 quando inativo (documentação)
    } finally {
      // Cleanup defensivo (não falha o teste se isso falhar)
      if (needsCleanup) {
        const r = await request.post(`/api/admin/racha/unpublish`, { data: { rachaId } });
        if (!r.ok()) {
          // eslint-disable-next-line no-console
          console.warn("Cleanup unpublish falhou:", await r.text());
        }
      }
    }
  });
});
