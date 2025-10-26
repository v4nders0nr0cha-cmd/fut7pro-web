// src/app/api/revalidate/sponsors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body?.slug || '').trim();
    if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 });
    revalidateTag(`sponsors:${slug}`);
    revalidateTag(`footer:${slug}`);
    return NextResponse.json({ revalidated: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Falha ao revalidar' }, { status: 500 });
  }
}

