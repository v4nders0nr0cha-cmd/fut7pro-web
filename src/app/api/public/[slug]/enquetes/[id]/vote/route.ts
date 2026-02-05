import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "@/app/api/_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

async function handleVote(req: NextRequest, context: { params: { slug: string; id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const slug = context.params.slug;
  const id = context.params.id;
  if (!slug) {
    return jsonResponse({ error: "Slug inválido" }, { status: 400 });
  }
  if (!id) {
    return jsonResponse({ error: "ID inválido" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload inválido" }, { status: 400 });
  }

  const headers = buildHeaders(user, slug, { includeContentType: true });
  headers["x-auth-context"] = "athlete";

  const { response, body } = await proxyBackend(
    `${getApiBase()}/public/rachas/${slug}/enquetes/${id}/vote`,
    {
      method: req.method,
      headers,
      body: JSON.stringify(payload),
    }
  );

  return forwardResponse(response.status, body);
}

export async function POST(req: NextRequest, context: { params: { slug: string; id: string } }) {
  return handleVote(req, context);
}

export async function PATCH(req: NextRequest, context: { params: { slug: string; id: string } }) {
  return handleVote(req, context);
}
