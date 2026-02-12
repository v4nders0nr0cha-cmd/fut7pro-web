import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { requireUser } from "../../_proxy/helpers";

type RegisterGooglePayload = {
  rachaNome?: string;
  rachaSlug?: string;
  cidadeNome?: string;
  cidadeIbgeCode?: string;
  estadoUf?: string;
  rachaLogoBase64?: string;
  adminNome?: string;
  adminApelido?: string;
  adminPosicao?: string;
  adminEmail?: string;
  adminSenha?: string;
  adminAvatarBase64?: string;
  planKey?: string;
  couponCode?: string;
};

const SLUG_REGEX = /^[a-z0-9-]{3,30}$/;
const MAX_INLINE_IMAGE_LENGTH = 1_500_000;
const RESERVED_SLUGS = new Set([
  "admin",
  "superadmin",
  "superadmin-auth",
  "api",
  "auth",
  "login",
  "cadastrar-racha",
  "public",
  "images",
  "img",
  "static",
  "assets",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
  "_next",
  "health",
  "revalidate",
  "app",
  "www",
]);

const normalizeBase = (url: string) => url.replace(/\/+$/, "");
const resolvePath = (base: string, path: string) =>
  `${normalizeBase(base)}${path.startsWith("/") ? path : `/${path}`}`;

function jsonResponse(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function resolveAvatarUrl(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_INLINE_IMAGE_LENGTH) return undefined;
  return trimmed;
}

async function primeBranding(
  baseUrl: string,
  data: RegisterGooglePayload,
  accessToken?: string | null
) {
  if (!accessToken || !data.rachaSlug) return;

  // Guardar branding mesmo quando apenas um dos arquivos estiver acima do limite.
  // Se um campo estourar o tamanho, ele é descartado isoladamente sem abortar todo o payload.
  const logoTooLarge =
    data.rachaLogoBase64 && data.rachaLogoBase64.length > MAX_INLINE_IMAGE_LENGTH;
  const avatarTooLarge =
    data.adminAvatarBase64 && data.adminAvatarBase64.length > MAX_INLINE_IMAGE_LENGTH;

  const aboutPayload = {
    nome: data.rachaNome?.trim(),
    logoUrl: logoTooLarge ? undefined : data.rachaLogoBase64,
    localizacao: {
      cidade: data.cidadeNome?.trim(),
      estado: data.estadoUf?.trim()?.toUpperCase(),
    },
    presidente: {
      nome: data.adminNome?.trim(),
      apelido: data.adminApelido?.trim() || null,
      posicao: data.adminPosicao,
      avatarUrl: avatarTooLarge ? null : data.adminAvatarBase64 || null,
      email: data.adminEmail?.trim()?.toLowerCase(),
    },
  };

  await fetch(resolvePath(baseUrl, "/admin/about"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-tenant-slug": data.rachaSlug.trim(),
    },
    body: JSON.stringify({ data: aboutPayload }),
  });
}

async function createSubscription(
  baseUrl: string,
  data: RegisterGooglePayload,
  tenantId: string,
  accessToken: string
) {
  const planKey = data.planKey?.trim();
  if (!planKey) return null;
  const tenantSlug = data.rachaSlug?.trim();

  return fetch(resolvePath(baseUrl, "/billing/subscription"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
    },
    body: JSON.stringify({
      tenantId,
      planKey,
      payerEmail: data.adminEmail?.trim()?.toLowerCase(),
      couponCode: data.couponCode?.trim() || undefined,
    }),
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user?.accessToken) return jsonResponse("Nao autorizado", 401);

  const baseUrl = normalizeBase(getApiBase());
  let payload: RegisterGooglePayload;

  try {
    payload = (await req.json()) as RegisterGooglePayload;
  } catch {
    return jsonResponse("Payload invalido", 400);
  }

  const adminEmail = (user.email || payload.adminEmail || "").trim().toLowerCase();
  payload.adminEmail = adminEmail;

  if (!payload.adminNome?.trim())
    return jsonResponse("Informe o primeiro nome do administrador.", 400);
  if (payload.adminNome.trim().split(" ").length > 1)
    return jsonResponse("Use apenas o primeiro nome (sem sobrenome).", 400);
  if (!payload.adminPosicao) return jsonResponse("Selecione a posicao do administrador.", 400);
  if (!adminEmail) return jsonResponse("E-mail do administrador nao encontrado.", 400);
  if (!payload.planKey?.trim()) return jsonResponse("Selecione um plano para continuar.", 400);

  if (!payload.rachaNome?.trim() || payload.rachaNome.trim().length < 3)
    return jsonResponse("O nome do racha deve ter ao menos 3 caracteres.", 400);
  if (!payload.rachaSlug?.trim() || !SLUG_REGEX.test(payload.rachaSlug.trim()))
    return jsonResponse("Slug invalido: use minusculas, numeros e hifens (3-30).", 400);
  if (RESERVED_SLUGS.has(payload.rachaSlug.trim().toLowerCase()))
    return jsonResponse("Slug invalido: reservado.", 400);
  if (!payload.estadoUf?.trim()) return jsonResponse("Selecione o estado.", 400);
  if (!payload.cidadeNome?.trim()) return jsonResponse("Informe a cidade.", 400);

  if (payload.adminSenha && payload.adminSenha.trim().length < 6) {
    return jsonResponse("A senha deve ter ao menos 6 caracteres.", 400);
  }

  const res = await fetch(resolvePath(baseUrl, "/auth/google/tenant"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.accessToken}`,
    },
    body: JSON.stringify({
      rachaNome: payload.rachaNome.trim(),
      rachaSlug: payload.rachaSlug.trim(),
      cidadeNome: payload.cidadeNome.trim(),
      cidadeIbgeCode: payload.cidadeIbgeCode?.trim() || undefined,
      estadoUf: payload.estadoUf.trim().toUpperCase(),
      adminNome: payload.adminNome.trim(),
      adminApelido: payload.adminApelido?.trim() || undefined,
      adminPosicao: payload.adminPosicao,
      adminSenha: payload.adminSenha?.trim() || undefined,
      adminAvatarUrl: resolveAvatarUrl(payload.adminAvatarBase64),
    }),
  });

  const bodyText = await res.text();
  const body = bodyText ? safeJsonParse(bodyText) : null;
  if (!res.ok) {
    return jsonResponse(body?.message || bodyText || "Erro ao criar racha", res.status);
  }

  const accessToken = body?.accessToken || user.accessToken;
  const refreshToken = body?.refreshToken || null;
  await primeBranding(baseUrl, payload, accessToken);

  if (!accessToken || !body?.tenantId) {
    return jsonResponse("Nao foi possivel iniciar o teste gratis.", 500);
  }

  const subscriptionRes = await createSubscription(baseUrl, payload, body.tenantId, accessToken);
  if (subscriptionRes) {
    const subscriptionText = await subscriptionRes.text();
    if (!subscriptionRes.ok) {
      return jsonResponse(
        (safeJsonParse(subscriptionText) as any)?.message ||
          subscriptionText ||
          "Erro ao criar assinatura",
        subscriptionRes.status
      );
    }
  }

  const requiresEmailVerification = body?.requiresEmailVerification ?? false;
  const verificationSent = body?.verificationSent ?? false;
  const tenantSlug = body?.tenantSlug || payload.rachaSlug?.trim() || null;

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Racha criado com sucesso.",
      tenant: body?.tenant,
      tenantId: body?.tenantId,
      tenantSlug,
      requiresEmailVerification,
      verificationSent,
      email: adminEmail,
      name: payload.adminNome?.trim(),
      accessToken,
      refreshToken,
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
