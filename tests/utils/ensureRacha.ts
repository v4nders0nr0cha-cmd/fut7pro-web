import { APIRequestContext, expect } from "@playwright/test";

export async function ensureRacha(request: APIRequestContext, baseUrl: string, slug: string) {
  const lookupUrl = `${baseUrl}/api/public/rachas/${encodeURIComponent(slug)}`;

  let response = await request.get(lookupUrl);
  if (response.ok()) {
    const existing = await response.json().catch(() => null);
    if (existing?.id) {
      return existing.id as string;
    }
  }

  const body = {
    nome: slug.replace(/-/g, " ").toUpperCase(),
    slug,
    email: `seed.${slug}@fut7pro.test`,
    senha: "testpassword123",
    presidenteNome: `Presidente ${slug}`,
    presidenteApelido: `pres_${slug}`,
  };

  const createResponse = await request.post(`${baseUrl}/api/admin/register`, {
    data: body,
    headers: { "Content-Type": "application/json" },
  });

  expect(createResponse.ok(), "seed racha via /api/admin/register").toBeTruthy();

  response = await request.get(lookupUrl);
  expect(response.ok(), "fetch racha after seed").toBeTruthy();

  const racha = await response.json().catch(() => null);
  expect(racha?.id, "racha id after seed").toBeTruthy();
  return racha.id as string;
}
