// tests/utils/ensureRacha.ts
import type { APIRequestContext } from "@playwright/test";

type ApiParsed = {
  ok: boolean;
  status: number;
  json: any | null;
  text: string;
};

const STRONG_PASS = "Adm1n!23456789"; // 8+ chars with symbol and digit
const BYPASS_ACTIVE = process.env.E2E_ALLOW_NOAUTH === "1";

function resolveBaseUrl(custom?: string): string {
  const envBase = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
  return (custom && custom.trim().length > 0 ? custom : envBase).replace(/\/$/, "");
}

function adminEmail(slug: string) {
  return `admin+${slug}@fut7pro.test`;
}

async function parse(res: Awaited<ReturnType<APIRequestContext["get"]>>): Promise<ApiParsed> {
  const status = res.status();
  const ok = res.ok();
  let text = "";
  let json: any | null = null;
  try {
    text = await res.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    // deixa o text/raw quando não for JSON
  }
  return { ok, status, text, json };
}

async function http(
  request: APIRequestContext,
  method: "GET" | "POST" | "PATCH",
  url: string,
  body?: any
): Promise<ApiParsed> {
  if (method === "GET") return parse(await request.get(url));
  if (method === "POST") return parse(await request.post(url, { data: body }));
  return parse(await request.patch(url, { data: body }));
}

/** Lê a pública por slug; quando preview=true usa ?dev=1. Retorna o id (string) ou null. */
async function fetchRachaPublic(
  request: APIRequestContext,
  baseUrl: string,
  slug: string,
  preview: boolean
): Promise<string | null> {
  const url = new URL(`${baseUrl}/api/public/rachas/${encodeURIComponent(slug)}`);
  if (preview) url.searchParams.set("dev", "1");

  const res = await http(request, "GET", url.toString());
  if (!res.ok) {
    if (res.status !== 404 && res.status !== 401) {
      console.error(`[fetchRachaPublic] status=${res.status} body=${res.text}`);
    }
    return null;
  }
  const data = res.json ?? {};
  const id = data.rachaId ?? data.id ?? data?.racha?.id ?? data?.data?.id ?? null;
  return id ? String(id) : null;
}

function buildRegisterPayload(slug: string) {
  const baseName = `Demo Rachao ${slug}`.slice(0, 64);
  const apelido = slug.replace(/[^a-z0-9]/gi, "").slice(0, 20) || "admin";
  const presidenteNome = `Presidente ${slug}`.slice(0, 60);

  return {
    nome: baseName,
    slug,
    email: adminEmail(slug),
    senha: STRONG_PASS,
    presidenteNome,
    presidenteApelido: apelido,
    logoUrl: null,
  };
}

async function registerRacha(
  request: APIRequestContext,
  baseUrl: string,
  slug: string
): Promise<string | null> {
  if (!BYPASS_ACTIVE) return null;

  const payload = buildRegisterPayload(slug);
  const res = await http(request, "POST", `${baseUrl}/api/admin/register`, payload);

  if (res.ok) {
    const directId =
      res.json?.rachaId ?? res.json?.id ?? res.json?.racha?.id ?? res.json?.data?.id ?? null;
    if (directId) return String(directId);
  }

  if (res.status === 409) {
    const existing = await fetchRachaPublic(request, baseUrl, slug, true);
    return existing ?? null;
  }

  console.error(`[registerRacha] status=${res.status} body=${res.text}`);
  return null;
}

