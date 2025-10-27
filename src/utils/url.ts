export function normalizeHttps(url?: string | null): string | null {
  if (!url) return null;
  const raw = String(url).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    u.protocol = 'https:';
    return u.toString();
  } catch {
    return null;
  }
}

export function isAllowedDomain(url: string, allowedCsv?: string | null): boolean {
  if (!allowedCsv) return true;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const allowed = allowedCsv
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return allowed.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function normalizeAndValidateUrl(url?: string | null): string | null {
  const normalized = normalizeHttps(url);
  if (!normalized) return null;
  const mode = (process.env.NEXT_PUBLIC_SPONSOR_DOMAIN_MODE || 'permissive').toLowerCase();
  const allowed = process.env.NEXT_PUBLIC_ALLOWED_SPONSOR_DOMAINS || '';
  if (mode === 'strict' && allowed) {
    if (!isAllowedDomain(normalized, allowed)) return null;
  }
  return normalized;
}
