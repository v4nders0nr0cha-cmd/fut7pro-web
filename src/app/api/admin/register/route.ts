import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { getApiBase } from "@/lib/get-api-base";
import { requireSuperAdminUser } from "../../_proxy/helpers";

type RegisterPayload = {
  rachaNome?: string;
  rachaSlug?: string;
  cidade?: string;
  estado?: string;
  rachaLogoBase64?: string;
  adminNome: string;
  adminApelido?: string;
  adminPosicao: string;
  adminEmail: string;
  adminSenha?: string;
  adminAvatarBase64?: string;
  existingTenantId?: string;
  existingRachaSlug?: string;
  skipTenantCreate?: boolean;
  autoPassword?: boolean;
};

type TenantInfo = {
  id?: string;
  name?: string;
  slug?: string;
};

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;
const LOGIN_PATH = process.env.AUTH_LOGIN_PATH || "/auth/login";

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
      autoJoinEnabled: true,
      autoApproveAthletes: false,
    }),
  });
}

async function fetchTenantById(baseUrl: string, id: string) {
  return fetch(resolvePath(baseUrl, `/rachas/${encodeURIComponent(id)}`));
}

async function fetchTenantBySlug(baseUrl: string, slug: string) {
  return fetch(resolvePath(baseUrl, `/rachas/slug/${encodeURIComponent(slug)}`));
}

async function resolveExistingTenant(baseUrl: string, payload: RegisterPayload) {
  if (payload.existingTenantId) {
    return fetchTenantById(baseUrl, payload.existingTenantId.trim());
  }
  const slug = payload.existingRachaSlug || payload.rachaSlug;
  if (!slug) return null;
  return fetchTenantBySlug(baseUrl, slug.trim());
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
    }),
  });
}

async function loginForToken(baseUrl: string, data: RegisterPayload) {
  const loginUrl = resolvePath(baseUrl, LOGIN_PATH);
  const res = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.adminEmail.trim().toLowerCase(),
      password: data.adminSenha,
    }),
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return (json as any)?.accessToken || null;
}

async function primeBranding(baseUrl: string, data: RegisterPayload, accessToken?: string | null) {
  if (!accessToken || !data.rachaSlug) return;

  // Guardar logo/avatar apenas se forem leves (limitado a ~1MB em base64)
  const logoTooLarge = data.rachaLogoBase64 && data.rachaLogoBase64.length > 1_000_000;
  const avatarTooLarge = data.adminAvatarBase64 && data.adminAvatarBase64.length > 1_000_000;
  if (logoTooLarge || avatarTooLarge) return;

  const aboutPayload = {
    nome: data.rachaNome?.trim(),
    logoUrl: data.rachaLogoBase64,
    localizacao: {
      cidade: data.cidade?.trim(),
      estado: data.estado?.trim(),
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
  const wantsAutoPassword = Boolean(payload.autoPassword || !payload.adminSenha);
  const requiresSuperAdmin = useExistingTenant || wantsAutoPassword;

  if (requiresSuperAdmin) {
    const user = await requireSuperAdminUser();
    if (!user) return jsonResponse("Nao autorizado", 401);
  }

  if (!payload.adminNome?.trim())
    return jsonResponse("Informe o primeiro nome do administrador.", 400);
  if (payload.adminNome.trim().split(" ").length > 1)
    return jsonResponse("Use apenas o primeiro nome (sem sobrenome).", 400);
  if (!payload.adminPosicao) return jsonResponse("Selecione a posicao do administrador.", 400);
  if (!payload.adminEmail?.trim()) return jsonResponse("Informe o e-mail.", 400);

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

  if (useExistingTenant) {
    const existingRes = await resolveExistingTenant(baseUrl, payload);
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
    if (!payload.cidade?.trim()) return jsonResponse("Informe a cidade.", 400);
    if (!payload.estado?.trim()) return jsonResponse("Selecione o estado.", 400);

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
  }

  if (!payload.rachaSlug?.trim()) {
    return jsonResponse("Slug do racha nao encontrado.", 400);
  }

  // 2) Cria o admin vinculado ao tenant
  const adminRes = await createAdmin(baseUrl, payload);
  const adminBodyText = await adminRes.text();
  const adminJson: any = adminBodyText ? safeJsonParse(adminBodyText) : null;
  if (!adminRes.ok) {
    return jsonResponse(
      adminJson?.message || adminBodyText || "Erro ao criar administrador",
      adminRes.status
    );
  }

  // 3) Faz login se necessario para obter token e salva nome/logo/localizacao via /admin/about
  if (!useExistingTenant) {
    const tokenFromRegister = adminJson?.accessToken || null;
    const token = tokenFromRegister || (await loginForToken(baseUrl, payload));
    await primeBranding(baseUrl, payload, token);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: useExistingTenant
        ? "Presidente criado para racha existente."
        : "Racha e administrador criados com sucesso.",
      tenant: tenantInfo,
      temporaryPassword: generatedPassword || undefined,
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
