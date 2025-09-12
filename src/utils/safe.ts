// src/utils/safe.ts
export const asArray = <T>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : []);

export function get<T, F = undefined>(v: T | null | undefined, fallback?: F): T | F {
  return v ?? (fallback as F);
}

// encadeamento para objetos aninhados sem quebrar
export function pick<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback?: NonNullable<T[K]> | null
): T[K] | null {
  if (!obj) return (fallback ?? null) as any;
  const value = obj[key];
  return (value ?? fallback ?? null) as any;
}
