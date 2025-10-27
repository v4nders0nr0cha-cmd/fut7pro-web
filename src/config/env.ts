export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  API_URL: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '',
} as const;

export function normalizeBaseUrl(u: string): string {
  return u.endsWith('/') ? u.slice(0, -1) : u;
}

export function getBrowserApiBase(): string {
  if (typeof window !== 'undefined') {
    return ENV.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.host}`;
  }
  return ENV.API_URL || ENV.NEXT_PUBLIC_API_URL || '';
}

export function getServerApiBase(): string {
  return ENV.API_URL || ENV.NEXT_PUBLIC_API_URL || '';
}

// Compat: alguns módulos esperam default export com apiUrl
const defaultExport = {
  apiUrl: ENV.API_URL || ENV.NEXT_PUBLIC_API_URL || '',
};

export default defaultExport;
