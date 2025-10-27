// src/pages/api/admin/atletas/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

// Desabilita o bodyParser para conseguirmos encaminhar multipart/form-data (upload de imagem)
export const config = {
  api: {
    bodyParser: false,
  },
};

function getBackendBase(): string {
  const base =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://127.0.0.1:3333";
  return String(base).replace(/\/$/, "");
}

function pickTenantSlug(session: any): string | undefined {
  return session?.user?.tenantSlug || (session as any)?.tenantSlug || session?.user?.rachaSlug;
}

async function forwardJson(
  req: NextApiRequest,
  res: NextApiResponse,
  url: string,
  accessToken: string,
  tenantSlug?: string,
) {
  const init: RequestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
    },
    cache: "no-store",
  };

  const upstream = await fetch(url, init);
  const text = await upstream.text();
  res.status(upstream.status);
  // Propaga content-type quando presente
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("content-type", ct);
  res.send(text);
}

async function forwardStream(
  req: NextApiRequest,
  res: NextApiResponse,
  url: string,
  accessToken: string,
  tenantSlug?: string,
) {
  // Copia content-type original (com boundary) e repassa Authorization/x-tenant
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const contentType = req.headers["content-type"];
  if (typeof contentType === "string") headers["content-type"] = contentType;
  if (tenantSlug) headers["x-tenant-slug"] = tenantSlug;

  const upstream = await fetch(url, {
    method: "PUT",
    // @ts-expect-error duplex é necessário para streaming no Node.js
    duplex: "half",
    headers,
    // Repassa o stream bruto (multipart/form-data)
    body: req as any,
    cache: "no-store",
  });

  // Propaga status/headers relevantes e corpo como buffer
  res.status(upstream.status);
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("content-type", ct);
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true }).catch(() => undefined);
}

function toWebPath(filePath: string) {
  // Converte um caminho absoluto dentro de public/ para URL começando com "/"
  const idx = filePath.replace(/\\/g, "/").lastIndexOf("/public/");
  if (idx >= 0) return filePath.replace(/.*\/public\//, "/");
  return filePath;
}

async function handleLocalGet(email: string) {
  // Buscar jogador por email; se não houver, cria um mínimo
  const jogador = await prisma.jogador.upsert({
    where: { email },
    update: {},
    create: {
      email,
      nome: "Presidente Fut7Pro",
      apelido: "",
      posicao: "ATACANTE",
      status: "ativo",
    },
  });
  const racha = await prisma.racha.findFirst({ where: { owner: { email } }, select: { slug: true } });
  return {
    id: jogador.id,
    nome: jogador.nome,
    apelido: jogador.apelido,
    slug: racha?.slug ?? "",
    foto: jogador.foto ?? "/images/Perfil-sem-Foto-Fut7.png",
    posicao: jogador.posicao,
    status: jogador.status ?? "Ativo",
    mensalista: false,
    totalJogos: 0,
    estatisticas: { historico: { jogos: 0, gols: 0, assistencias: 0, campeaoDia: 0, mediaVitorias: 0, pontuacao: 0 }, anual: {} },
    historico: [],
    conquistas: { titulosGrandesTorneios: [], titulosAnuais: [], titulosQuadrimestrais: [] },
    icones: [],
  };
}

async function handleLocalPut(req: any, email: string, userId: string) {
  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024, keepExtensions: true });
  const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, flds, fls) => (err ? reject(err) : resolve({ fields: flds, files: fls })));
  });

  const nome = String(fields.nome ?? "").trim();
  const apelido = String(fields.apelido ?? "").trim();
  const posicao = String(fields.posicao ?? "").trim();
  const removerFoto = String(fields.removerFoto ?? "").toLowerCase() === "true";
  const fotoUrlField = typeof (fields as any).fotoUrl === "string" ? String((fields as any).fotoUrl) : undefined;

  // Atualiza usuario/jogador
  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { nome: nome || undefined, apelido: apelido || undefined },
    create: { id: userId, email, nome: nome || "Administrador Demo", apelido: apelido || "Admin", role: "PRESIDENTE", status: "ativo" },
  });

  let fotoUrl: string | null = null;
  const file = (files as any)?.foto as formidable.File | undefined;
  if (fotoUrlField && typeof fotoUrlField === "string") {
    fotoUrl = fotoUrlField;
  } else if (file && file.filepath) {
    const bufferPath = file.filepath;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "admin", usuario.id);
    await ensureDir(uploadsDir);
    const ext = path.extname(file.originalFilename || "avatar.jpg") || ".jpg";
    const target = path.join(uploadsDir, `avatar${ext}`);
    await fs.copyFile(bufferPath, target);
    fotoUrl = toWebPath(target);
  } else if (removerFoto) {
    fotoUrl = "/images/Perfil-sem-Foto-Fut7.png";
  }

  const jogador = await prisma.jogador.upsert({
    where: { email },
    update: {
      nome: nome || undefined,
      apelido: apelido || undefined,
      posicao: posicao || undefined,
      foto: fotoUrl ?? undefined,
    },
    create: {
      email,
      nome: nome || "Presidente Fut7Pro",
      apelido: apelido || "",
      posicao: posicao || "ATACANTE",
      status: "ativo",
      foto: fotoUrl ?? undefined,
    },
  });

  return {
    id: jogador.id,
    nome: jogador.nome,
    apelido: jogador.apelido,
    foto: jogador.foto ?? undefined,
    posicao: jogador.posicao,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !(session as any).accessToken) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const base = getBackendBase();
  const url = `${base}/api/admin/atletas/me${req.method === "GET" ? (req.url?.includes("?") ? req.url?.slice(req.url.indexOf("?")) : "") : ""}`;
  const tenantSlug = pickTenantSlug(session);
  const token = (session as any).accessToken as string;

  try {
    const isLocalTest = token === "local-test-token";
    if (isLocalTest) {
      const email = (session.user as any)?.email as string;
      if (req.method === "GET") {
        const data = await handleLocalGet(email);
        return res.status(200).json(data);
      }
      if (req.method === "PUT") {
        const data = await handleLocalPut(req, email, (session.user as any)?.id as string);
        return res.status(200).json(data);
      }
    }
    switch (req.method) {
      case "GET":
        await forwardJson(req, res, url, token, tenantSlug);
        return;
      case "PUT":
        await forwardStream(req, res, `${base}/api/admin/atletas/me`, token, tenantSlug);
        return;
      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        return res.status(405).json({ error: `Método ${req.method} não permitido` });
    }
  } catch (error: any) {
    const message = error?.message || "Falha ao contatar backend";
    return res.status(502).json({ error: message });
  }
}

