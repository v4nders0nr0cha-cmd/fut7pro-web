import { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { jsonResponse, requireUser, resolveTenantSlug } from "../../_proxy/helpers";

const PUBLIC_BUCKET = process.env.SUPABASE_BUCKET_PUBLIC ?? "public-media";
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE ?? 5 * 1024 * 1024);

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceRole) {
    return null;
  }
  supabaseClient = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseClient;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  const tipo = String(formData?.get("type") ?? "banner");

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug"),
    typeof formData?.get("tenantSlug") === "string"
      ? (formData.get("tenantSlug") as string)
      : undefined
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return jsonResponse({ error: "Arquivo obrigatorio" }, { status: 400 });
  }

  if (MAX_FILE_SIZE && file.size > MAX_FILE_SIZE) {
    const limitMb = Math.round((MAX_FILE_SIZE / (1024 * 1024)) * 10) / 10;
    return jsonResponse({ error: `Limite de ${limitMb}MB excedido` }, { status: 413 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return jsonResponse({ error: "Supabase nao configurado" }, { status: 500 });
  }

  const extension =
    file.name
      ?.split(".")
      .pop()
      ?.replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase() || "jpg";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `torneios/${tenantSlug}/${tipo}-${uniqueSuffix}.${extension}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await supabase.storage.from(PUBLIC_BUCKET).upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
      cacheControl: "31536000",
    });

    if (error) {
      return jsonResponse(
        { error: "Falha ao salvar arquivo no storage", details: error.message },
        { status: 500 }
      );
    }

    const storedPath = data?.path ?? path;
    const { data: publicUrlData } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(storedPath);

    return jsonResponse({
      url: publicUrlData?.publicUrl ?? null,
      path: storedPath,
      bucket: PUBLIC_BUCKET,
      type: tipo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao processar upload", details: message }, { status: 500 });
  }
}
