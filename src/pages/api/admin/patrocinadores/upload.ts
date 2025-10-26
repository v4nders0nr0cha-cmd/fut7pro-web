// src/pages/api/admin/patrocinadores/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = { api: { bodyParser: false } };

async function ensureDir(dir: string) { await fs.mkdir(dir, { recursive: true }).catch(() => undefined); }
function randomHash(len = 8) { return Math.random().toString(36).slice(2, 2 + len); }

async function uploadToSupabase(filePath: string, filename: string, opts: { slug?: string; sponsorId?: string; contentType?: string }) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET_SPONSORS || process.env.SUPABASE_BUCKET || 'sponsors';
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) return null;

  const buf = await fs.readFile(filePath);
  const slug = (opts.slug || 'default').replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const nameBase = opts.sponsorId ? `${opts.sponsorId}-${randomHash()}` : `logo-${randomHash(10)}`;
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
  const objectPath = `sponsors/${slug}/${nameBase}.${ext}`.replace(/\s+/g, '-');
  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(SUPABASE_BUCKET)}/${objectPath}`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
      'Content-Type': opts.contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: buf,
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Supabase upload failed: ${resp.status} ${t}`);
  }
  const publicUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(SUPABASE_BUCKET)}/${objectPath}`;
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
    const slug = (fields?.slug as string) || (req.headers['x-tenant-slug'] as string) || 'default';
    const sponsorId = (fields?.sponsorId as string) || undefined;

    try {
      const sup = await uploadToSupabase(file.filepath, file.originalFilename || 'logo.png', { slug, sponsorId, contentType: file.mimetype || undefined });
      if (sup) return res.status(200).json({ url: sup.url });
    } catch (e: any) {
      console.warn('[upload sponsors] supabase failed, using local:', e?.message);
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'sponsors', slug);
    await ensureDir(uploadsDir);
    const ext = path.extname(file.originalFilename || 'logo.png') || '.png';
    const target = path.join(uploadsDir, `${sponsorId || 'logo'}-${randomHash()}${ext}`);
    await fs.copyFile(file.filepath, target);
    const publicPath = target.replace(/.*\public\//, '/').replace(/\\/g, '/');
    return res.status(200).json({ url: publicPath });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Falha no upload' });
  }
}

