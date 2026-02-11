import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { getApiBase } from "@/lib/get-api-base";
import { requireSuperAdminUser } from "../../_proxy/helpers";

type RegisterPayload = {
  rachaNome?: string;
  rachaSlug?: string;
  cidadeNome?: string;
  cidadeIbgeCode?: string;
  estadoUf?: string;
  rachaLogoBase64?: string;
  adminNome: string;
  adminApelido?: string;
  adminPosicao: string;
  adminEmail: string;
  adminSenha?: string;
  adminAvatarBase64?: string;
  planKey?: string;
  couponCode?: string;
  existingTenantId?: string;
  existingRachaSlug?: string;
  skipTenantCreate?: boolean;
  autoPassword?: boolean;
  useExistingGlobalAccount?: boolean;
};

type TenantInfo = {
  id?: string;
  name?: string;
  slug?: string;
};

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;
const MAX_INLINE_IMAGE_LENGTH = 1_500_000;
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

function shouldUseExisting(payload: RegisterPayload) {
  return Boolean(payload.existingTenantId || payload.existingRachaSlug || payload.skipTenantCreate);
}

function generatePassword(length = 12) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((byte) => charset[byte % charset.length])
    .join("");
}

async function createTenant(baseUrl: string, data: RegisterPayload) {
  return fetch(resolvePath(baseUrl, "/rachas"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.rachaNome?.trim(),
      slug: data.rachaSlug?.trim(),
      subdomain: data.rachaSlug?.trim(),
      estadoUf: data.estadoUf?.trim()?.toUpperCase(),
      cidadeNome: data.cidadeNome?.trim(),
      cidadeIbgeCode: data.cidadeIbgeCode?.trim() || undefined,
      autoJoinEnabled: true,
      autoApproveAthletes: false,
    }),
  });
}

async function deleteTenant(baseUrl: string, id: string) {
  return fetch(resolvePath(baseUrl, `/rachas/${encodeURIComponent(id)}`), {
    method: "DELETE",
  });
}

async function fetchTenantById(baseUrl: string, id: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(resolvePath(baseUrl, `/rachas/${encodeURIComponent(id)}`), { headers });
}

async function fetchTenantBySlug(baseUrl: string, slug: string, accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(resolvePath(baseUrl, `/rachas/slug/${encodeURIComponent(slug)}`), { headers });
}

async function resolveExistingTenant(
  baseUrl: string,
  payload: RegisterPayload,
  accessToken?: string
) {
  if (payload.existingTenantId) {
    return fetchTenantById(baseUrl, payload.existingTenantId.trim(), accessToken);
  }
  const slug = payload.existingRachaSlug || payload.rachaSlug;
  if (!slug) return null;
  return fetchTenantBySlug(baseUrl, slug.trim(), accessToken);
}

async function createAdmin(baseUrl: string, data: RegisterPayload) {
  return fetch(resolvePath(baseUrl, "/auth/register-admin"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.adminNome.trim(),
      email: data.adminEmail.trim().toLowerCase(),
      password: data.adminSenha,
      rachaSlug: data.rachaSlug?.trim(),
      apelido: data.adminApelido?.trim() || undefined,
      posicao: data.adminPosicao,
      avatarUrl: resolveAvatarUrl(data.adminAvatarBase64),
    }),
  });
}

