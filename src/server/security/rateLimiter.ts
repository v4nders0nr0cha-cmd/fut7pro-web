/**
 * Rate limiter simples usando token bucket in-memory.
 * Para produção com múltiplas instâncias, use Redis ou similar.
 */

type Key = string;

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<Key, Bucket>();

/**
 * Valida se requisição pode ser processada dentro do rate limit.
 *
 * @param key Identificador único (ex: "publish:userId")
 * @param capacity Capacidade máxima de tokens (requisições)
 * @param refillPerSec Taxa de recarga de tokens por segundo
 * @returns true se requisição é permitida, false se excede limite
 *
 * @example
 * ```typescript
 * if (!rateLimit(`publish:${userId}`, 5, 1)) {
 *   return res.status(429).json({ error: "Muitas requisições" });
 * }
 * ```
 */
export function rateLimit(key: Key, capacity = 5, refillPerSec = 1): boolean {
  const now = Date.now();
  const state = buckets.get(key) ?? {
    tokens: capacity,
    updatedAt: now,
  };

  // Calcular tokens recuperados desde última verificação
  const elapsed = (now - state.updatedAt) / 1000;
  state.tokens = Math.min(capacity, state.tokens + elapsed * refillPerSec);
  state.updatedAt = now;

  // Verificar se há tokens disponíveis
  if (state.tokens < 1) {
    buckets.set(key, state);
    return false;
  }

  // Consumir 1 token
  state.tokens -= 1;
  buckets.set(key, state);
  return true;
}

/**
 * Limpa buckets antigos periodicamente para evitar memory leak.
 * Chame isso em um cron job ou similar.
 */
export function cleanupOldBuckets(maxAgeMs = 3600000): void {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.updatedAt > maxAgeMs) {
      buckets.delete(key);
    }
  }
}

// Limpeza automática a cada 30 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => cleanupOldBuckets(), 1800000);
}
