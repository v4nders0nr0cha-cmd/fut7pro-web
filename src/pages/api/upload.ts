// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = { api: { bodyParser: false } };

function randomHash(len = 8) { return Math.random().toString(36).slice(2, 2 + len); }
async function ensureDir(dir: string) { await fs.mkdir(dir, { recursive: true }).catch(() => undefined); }

type Kind = 'sponsorLogo' | 'avatar' | 'championBanner' | 'badge' | 'temp' | 'private' | 'public';

function resolvePath(kind: Kind, params: Record<string,string>): { bucket: string; objectPath: string } {
  const slug = (params.slug || 'default').replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const ext = (params.ext || 'jpg').toLowerCase();
  const hash = randomHash(10);
  const buckets = {
    sponsors: process.env.SUPABASE_BUCKET_SPONSORS || 'sponsors',
    public: process.env.SUPABASE_BUCKET_PUBLIC || 'public-media',
    private: process.env.SUPABASE_BUCKET_PRIVATE || 'private-media',
    temp: process.env.SUPABASE_BUCKET_TEMP || 'temp-uploads',
  };
  switch (kind) {
    case 'sponsorLogo': {
      const sponsorId = params.sponsorId || 'logo';
      return { bucket: buckets.sponsors, objectPath: `sponsors/${slug}/${sponsorId}-${hash}.${ext}` };
    }
    case 'badge': {
      const name = (params.name || `badge-${hash}`).replace(/[^a-z0-9-]/gi, '').toLowerCase();
      return { bucket: buckets.sponsors, objectPath: `badges/${slug}/${name}.${ext}` };
    }
    case 'avatar': {
      const userId = params.userId || 'user';
      return { bucket: buckets.public, objectPath: `avatars/${slug}/${userId}/avatar-${hash}-orig.${ext}` };
    }
    case 'championBanner': {
      const y = params.yyyy || 'yyyy';
      const m = params.MM || 'MM';
      const d = params.DD || 'DD';
      const matchId = params.matchId || 'match';
      return { bucket: buckets.public, objectPath: `matches/${slug}/${y}/${m}/${d}/${matchId}/champions/banner-${hash}.${ext}` };
    }
    case 'private': {
      const y = params.yyyy || 'yyyy';
      const m = params.MM || 'MM';
      const docId = params.docId || 'doc';
      return { bucket: buckets.private, objectPath: `finance/${slug}/${y}/${m}/${docId}.${ext}` };
    }
    case 'temp':
    default: {
      const original = (params.originalName || `upload-${hash}.${ext}`).replace(/\s+/g, '-');
      return { bucket: buckets.temp, objectPath: `${slug}/${randomHash()}-${original}` };
    }
  }
}

async function uploadToSupabase(filePath: string, bucket: string, objectPath: string, contentType?: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) return null;
  const buf = await fs.readFile(filePath);
  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: buf,
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Supabase upload failed: ${resp.status} ${t}`);
  }
  const publicUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}`;
  return { url: publicUrl };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }

  const form = formidable({ multiples: false, maxFileSize: 3 * 1024 * 1024, keepExtensions: true });
  try {
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, flds, fls) => (err ? reject(err) : resolve({ fields: flds, files: fls })));
    });
    const file = (files as any)?.file as formidable.File;
    if (!file?.filepath) return res.status(400).json({ error: 'Arquivo não enviado' });

    const kind = String(fields.kind || '').trim() as Kind;
    const slug = String(fields.slug || req.headers['x-tenant-slug'] || '').trim();
    if (!kind || !slug) return res.status(400).json({ error: 'Parâmetros obrigatórios: kind e slug' });
    const ext = (file.originalFilename?.split('.').pop() || 'jpg').toLowerCase();
    const params: Record<string,string> = {
      slug,
      sponsorId: String(fields.sponsorId || ''),
      userId: String(fields.userId || ''),
      matchId: String(fields.matchId || ''),
      yyyy: String(fields.yyyy || ''),
      MM: String(fields.MM || ''),
      DD: String(fields.DD || ''),
      name: String(fields.name || ''),
      docId: String(fields.docId || ''),
      originalName: file.originalFilename || '',
      ext,
    };
    const { bucket, objectPath } = resolvePath(kind, params);

    try {
      const sup = await uploadToSupabase(file.filepath, bucket, objectPath, file.mimetype || undefined);
      if (sup) return res.status(200).json({ url: sup.url, bucket, objectPath });
    } catch (e: any) {
      console.warn('[upload generic] supabase failed, using local:', e?.message);
    }

    const localDir = path.join(process.cwd(), 'public', bucket, objectPath).replace(/\/[\w.-]+$/, '');
    await ensureDir(localDir);
    const target = path.join(process.cwd(), 'public', bucket, objectPath);
    await ensureDir(path.dirname(target));
    await fs.copyFile(file.filepath, target);
    const publicPath = `/${bucket}/${objectPath}`.replace(/\\/g, '/');
    return res.status(200).json({ url: publicPath, bucket, objectPath });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Falha no upload' });
  }
}

