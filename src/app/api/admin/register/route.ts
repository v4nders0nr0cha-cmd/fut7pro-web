import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

type RegisterPayload = {
  rachaNome: string;
  rachaSlug: string;
  cidade?: string;
  estado?: string;
  rachaLogoBase64?: string;
  adminNome: string;
  adminApelido?: string;
  adminPosicao: string;
  adminEmail: string;
  adminSenha: string;
  adminAvatarBase64?: string;
};

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

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

async function createTenant(baseUrl: string, data: RegisterPayload) {
  return fetch(`${baseUrl}/rachas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.rachaNome.trim(),
      slug: data.rachaSlug.trim(),
      subdomain: data.rachaSlug.trim(),
      autoJoinEnabled: true,
      autoApproveAthletes: false,
    }),
  });
}

async function createAdmin(baseUrl: string, data: RegisterPayload) {
  return fetch(`${baseUrl}/auth/register-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.adminNome.trim(),
      email: data.adminEmail.trim().toLowerCase(),
      password: data.adminSenha,
      rachaSlug: data.rachaSlug.trim(),
    }),
  });
}

async function primeBranding(baseUrl: string, data: RegisterPayload, accessToken?: string) {
  if (!accessToken) return;

  // Guardar logo/avatar apenas se não forem muito grandes (1MB base64 ~ limita)
  const logoTooLarge = data.rachaLogoBase64 && data.rachaLogoBase64.length > 1_000_000;
  const avatarTooLarge = data.adminAvatarBase64 && data.adminAvatarBase64.length > 1_000_000;
  if (logoTooLarge || avatarTooLarge) return;

  const aboutPayload = {
    nome: data.rachaNome.trim(),
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

  await fetch(`${baseUrl}/admin/about`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-tenant-slug": data.rachaSlug.trim(),
    },
    body: JSON.stringify(aboutPayload),
  });
}

export async function POST(req: NextRequest) {
  const baseUrl = getApiBase();
  let payload: RegisterPayload;

  try {
    payload = (await req.json()) as RegisterPayload;
  } catch {
    return jsonResponse("Payload inválido", 400);
  }

  if (!payload.adminNome?.trim())
    return jsonResponse("Informe o primeiro nome do administrador.", 400);
  if (!payload.adminPosicao) return jsonResponse("Selecione a posição do administrador.", 400);
  if (!payload.adminEmail?.trim()) return jsonResponse("Informe o e-mail.", 400);
  if (!payload.adminSenha || payload.adminSenha.length < 6)
    return jsonResponse("A senha deve ter ao menos 6 caracteres.", 400);
  if (!payload.rachaNome?.trim() || payload.rachaNome.trim().length < 3)
    return jsonResponse("O nome do racha deve ter ao menos 3 caracteres.", 400);
  if (!payload.rachaSlug?.trim() || !SLUG_REGEX.test(payload.rachaSlug.trim()))
    return jsonResponse("Slug inválido: use minúsculas, números e hífens (3-50).", 400);
  if (!payload.cidade?.trim()) return jsonResponse("Informe a cidade.", 400);
  if (!payload.estado?.trim()) return jsonResponse("Selecione o estado.", 400);

  // 1) Cria o tenant/racha
  const tenantRes = await createTenant(baseUrl, payload);
  const tenantBodyText = await tenantRes.text();
  if (!tenantRes.ok) {
    const body = safeJsonParse(tenantBodyText);
    return jsonResponse(body?.message || tenantBodyText || "Erro ao criar racha", tenantRes.status);
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

  // 3) Salva nome/logo/localização via /admin/about usando token retornado
  await primeBranding(baseUrl, payload, adminJson?.accessToken);

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Racha e administrador criados com sucesso.",
      tenant: tenantBodyText ? safeJsonParse(tenantBodyText) : null,
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
