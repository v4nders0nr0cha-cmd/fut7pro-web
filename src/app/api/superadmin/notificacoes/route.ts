import { NextResponse } from 'next/server';
import { loadSuperadminNotifications } from '@/server/superadmin/notificacoes';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const itens = await loadSuperadminNotifications();
    const response = NextResponse.json({ itens });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('[superadmin-notificacoes]', error);
    const response = NextResponse.json({ error: 'Erro ao carregar notificacoes' }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
}
