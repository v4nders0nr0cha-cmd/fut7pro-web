import { NextRequest, NextResponse } from "next/server";
import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";
const REVALIDATE_TOKEN = process.env.PUBLIC_REVALIDATE_TOKEN;

function toJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export async function POST(req: NextRequest) {
  if (REVALIDATE_TOKEN) {
    const provided = req.headers.get("x-revalidate-token") ?? req.headers.get("authorization");
    if (!provided || provided.replace(/^Bearer\s+/i, "").trim() !== REVALIDATE_TOKEN) {
      return toJson({ error: "Nao autorizado" }, { status: 401 });
    }
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  const slug = typeof payload?.slug === "string" ? payload.slug : null;
  if (!slug) {
    return toJson({ error: "Parametro 'slug' obrigatorio" }, { status: 400 });
  }

  const extraPaths = Array.isArray(payload?.paths)
    ? payload.paths.filter((value: unknown) => typeof value === "string")
    : [];

  try {
    revalidateTenantPublicPages(slug, { extraPaths });
    return toJson({
      ok: true,
      slug,
      extraPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao revalidar caminhos";
    return toJson({ error: message }, { status: 500 });
  }
}
