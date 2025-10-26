import { getBrowserApiBase, getServerApiBase, normalizeBaseUrl } from '@/config/env';

type Method = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
type Json = Record<string, unknown>;
type Opts = {
  method?: Method;
  slug?: string;
  headers?: Record<string,string>;
  body?: Json|FormData;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
};

function urlJoin(base: string, path: string) {
  const b = normalizeBaseUrl(base);
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

function resolveBaseUrl() {
  const base = typeof window !== 'undefined' ? getBrowserApiBase() : getServerApiBase();
  if (!base) throw new Error('API base URL não definido. Configure NEXT_PUBLIC_API_URL e API_URL.');
  return normalizeBaseUrl(base);
}

export async function apiFetch<T=unknown>(path: string, opts: Opts = {}): Promise<T> {
  const url = urlJoin(resolveBaseUrl(), path);
  const isForm = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  const headers: Record<string,string> = { ...(opts.headers||{}) };
  if (!isForm) headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  if (opts.slug) headers['x-tenant-slug'] = opts.slug;

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: isForm ? (opts.body as FormData) : opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: opts.credentials
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (await res.json() as T) : (undefined as unknown as T);
}