async function primeBranding(baseUrl: string, data: RegisterPayload, accessToken?: string | null) {
  if (!accessToken || !data.rachaSlug) return;

  // Guardar logo/avatar apenas se forem leves (limitado a ~1MB em base64)
  const logoTooLarge =
    data.rachaLogoBase64 && data.rachaLogoBase64.length > MAX_INLINE_IMAGE_LENGTH;
  const avatarTooLarge =
    data.adminAvatarBase64 && data.adminAvatarBase64.length > MAX_INLINE_IMAGE_LENGTH;
  if (logoTooLarge || avatarTooLarge) return;

  const aboutPayload = {
    nome: data.rachaNome?.trim(),
    logoUrl: data.rachaLogoBase64,
    localizacao: {
      cidade: data.cidadeNome?.trim(),
      estado: data.estadoUf?.trim()?.toUpperCase(),
    },
    presidente: {
      nome: data.adminNome.trim(),
      apelido: data.adminApelido?.trim() || null,
      posicao: data.adminPosicao,
      avatarUrl: data.adminAvatarBase64 || null,
      email: data.adminEmail.trim().toLowerCase(),
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
  data: RegisterPayload,
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
      payerEmail: data.adminEmail.trim().toLowerCase(),
      couponCode: data.couponCode?.trim() || undefined,
    }),
  });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const baseUrl = normalizeBase(getApiBase());
  let payload: RegisterPayload;

  try {
    payload = (await req.json()) as RegisterPayload;
  } catch {
    return jsonResponse("Payload invalido", 400);
  }

  const useExistingTenant = shouldUseExisting(payload);
  const useExistingGlobalAccount = Boolean(payload.useExistingGlobalAccount);
  const wantsAutoPassword = Boolean(payload.autoPassword || !payload.adminSenha);
  const requiresSuperAdmin = useExistingTenant || wantsAutoPassword;

  let superAdminUser: { accessToken?: string } | null = null;
  if (requiresSuperAdmin) {
    superAdminUser = await requireSuperAdminUser();
    if (!superAdminUser) return jsonResponse("Nao autorizado", 401);
  }

  if (!payload.adminNome?.trim())
    return jsonResponse("Informe o primeiro nome do administrador.", 400);
  if (payload.adminNome.trim().split(" ").length > 1)
    return jsonResponse("Use apenas o primeiro nome (sem sobrenome).", 400);
  if (!payload.adminPosicao) return jsonResponse("Selecione a posicao do administrador.", 400);
  if (!payload.adminEmail?.trim()) return jsonResponse("Informe o e-mail.", 400);
  if (!useExistingTenant && !payload.planKey?.trim())
    return jsonResponse("Selecione um plano para continuar.", 400);

  let generatedPassword: string | null = null;
  if (!payload.adminSenha) {
    if (!wantsAutoPassword) {
      return jsonResponse("A senha deve ter ao menos 6 caracteres.", 400);
    }
    generatedPassword = generatePassword();
    payload.adminSenha = generatedPassword;
  }

  const adminSenha = payload.adminSenha || "";
  if (adminSenha.length < 6) {
    return jsonResponse("A senha deve ter ao menos 6 caracteres.", 400);
  }

  let tenantInfo: TenantInfo | null = null;
  let createdTenantId: string | null = null;

  if (useExistingTenant) {
    const existingRes = await resolveExistingTenant(baseUrl, payload, superAdminUser?.accessToken);
    if (!existingRes) {
      return jsonResponse("Informe o racha existente.", 400);
    }
    const existingText = await existingRes.text();
    if (!existingRes.ok) {
      const body = safeJsonParse(existingText);
      return jsonResponse(
        body?.message || existingText || "Racha nao encontrado",
        existingRes.status
      );
    }
    const existing = (existingText ? safeJsonParse(existingText) : null) as TenantInfo | null;
    tenantInfo = existing;
    payload.rachaSlug = payload.rachaSlug || existing?.slug || payload.existingRachaSlug;
    payload.rachaNome = payload.rachaNome || existing?.name || payload.rachaSlug;
  } else {
    if (!payload.rachaNome?.trim() || payload.rachaNome.trim().length < 3)
      return jsonResponse("O nome do racha deve ter ao menos 3 caracteres.", 400);
    if (!payload.rachaSlug?.trim() || !SLUG_REGEX.test(payload.rachaSlug.trim()))
      return jsonResponse("Slug invalido: use minusculas, numeros e hifens (3-50).", 400);
    if (!payload.estadoUf?.trim()) return jsonResponse("Selecione o estado.", 400);
    if (!payload.cidadeNome?.trim()) return jsonResponse("Informe a cidade.", 400);

    // 1) Cria o tenant/racha
    const tenantRes = await createTenant(baseUrl, payload);
    const tenantBodyText = await tenantRes.text();
    if (!tenantRes.ok) {
      const body = safeJsonParse(tenantBodyText);
      return jsonResponse(
        body?.message || tenantBodyText || "Erro ao criar racha",
        tenantRes.status
      );
    }
    tenantInfo = tenantBodyText ? safeJsonParse(tenantBodyText) : null;
    createdTenantId = tenantInfo?.id || null;
  }

  if (!payload.rachaSlug?.trim()) {
    return jsonResponse("Slug do racha nao encontrado.", 400);
  }

  // 2) Cria o admin vinculado ao tenant
  const adminRes = await createAdmin(baseUrl, payload);
  const adminBodyText = await adminRes.text();
  const adminJson: any = adminBodyText ? safeJsonParse(adminBodyText) : null;
  if (!adminRes.ok) {
    if (createdTenantId) {
      try {
        await deleteTenant(baseUrl, createdTenantId);
      } catch {
        // ignore cleanup errors
      }
    }
    return jsonResponse(
      adminJson?.message || adminBodyText || "Erro ao criar administrador",
      adminRes.status
    );
  }

  // 3) Faz login se necessario para obter token e salva nome/logo/localizacao via /admin/about
  const accessToken = typeof adminJson?.accessToken === "string" ? adminJson.accessToken : null;
  const requiresEmailVerification = adminJson?.requiresEmailVerification ?? false;
  const effectiveRequiresEmailVerification = useExistingGlobalAccount
    ? false
    : requiresEmailVerification;
  const verificationSent = adminJson?.verificationSent ?? false;
  const adminEmail = adminJson?.email || payload.adminEmail?.trim().toLowerCase();
  const tenantSlug = tenantInfo?.slug || payload.rachaSlug?.trim();
  const refreshToken = typeof adminJson?.refreshToken === "string" ? adminJson.refreshToken : null;

  if (!useExistingTenant) {
    if (!accessToken) {
      return jsonResponse("Nao foi possivel iniciar o teste gratis.", 500);
    }
    await primeBranding(baseUrl, payload, accessToken);

    if (!tenantInfo?.id) {
      return jsonResponse("Tenant nao encontrado para criar assinatura.", 500);
    }

    const subscriptionRes = await createSubscription(baseUrl, payload, tenantInfo.id, accessToken);
    if (subscriptionRes) {
      const subscriptionText = await subscriptionRes.text();
      if (!subscriptionRes.ok) {
        const body = safeJsonParse(subscriptionText);
        return jsonResponse(
          body?.message || subscriptionText || "Erro ao criar assinatura",
          subscriptionRes.status
        );
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: useExistingTenant
        ? "Presidente criado para racha existente."
        : "Racha e administrador criados com sucesso.",
      tenant: tenantInfo,
      tenantSlug: tenantSlug || undefined,
      requiresEmailVerification: effectiveRequiresEmailVerification,
      verificationSent,
      email: adminEmail,
      temporaryPassword: generatedPassword || undefined,
      accessToken: useExistingGlobalAccount ? accessToken || undefined : undefined,
      refreshToken: useExistingGlobalAccount ? refreshToken || undefined : undefined,
      useExistingGlobalAccount,
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
