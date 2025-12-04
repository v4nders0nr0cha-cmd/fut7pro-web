import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";
const REVALIDATE_TOKEN = process.env.PUBLIC_REVALIDATE_TOKEN;

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export async function POST(req: NextRequest) {
  if (REVALIDATE_TOKEN) {
    const provided = req.headers.get("x-revalidate-token") ?? req.headers.get("authorization");
    const cleaned = provided?.replace(/^Bearer\s+/i, "").trim();
    if (!cleaned || cleaned !== REVALIDATE_TOKEN) {
      return json({ error: "Nao autorizado" }, { status: 401 });
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
    return json({ error: "Parametro 'slug' obrigatorio" }, { status: 400 });
  }

  const extraPaths = Array.isArray(payload?.paths)
    ? payload.paths.filter((p: unknown) => typeof p === "string")
    : [];

  try {
    // Revalida a home do racha e os caminhos adicionais informados
    revalidatePath(`/${slug}`);
    extraPaths.forEach((path) => {
      if (typeof path === "string" && path.startsWith("/")) {
        revalidatePath(path);
      }
    });
    return json({ ok: true, slug, extraPaths, timestamp: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao revalidar";
    return json({ error: message }, { status: 500 });
  }
}