/** Publica o racha usando o endpoint real do app. Aceita slug ou id. */
async function activateRacha(request: APIRequestContext, baseUrl: string, slugOrId: string) {
  if (!BYPASS_ACTIVE) return;

  const targetBase = resolveBaseUrl(baseUrl);

  // Se vier slug, resolve o id pela pública com preview
  let rachaId = slugOrId;
  const looksLikeId = /^[a-z0-9]{20,}$/i.test(slugOrId); // heurística simples p/ cuid/ids longos
  if (!looksLikeId) {
    const resolved = await fetchRachaPublic(request, targetBase, slugOrId, true);
    if (resolved) rachaId = resolved;
  }

  // Publica de fato
  const res = await http(request, "POST", `${targetBase}/api/admin/racha/publish`, { rachaId });

  // 401 é esperado quando bypass estiver off; demais códigos, loga
  if (!res.ok && res.status !== 401) {
    console.warn(`[activateRacha] publish ${slugOrId} -> ${res.status} ${res.text}`);
  }
}

/** Espera o racha ficar visível; quando previewOnly=false, exige live 200 após preview. */
async function waitUntilVisible(
  request: APIRequestContext,
  baseUrl: string,
  slug: string,
  previewOnly: boolean,
  timeoutMs: number
) {
  const targetBase = resolveBaseUrl(baseUrl);
  const deadline = Date.now() + timeoutMs;

  let delay = 300;
  while (Date.now() < deadline) {
    const previewId = await fetchRachaPublic(request, targetBase, slug, true);
    if (previewId) {
      if (previewOnly) return;
      const liveId = await fetchRachaPublic(request, targetBase, slug, false);
      if (liveId) return;
    }

    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(Math.floor(delay * 1.5), 1500);
  }
  throw new Error(`Racha ${slug} nao ficou visivel a tempo`);
}

export async function resolveRachaId(
  request: APIRequestContext,
  baseUrl: string,
  slug: string
): Promise<string | null> {
  const targetBase = resolveBaseUrl(baseUrl);

  // Tenta preview primeiro (mais permissivo), depois live
  const existingPreview = await fetchRachaPublic(request, targetBase, slug, true);
  if (existingPreview) return existingPreview;

  const existingLive = await fetchRachaPublic(request, targetBase, slug, false);
  if (existingLive) return existingLive;

  if (!BYPASS_ACTIVE) {
    console.warn(`[resolveRachaId] slug ${slug} inexistente e bypass desativado.`);
    return null;
  }

  const created = await registerRacha(request, targetBase, slug);
  if (!created) return null;

  const previewId = await fetchRachaPublic(request, targetBase, slug, true);
  return previewId;
}

export async function ensureRacha(
  request: APIRequestContext,
  baseUrl: string,
  slug: string
): Promise<string> {
  const targetBase = resolveBaseUrl(baseUrl);
  const rachaId = await resolveRachaId(request, targetBase, slug);
  if (!rachaId) throw new Error(`Falha ao garantir racha ${slug}`);

  await activateRacha(request, targetBase, slug);
  await waitUntilVisible(request, targetBase, slug, !BYPASS_ACTIVE, 30_000);

  return rachaId;
}

/** Tenta publicar/sortear times. Não lança erro se a rota exigir auth. */
export async function publicarTimes(
  request: APIRequestContext,
  baseUrl: string,
  rachaIdOrSlug: string
) {
  if (!BYPASS_ACTIVE) return;

  const targetBase = resolveBaseUrl(baseUrl);
  const endpoints = [
    `${targetBase}/api/admin/rachas/${rachaIdOrSlug}/sortear-publicar`,
    `${targetBase}/api/admin/rachas/${rachaIdOrSlug}/partidas/publicar`,
    `${targetBase}/api/admin/rachas/${rachaIdOrSlug}/times/publicar`,
  ];

  let ok = false;
  const notes: string[] = [];
  for (const url of endpoints) {
    try {
      const res = await http(request, "POST", url, {});
      if (res.ok) {
        ok = true;
        console.log(`[publicarTimes] OK -> ${url}`);
        break;
      }
      notes.push(`${url} -> ${res.status}`);
    } catch (err) {
      notes.push(`${url} erro: ${(err as Error).message}`);
    }
  }
  if (!ok && notes.length) {
    console.debug(`[publicarTimes] nenhum endpoint aplicável: ${notes.join(", ")}`);
  }
}
